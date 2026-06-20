# Lens Parameters Clone

本地复刻版，包含原站公开页面、样式、前端界面，以及一个 Node 后端。

后端负责：

- 卡密验证
- 后台 UI
- 卡密新增、批量生成、启停、删除
- 导出日志
- 图片上传
- 真实分辨率缩放
- JPEG 导出
- EXIF 写入
- HEIC/HEIF 能力检测

当前 GitHub Pages 版本使用纯前端卡密校验，暂时不依赖后端。

## 运行

```bash
npm install
node server.js
```

打开：

```text
http://127.0.0.1:4173/
```

后台：

```text
http://127.0.0.1:4173/admin
```

演示卡密：

```text
DEMO-2026-LENS-0001
```

## 生成前端卡密

```bash
npm run cards -- 20
```

这会更新：

```text
js/cards.js
```

明文卡密会保存到本地 `data/generated-cards-*.txt`，`data/` 已被 `.gitignore` 忽略，不会推到 GitHub。

注意：纯前端卡密只能作为轻量门槛，不能防懂代码的人绕过。强付费、防共享、可禁用和统计次数仍然需要后端。

后台默认令牌：

```text
LENS-ADMIN-2026
```

上线时请用环境变量修改：

```bash
ADMIN_TOKEN=your-secret node server.js
```

本地接口只用于走通导出流程，不连接线上卡密服务。

## API

接口架构见：

```text
API.md
```

## 部署

这个项目有 Node 后端，不能只放 GitHub Pages。推荐把代码推到 GitHub，再接 Render/Railway/Fly/VPS。

部署说明见：

```text
DEPLOY.md
```

## HEIC 说明

当前本机运行环境可以读取 HEIF/HEIC，但不支持 HEIC/HEVC 编码，所以页面会禁用 HEIC 导出。

如果部署服务器需要导出 iPhone 常见的 `.heic`，服务器必须安装带 HEVC/x265 编码能力的 `libheif`，并确保图片处理库可以调用它。否则后端会明确返回“不支持 HEIC/HEVC 编码”，不会悄悄改成 JPEG。
