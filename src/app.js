import { addWatermarkToPdfBytes } from "./pdf-watermark.mjs";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  createWatermarkTiles,
  getCanvasRotationRadians,
  getPreviewPageNumbers,
  hexToRgb,
  makeOutputFileName,
  normalizeWatermarkSettings,
} from "./watermark-core.mjs";
import { getInitialLanguage, translate } from "./i18n.mjs";
import { loadStoredWatermarkSettings, saveWatermarkSettings } from "./settings-storage.mjs";
import "./styles.css";

const generateForm = document.querySelector("#generate-form");
const fileInput = document.querySelector("#pdf-file");
const fileMeta = document.querySelector("#file-meta");
const textInput = document.querySelector("#watermark-text");
const colorInput = document.querySelector("#watermark-color");
const fontSizeInput = document.querySelector("#font-size");
const gapInput = document.querySelector("#gap");
const opacityInput = document.querySelector("#opacity");
const fontSizeValue = document.querySelector("#font-size-value");
const gapValue = document.querySelector("#gap-value");
const opacityValue = document.querySelector("#opacity-value");
const generateButton = document.querySelector("#generate-button");
const downloadLink = document.querySelector("#download-link");
const statusText = document.querySelector("#status");
const previewState = document.querySelector("#preview-state");
const previewCanvas = document.querySelector("#watermark-preview");
const previewStage = document.querySelector(".preview-stage");
const previewScroll = document.querySelector(".preview-scroll");
const previewContext = previewCanvas.getContext("2d");
const languageButtons = [...document.querySelectorAll("[data-language]")];
const colorSwatches = [...document.querySelectorAll("[data-color]")];

let language = loadLanguage();
let selectedFile = null;
let selectedPdfBytes = null;
let previewPages = [];
let downloadUrl = "";
let isProcessing = false;
let renderSequence = 0;
let statusKey = "statusSelectFile";
let statusValues = {};
let statusError = false;
let previewStateKey = "statusNoPreview";
let previewStateValues = {};

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

fileInput.addEventListener("change", handleFileChange);
generateForm.addEventListener("submit", handleGenerate);
window.addEventListener("beforeunload", revokeDownloadUrl);

for (const input of [textInput, colorInput, fontSizeInput, gapInput, opacityInput]) {
  input.addEventListener("input", updateControls);
}

for (const button of languageButtons) {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
}

for (const swatch of colorSwatches) {
  swatch.addEventListener("click", () => {
    colorInput.value = swatch.dataset.color;
    updateControls();
  });
}

if ("ResizeObserver" in window) {
  new ResizeObserver(() => drawPreview(readSettings())).observe(previewScroll);
} else {
  window.addEventListener("resize", () => drawPreview(readSettings()));
}

applyStoredSettings(loadStoredWatermarkSettings(localStorage));
applyTranslations();
updateControls({ persist: false });
ensureLibrariesReady();

async function handleFileChange() {
  renderSequence += 1;
  const sequence = renderSequence;

  selectedFile = fileInput.files?.[0] ?? null;
  selectedPdfBytes = null;
  previewPages = [];
  downloadLink.hidden = true;
  revokeDownloadUrl();
  updateFileMeta();
  updateGenerateAvailability();

  if (!selectedFile) {
    setStatus("statusSelectFile");
    setPreviewState("statusNoPreview");
    drawPreview(readSettings());
    return;
  }

  setStatus("statusLoadingPreview");
  setPreviewState("statusLoadingPreview");
  drawPreview(readSettings());

  try {
    const bytes = new Uint8Array(await selectedFile.arrayBuffer());
    selectedPdfBytes = bytes;
    const previewResult = await renderPreviewPages(bytes, sequence);

    if (sequence === renderSequence) {
      setStatus("statusReady");
      setPreviewState("statusPreviewReady", previewResult);
    }
  } catch (error) {
    if (sequence === renderSequence) {
      setStatus("errorPreview", {}, true);
      setPreviewState("errorPreview");
      drawPreview(readSettings());
    }
  } finally {
    updateGenerateAvailability();
  }
}

async function handleGenerate(event) {
  event.preventDefault();

  if (!selectedFile || !selectedPdfBytes) {
    setStatus("statusSelectFile", {}, true);
    return;
  }

  setBusy(true);
  setStatus("statusProcessing");
  downloadLink.hidden = true;
  revokeDownloadUrl();

  try {
    const settings = readSettings();
    const outputBytes = await addWatermarkToPdfBytes(selectedPdfBytes, settings);
    const blob = new Blob([outputBytes], { type: "application/pdf" });

    downloadUrl = URL.createObjectURL(blob);
    downloadLink.href = downloadUrl;
    downloadLink.download = makeOutputFileName(selectedFile.name);
    downloadLink.hidden = false;
    setStatus("statusDone");
  } catch (error) {
    setStatus(getErrorKey(error), {}, true);
  } finally {
    setBusy(false);
  }
}

