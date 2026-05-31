# 本地预览说明

这个项目当前要展示的是摄影作品集站点，首页入口是：

- `src/app/page.tsx`
- `src/components/photography-portfolio.tsx`

## 给其他对话的启动方式

在项目目录运行：

```powershell
cd /d F:\Desktop\web-black
npm.cmd run dev:local
```

然后打开：

```text
http://127.0.0.1:3100/
```

## 成功标志

- 终端看到 Next.js dev server ready。
- 浏览器能打开 `http://127.0.0.1:3100/`。
- 页面标题是 `Photo Archive`。
- 页面首屏显示 `PHOTO ARCHIVE`。

## 常见情况

如果 `npm` 在 PowerShell 里被执行策略拦截，用 `npm.cmd`，不要改系统执行策略。

如果端口冲突，换一个端口启动，例如：

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3101
```

如果同一个项目已有 Next dev server 正在运行，先确认是不是旧服务。停止旧服务会影响当前预览窗口，应先告知风险。

## 当前项目结构要点

- 照片资源在 `public/portfolio/photos/`。
- 照片清单在 `src/data/portfolio-photos.json`。
- 主要样式在 `src/app/globals.css`。
- 当前组件目录只保留摄影站点需要的 `photography-portfolio.tsx` 和 `tube-text-scroll.tsx`。

## 验证命令

```powershell
npm.cmd run typecheck
```

成功标志：命令结束且没有 TypeScript error。
