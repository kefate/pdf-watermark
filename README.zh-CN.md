# PDF 水印工作台

[English](README.md)

PDF 水印工作台是一个本地优先的网页应用，可以为 PDF 的每一页添加平铺文字水印。它在浏览器内完成预览和生成，支持预览前 5 页，并允许配置水印文字、颜色、大小、间隔和透明度。

## 隐私设计

- PDF 文件只在浏览器中读取，应用不会上传文件。
- 运行时不会从 CDN 加载依赖。Vite 会把 `pdf-lib`、`pdfjs-dist` 和应用代码打包成静态资源。
- 水印配置会通过 `localStorage` 缓存，下次进入同一个网站时会自动恢复文字、颜色、大小、间隔和透明度。
- 已选择的 PDF 文件和生成后的 PDF 字节不会写入 `localStorage`。

## 设计说明

本项目是一个没有后端服务的静态 Vite 应用。

- `index.html` 定义应用外壳、配置表单、预览画布、语言切换和底部说明。
- `src/app.js` 负责浏览器事件、PDF 预览渲染、界面国际化更新和下载生成。
- `src/watermark-core.mjs` 保存水印默认值、参数校验、布局辅助函数、预览页数限制、快捷颜色和输出文件名逻辑。
- `src/pdf-watermark.mjs` 使用 `pdf-lib` 读取原始 PDF，在每一页绘制水印并序列化输出 PDF。
- `src/settings-storage.mjs` 只把归一化后的水印配置保存到浏览器 `localStorage`。
- `src/i18n.mjs` 提供英文和中文界面文案。
- `src/styles.css` 定义响应式双栏工具布局和可滚动的多页 PDF 预览区域。
- `tests/` 包含基于 Node 的轻量测试，覆盖构建配置、国际化一致性、布局约束、配置缓存行为和水印辅助函数。

PDF 预览由 `pdfjs-dist` 渲染到 canvas。PDF 生成由 `pdf-lib` 修改原始 PDF 字节。预览和写入分开处理，便于维护和测试。

## 运行环境依赖

- Node.js `^20.19.0` 或 `>=22.12.0`
- npm

## 本地启动

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

运行测试：

```bash
npm test
```

构建静态站点：

```bash
npm run build
```

预览生产构建：

```bash
npm run preview
```