async function renderPreviewPages(bytes, sequence) {
  const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(), isEvalSupported: false });
  const pdf = await loadingTask.promise;
  const pageNumbers = getPreviewPageNumbers(pdf.numPages);
  const deviceRatio = window.devicePixelRatio || 1;
  const targetWidth = Math.min(1400, Math.max(900, previewScroll.clientWidth * deviceRatio));
  const pages = [];

  for (const pageNumber of pageNumbers) {
    const page = await pdf.getPage(pageNumber);
    const unitViewport = page.getViewport({ scale: 1 });
    const renderScale = Math.max(0.6, Math.min(2.4, targetWidth / unitViewport.width));
    const viewport = page.getViewport({ scale: renderScale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    pages.push({
      canvas,
      pageNumber,
      pageSize: {
        width: unitViewport.width,
        height: unitViewport.height,
      },
    });

    if (sequence !== renderSequence) {
      return { count: 0, total: pdf.numPages };
    }
  }

  previewPages = pages;
  drawPreview(readSettings());

  return {
    count: pages.length,
    total: pdf.numPages,
  };
}

function readSettings() {
  return normalizeWatermarkSettings({
    text: textInput.value,
    color: colorInput.value,
    fontSize: fontSizeInput.value,
    gap: gapInput.value,
    opacity: opacityInput.value,
  });
}

function updateControls({ persist = true } = {}) {
  const settings = readSettings();

  fontSizeValue.textContent = String(settings.fontSize);
  gapValue.textContent = String(settings.gap);
  opacityValue.textContent = `${Math.round(settings.opacity * 100)}%`;
  updateQuickColorSelection(settings.color);
  if (persist) {
    saveWatermarkSettings(localStorage, settings);
  }
  drawPreview(settings);
}

function applyStoredSettings(settings) {
  if (!settings) {
    return;
  }

  textInput.value = settings.text;
  colorInput.value = settings.color;
  fontSizeInput.value = String(settings.fontSize);
  gapInput.value = String(settings.gap);
  opacityInput.value = String(settings.opacity);
}

function drawPreview(settings) {
  const ratio = window.devicePixelRatio || 1;
  const stageRect = previewScroll.getBoundingClientRect();
  const width = Math.max(640, Math.floor(stageRect.width * ratio));
  const height = previewPages.length
    ? calculatePreviewHeight(width, ratio)
    : Math.max(520, Math.floor(stageRect.height * ratio));

  if (previewCanvas.width !== width || previewCanvas.height !== height) {
    previewCanvas.width = width;
    previewCanvas.height = height;
  }

  previewContext.clearRect(0, 0, width, height);
  previewContext.fillStyle = "#111827";
  previewContext.fillRect(0, 0, width, height);
  drawPreviewTexture(width, height);

  if (!previewPages.length) {
    drawEmptyPreview(width, height);
    return;
  }

  drawPreviewPages(settings, width, ratio);
}

function calculatePreviewHeight(width, ratio) {
  const margin = 34 * ratio;
  const pageGap = 30 * ratio;
  const availableWidth = width - margin * 2;
  let totalHeight = margin;

  for (const page of previewPages) {
    const fit = availableWidth / page.canvas.width;
    totalHeight += page.canvas.height * fit + pageGap;
  }

  return Math.max(Math.ceil(totalHeight + margin - pageGap), Math.floor(previewScroll.clientHeight * ratio));
}

function drawPreviewPages(settings, width, ratio) {
  const margin = 34 * ratio;
  const pageGap = 30 * ratio;
  const availableWidth = width - margin * 2;
  let pageY = margin;

  for (const page of previewPages) {
    const fit = availableWidth / page.canvas.width;
    const pageWidth = page.canvas.width * fit;
    const pageHeight = page.canvas.height * fit;
    const pageX = (width - pageWidth) / 2;
    const pointScale = pageWidth / page.pageSize.width;

    previewContext.save();
    previewContext.shadowColor = "rgba(0, 0, 0, 0.32)";
    previewContext.shadowBlur = 38 * ratio;
    previewContext.shadowOffsetY = 18 * ratio;
    previewContext.fillStyle = "#ffffff";
    previewContext.fillRect(pageX, pageY, pageWidth, pageHeight);
    previewContext.drawImage(page.canvas, pageX, pageY, pageWidth, pageHeight);
    previewContext.restore();

    drawWatermarkOverlay(settings, {
      x: pageX,
      y: pageY,
      width: pageWidth,
      height: pageHeight,
      pointScale,
      pageSize: page.pageSize,
    });

    pageY += pageHeight + pageGap;
  }
}

function drawPreviewTexture(width, height) {
  const spacing = 36 * (window.devicePixelRatio || 1);

  previewContext.save();
  previewContext.strokeStyle = "rgba(255, 255, 255, 0.055)";
  previewContext.lineWidth = 1;

  for (let x = 0; x <= width; x += spacing) {
    previewContext.beginPath();
    previewContext.moveTo(x, 0);
    previewContext.lineTo(x, height);
    previewContext.stroke();
  }

  for (let y = 0; y <= height; y += spacing) {
    previewContext.beginPath();
    previewContext.moveTo(0, y);
    previewContext.lineTo(width, y);
    previewContext.stroke();
  }

  previewContext.restore();
}

function drawEmptyPreview(width, height) {
  const ratio = window.devicePixelRatio || 1;
  const pageWidth = Math.min(width * 0.52, 420 * ratio);
  const pageHeight = pageWidth * 1.35;
  const pageX = (width - pageWidth) / 2;
  const pageY = (height - pageHeight) / 2;

  previewContext.save();
  previewContext.fillStyle = "#f8fafc";
  previewContext.fillRect(pageX, pageY, pageWidth, pageHeight);
  previewContext.strokeStyle = "#cbd5e1";
  previewContext.lineWidth = 2 * ratio;
  previewContext.strokeRect(pageX, pageY, pageWidth, pageHeight);
  previewContext.fillStyle = "#475569";
  previewContext.font = `${18 * ratio}px Georgia, serif`;
  previewContext.textAlign = "center";
  previewContext.fillText(t("statusNoPreview"), width / 2, pageY + pageHeight / 2);
  previewContext.restore();
}

function drawWatermarkOverlay(settings, frame) {
  const fontSize = settings.fontSize * frame.pointScale;
  const color = toRgba(settings.color, settings.opacity);

  previewContext.save();
  previewContext.beginPath();
  previewContext.rect(frame.x, frame.y, frame.width, frame.height);
  previewContext.clip();
  previewContext.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;
  previewContext.fillStyle = color;

  const textWidth = previewContext.measureText(settings.text).width / frame.pointScale;
  const tiles = createWatermarkTiles({
    pageWidth: frame.pageSize.width,
    pageHeight: frame.pageSize.height,
    textWidth,
    fontSize: settings.fontSize,
    gap: settings.gap,
  });

  for (const tile of tiles) {
    previewContext.save();
    previewContext.translate(
      frame.x + tile.x * frame.pointScale,
      frame.y + frame.height - tile.y * frame.pointScale,
    );
    previewContext.rotate(getCanvasRotationRadians());
    previewContext.fillText(settings.text, 0, 0);
    previewContext.restore();
  }

  previewContext.restore();
}

function ensureLibrariesReady() {
  updateGenerateAvailability();
}

function applyTranslations() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }

  updateLanguageButtons();
  updateFileMeta();
  setStatus(statusKey, statusValues, statusError);
  setPreviewState(previewStateKey, previewStateValues);
  setBusy(isProcessing);
  drawPreview(readSettings());
}

