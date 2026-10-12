# 番茄钟 · 专注

一款基于 **Electron** 的桌面番茄钟（Pomodoro）应用。右下角悬浮番茄水波球，点击展开完整控制面板；倒计时期间，水球内红色海水随剩余时间缓缓流尽，从充盈变空。

## 功能特性

- **番茄水波球**：Canvas 手绘，随倒计时下沉的红色海水、丝滑海浪动画、玻璃质感外壳 + 白色贴纸描边，致敬图标番茄形象
- **专注 / 短休 / 长休**：轮次圆点显示进度，第 4 轮进行长休
- **自定时长**：配置面板可调整专注 / 短休 / 长休分钟数（居中布局）
- **透明置顶窗口**：无边框、始终置顶、无影，只显示挂件本身
- **桌面拖拽**：拖动番茄图标移动窗口；右键弹出居中的退出确认
- **到时提醒**：屏幕居中的独立弹窗，显示完成语 + 励志古诗词（无冗余按钮）
- **空状态引导**：克制、有画面感的文案，贴合产品调性
- **动效**：展开 / 收起采用握手时序，杜绝透明窗口 resize 的残影闪现，全程无弹跳

## 目录结构

```
TomatoTime/
├── application/
│   ├── main.js          # Electron 主进程：窗口、透明置顶、resize、IPC
│   ├── preload.js       # contextBridge 暴露 window.tomato API
│   ├── index.html       # 渲染进程：番茄水波球 Canvas + 控制面板 UI
│   ├── icon.ico         # 应用图标（6 帧 PNG-in-ICO）
│   ├── package.json     # 依赖与 electron-builder 配置
│   ├── package-lock.json
│   └── .npmrc           # 镜像源配置（仅 registry 地址，无凭据）
└── .gitignore
```

## 环境要求

- Node.js 16+
- npm（或 pnpm / yarn）

## 安装与运行

```bash
cd application
npm install
npm start        # 本地调试运行
```

## 打包分发

```bash
cd application
npm run dist     # 输出 nsis 安装包 + portable 便携版
```

产物输出到 `application/dist/`：

| 文件 | 说明 |
|------|------|
| `番茄钟 Setup <ver>.exe` | NSIS 安装版，创建桌面 / 开始菜单快捷方式 |
| `番茄钟 <ver>.exe` | 便携版，单文件即开即用 |
| `win-unpacked/番茄钟.exe` | 免打包目录，适合直接调试 |

## 常用快捷键 / 交互

- 点击番茄图标 → 展开面板
- 拖动番茄图标 → 移动窗口
- 右键番茄图标 → 退出确认
- 收起按钮（⌄）→ 收起面板

## License

MIT