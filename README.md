# dsh-question-jump-bar

DSH Web 插件：会话交互增强——选中文字追问引用、消息编辑重发、自定义用户消息渲染器。

## 兼容性

- **v1.3.0** 起适配 **DSH 0.1.2-rc.1**（会话 UI 拆分至 `dsh-client-ui-chat`、composer 迁移到 Lexical contenteditable），同时向后兼容 0.1.1-rc.x：
  - CSS Module 哈希类名改为 `[class$="_actions"] / [class$="_bubble"]` 后缀匹配，不再随宿主重建失效
  - 草稿读取改走官方 `useInput()` 契约（InputState.draft），DOM 选择器仅作回退
- **问题索引标尺已停用（v1.3.0）**：DSH 0.1.2 起官方内置「轮次导航」（TurnNavigatorRail，含悬停预览、busy 动画、未加载历史轮次跳转），本插件不再注册自己的 `shell.overlay` 标尺，避免两条右侧标尺冲突。

## 功能

### 选中文字 → 追问

参照 reasonix 的 TranscriptSelectionMenu / ComposerContextCard：

- 在会话中选中任意文字（用户消息或 AI 回复），选区正上方出现「追问」浮动按钮

- 点击后**不再把文字塞进输入框**，而是在输入框上方弹出 reasonix 风格的**引用面板**（默认折叠两行，可点「展开/收起」查看全文，可点 × 移除，可选中文字复制但不触发追问按钮）

- 引用面板样式：左侧品牌色竖杠 + 无边框 + 与 sidebar 会话选中高亮同色背景 + 与输入框等宽

- 直接在输入框输入追问内容，按 `Enter` 或点击发送按钮，引用会以**可展开/收起的卡片**形式显示在消息上方，用户输入的内容在下方，两者完全分离

- 点击空白处 / 滚动 / 按下 `Esc` 会收起选区按钮

### 编辑自己的消息并重新发送

参照 reasonix 的 Message 编辑：

- 每条用户消息的复制按钮右侧新增一个**铅笔（编辑）**按钮（lucide Pencil 图标）

- 点击后弹出 composer 输入框风格的编辑面板（`--dsw-specific-input-major` 背景 + 圆角 22px + `--dsw-shadow-lv2` 阴影），预填该消息原文（不含追问引用），光标定位到末尾

- 修改完成后点「重新发送」（或 `Ctrl/Cmd + Enter`），编辑后的文字会作为新消息发送

- 操作行图标使用 lucide-react 原生图标（`Copy` + `Pencil`，描边风格）

### 自定义用户消息渲染器

- 替换 DSH 默认的 user 消息渲染器（`conversation.chat.node` key="user"）

- 解析消息文本中的 `【追问引用】...【/追问引用】` 标记，渲染为可展开/收起的引用卡片

- 用户输入内容以纯文本气泡显示，与引用卡片完全分离

- 保留操作行（复制、编辑）和图片渲染

> 说明：DSH 的历史消息由宿主权威管理，客户端无法原地替换已发送的消息；「重新发送」是把编辑后的文字作为一条新消息发出。原消息保留。

![截图](docs/screenshot.png)

## 安装

### 从 npm

```sh
dsh plugin --profile web add dsh-question-jump-bar -w
```

### 从 GitHub

```sh
dsh plugin --profile web add github:popeye1113/dsh-question-jump-bar -w
```

### 从本地目录 / tarball

```sh
# 本地目录
dsh plugin --profile web add ./dsh-question-jump-bar -w

# 或先打包
npm pack
dsh plugin --profile web add ./dsh-question-jump-bar-1.2.0.tgz -w
```

安装后**重启 dsh web** 使新 bundle 生效。

## 使用

装好并刷新页面后，本插件提供以下交互（问题跳转已由 DSH 0.1.2 官方内置的「轮次导航」承担，直接用它即可）：

- **追问引用**：在会话里用鼠标选中任意 AI 回复文字，气泡旁浮出「追问」按钮 → 点击把该句载入输入框上方的引用面板；正常输入问题并按 Enter / 点发送，引用会以标记卡片形式随消息一起发出，历史里渲染成可展开的引用卡片。
- **编辑重发**：每条自己的消息右下角有铅笔按钮 → 弹出编辑框改文字 → 「重新发送」。
- **复制**：自定义用户消息渲染器保留复制按钮，仅复制正文（不含引用卡片）。

## 卸载

```sh
dsh plugin --profile web remove dsh-question-jump-bar -w
```

## License

MIT