function setLanguage(nextLanguage) {
  language = nextLanguage === "zh" ? "zh" : "en";
  localStorage.setItem("pdfWatermarkLanguage", language);
  applyTranslations();
}

function updateLanguageButtons() {
  for (const button of languageButtons) {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function updateFileMeta() {
  fileMeta.textContent = selectedFile
    ? t("uploadMetaReady", { name: selectedFile.name, size: formatFileSize(selectedFile.size) })
    : t("uploadMetaIdle");
}

function updateQuickColorSelection(color) {
  for (const swatch of colorSwatches) {
    const isActive = swatch.dataset.color.toLowerCase() === color.toLowerCase();
    swatch.classList.toggle("is-active", isActive);
    swatch.setAttribute("aria-pressed", String(isActive));
  }
}

function setBusy(nextProcessing) {
  isProcessing = nextProcessing;
  generateButton.disabled = isProcessing || !canGenerate();
  generateButton.textContent = t(isProcessing ? "processingButton" : "generateButton");
}

function updateGenerateAvailability() {
  generateButton.disabled = isProcessing || !canGenerate();
}

function canGenerate() {
  return Boolean(selectedFile && selectedPdfBytes);
}

function setStatus(key, values = {}, isError = false) {
  statusKey = key;
  statusValues = values;
  statusError = isError;
  statusText.textContent = t(key, values);
  statusText.classList.toggle("is-error", isError);
}

function setPreviewState(key, values = {}) {
  previewStateKey = key;
  previewStateValues = values;
  previewState.textContent = t(key, values);
}

function getErrorKey(error) {
  const message = String(error?.message || error);

  if (/encrypted/i.test(message)) {
    return "errorEncrypted";
  }

  return "errorInvalidPdf";
}

function t(key, values = {}) {
  return translate(language, key, values);
}

function toRgba(hex, opacity) {
  const { r, g, b } = hexToRgb(hex);

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${opacity})`;
}

function revokeDownloadUrl() {
  if (downloadUrl) {
    URL.revokeObjectURL(downloadUrl);
    downloadUrl = "";
  }
}

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function loadLanguage() {
  const savedLanguage = localStorage.getItem("pdfWatermarkLanguage");

  if (savedLanguage === "en" || savedLanguage === "zh") {
    return savedLanguage;
  }

  return getInitialLanguage(navigator.language);
}
