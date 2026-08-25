# dsh-question-jump-bar

DSH Web 插件：会话右侧的**问题索引标尺**（Question Jump Bar）。

每个刻度 = 一次用户提问；鼠标悬停高亮放大 + 预览问题文字；点击 / 键盘跳转到对应提问。

## 功能

- 每个刻度对应一次用户提问
- 悬停：刻度弹性放大（最近 32px → 20px → 14px），左侧浮出问题预览气泡
- 点击：平滑滚动到该提问
- 键盘（刻度聚焦后）：`↑↓` 逐条、`PageUp/PageDown` 翻页、`Home/End` 首尾、`Enter` 跳转
- 会话切换 / 新消息 / 滚动实时同步（MutationObserver + ResizeObserver）

## 安装

### 从 npm（发布后）

```sh
dsh plugin --profile web add dsh-question-jump-bar -w
```

### 从 GitHub（推荐）

```sh
dsh plugin --profile web add github:popeye1113/dsh-question-jump-bar -w
```

### 从本地目录 / tarball

```sh
# 本地目录
dsh plugin --profile web add ./dsh-question-jump-bar -w

# 或先打包
npm pack
dsh plugin --profile web add ./dsh-question-jump-bar-1.0.0.tgz -w
```

安装后**重启 dsh web** 使新 bundle 生效。

## 使用

装好并重启后，打开任意会话，右侧会出现垂直刻度轨道：

- 把鼠标移到轨道上：刻度放大 + 预览气泡
- 点击任意刻度：跳转到那一次提问
- 用键盘上下移动：当前刻度高亮

## 卸载

```sh
dsh plugin --profile web remove dsh-question-jump-bar -w
```

## License

MIT
