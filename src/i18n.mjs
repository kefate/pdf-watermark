export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "zh"];

export const TRANSLATIONS = {
  en: {
    appTitle: "PDF Watermark Studio",
    appKicker: "Local document desk",
    uploadTitle: "PDF file",
    uploadIdle: "Select a PDF",
    uploadMetaIdle: "No file selected",
    uploadMetaReady: "{name} · {size}",
    controlsTitle: "Watermark",
    previewTitle: "Preview",
    textLabel: "Text",
    colorLabel: "Color",
    colorQuickGroup: "Quick colors",
    colorBlack: "Black",
    colorWhite: "White",
    colorGray: "Gray",
    colorRed: "Red",
    colorBlue: "Blue",
    sizeLabel: "Size",
    gapLabel: "Spacing",
    opacityLabel: "Opacity",
    languageLabel: "Language",
    generateButton: "Generate PDF",
    processingButton: "Processing...",
    downloadButton: "Download",
    statusSelectFile: "Select a PDF file.",
    statusLoadingPreview: "Loading preview pages...",
    statusPreviewReady: "Previewing {count} of {total} pages.",
    statusReady: "Ready to generate.",
    statusProcessing: "Processing PDF...",
    statusDone: "Watermarked PDF is ready.",
    statusNoPreview: "Preview appears after selecting a PDF.",
    errorPdfLib: "PDF editing library failed to load. Restart the local server.",
    errorPreviewLib: "PDF preview library failed to load. Restart the local server.",
    errorEncrypted: "Encrypted PDFs must be unlocked before processing.",
    errorInvalidPdf: "Processing failed. Check that the file is a valid PDF.",
    errorPreview: "Preview failed. The PDF can still be processed.",
    privacyLine: "🔒 Zero network requests · Offline-capable · Privacy first",
    githubLink: "GitHub ↗",
  },
  zh: {
    appTitle: "PDF 水印工作台",
    appKicker: "本地文档工具",
    uploadTitle: "PDF 文件",
    uploadIdle: "选择 PDF",
    uploadMetaIdle: "尚未选择文件",
    uploadMetaReady: "{name} · {size}",
    controlsTitle: "水印",
    previewTitle: "预览",
    textLabel: "文字",
    colorLabel: "颜色",
    colorQuickGroup: "快捷颜色",
    colorBlack: "黑色",
    colorWhite: "白色",
    colorGray: "灰色",
    colorRed: "红色",
    colorBlue: "蓝色",
    sizeLabel: "大小",
    gapLabel: "间隔",
    opacityLabel: "透明度",
    languageLabel: "语言",
    generateButton: "生成 PDF",
    processingButton: "处理中...",
    downloadButton: "下载",
    statusSelectFile: "请选择一个 PDF 文件。",
    statusLoadingPreview: "正在加载预览页面...",
    statusPreviewReady: "正在预览 {total} 页中的前 {count} 页。",
    statusReady: "参数就绪，可以生成。",
    statusProcessing: "正在处理 PDF...",
    statusDone: "带水印的 PDF 已生成。",
    statusNoPreview: "选择 PDF 后显示预览。",
    errorPdfLib: "PDF 编辑库加载失败，请重新启动本地服务。",
    errorPreviewLib: "PDF 预览库加载失败，请重新启动本地服务。",
    errorEncrypted: "加密 PDF 需要先解除密码保护。",
    errorInvalidPdf: "处理失败，请确认文件是有效的 PDF。",
    errorPreview: "预览失败，但仍可处理 PDF。",
    privacyLine: "🔒 零网络请求 · 完全离线可用 · 隐私至上",
    githubLink: "GitHub ↗",
  },
};

export function getInitialLanguage(locale = "") {
  return locale.toLowerCase().startsWith("zh") ? "zh" : DEFAULT_LANGUAGE;
}

export function translate(language, key, values = {}) {
  const dictionary = TRANSLATIONS[language] || TRANSLATIONS[DEFAULT_LANGUAGE];
  const template = dictionary[key] || TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;

  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}
