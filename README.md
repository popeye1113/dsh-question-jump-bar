# dsh-question-jump-bar

DSH Web 插件：会话右侧的**问题索引标尺**（Question Jump Bar），复刻自 [DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) 的会话导航器。

每个刻度 = 一次用户提问；鼠标悬停放大 + 预览问题文字；点击 / 键盘跳转到对应提问；当前可见问题刻度用会话标签页（对话/轨迹）的选中色高亮。

## 功能

- 每个刻度对应一次用户提问，最多 120 个采样刻度（自动均匀采样 + 保证当前刻度在内）
- 悬停：刻度弹性放大（最近 32px → 20px → 14px），左侧浮出问题预览气泡
- 点击：平滑滚动到该提问
- 键盘（刻度聚焦后）：`↑↓` 逐条、`PageUp/PageDown` 翻页、`Home/End` 首尾、`Enter` 跳转
- 激活刻度 = 当前视口内可见的提问，颜色跟随「对话 / 轨迹」标签选中态
- 普通刻度颜色写死（`#7d8590`），不受主题影响
- 会话切换 / 新消息 / 滚动实时同步（MutationObserver + ResizeObserver）

## 安装

### 从 npm（发布后）

```sh
dsh plugin --profile web add dsh-question-jump-bar -w
```

### 从本地目录 / tarball

```sh
# 本地目录
dsh plugin --profile web add ./dsh-question-jump-bar -w

# 或先打包
npm pack
dsh plugin --profile web add ./dsh-question-jump-bar-1.0.0.tgz -w
```

安装后**重启 dsh web** 使新 bundle 生效（bundle 变更需要完整重启，不是 HMR）。

### 从 Git 仓库（发布后）

```sh
dsh plugin --profile web add github:你的用户名/dsh-question-jump-bar -w
```

## 使用

装好并重启后，打开任意会话，右侧会出现垂直刻度轨道：

- 把鼠标移到轨道上：刻度放大 + 预览气泡
- 点击任意刻度：跳转到那一次提问
- 用键盘上下移动：当前刻度高亮

## 卸载

```sh
dsh plugin --profile web remove dsh-question-jump-bar -w
```

## 开发 / 构建

这个包不依赖构建步骤：`lib/client.js` 是手写的浏览器 bundle 格式（`window.__ModuleLoader__.load`），直接随包分发。

- `package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，loader 靠它把插件行插入 profile
- `dsh.client.inject` 声明浏览器半部依赖的 DSH client 包
- host 半部（`lib/index.js`）是空 apply 占位，实际行为全部在浏览器侧

## License

MIT
