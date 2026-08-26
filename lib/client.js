// dsh-question-jump-bar browser half.
// A reasonix-style question navigator rail on the right edge of every
// conversation: one tick per user question, hover preview, click/keyboard
// jump, active tick highlighted with the conversation tab accent
// (--dsw-alias-state-business-primary). Ported from the dynamic plugin
// qjump-1/pkg-3 and packaged as a profile bundle.
window.__ModuleLoader__.load({
  id: "dsh-question-jump-bar",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");

    // ---- CSS: injected once per document, cleaned up with the run ----
    var css = [
      ".qjump-bar{position:fixed;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-end;width:56px;height:240px;padding:0 12px;opacity:0;pointer-events:none;animation:qjump-bar-in .18s ease-out .08s forwards}",
      ".qjump-scroll{position:relative;width:32px;height:100%;cursor:pointer;pointer-events:auto;outline:none;overflow:visible}",
      /* 聚焦：底部磨砂光晕（居中、全高、恒定亮度；浅色用深灰，深色主题用灰白） */
      ".qjump-scroll::after{content:'';position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:85%;height:100%;border-radius:16px;background:radial-gradient(ellipse at center,rgba(64,70,80,.22),rgba(64,70,80,0) 80%);filter:blur(8px);opacity:0;transition:opacity .35s ease;pointer-events:none}",
      "body[data-ds-dark-theme] .qjump-scroll::after{background:radial-gradient(ellipse at center,rgba(200,205,212,.24),rgba(200,205,212,0) 80%)}",
      ".qjump-scroll:focus::after{opacity:1}",
      ".qjump-item{position:absolute;left:0;display:flex;align-items:center;justify-content:flex-end;width:32px;height:3px;transform:translateY(-50%);pointer-events:none}",
      ".qjump-dot{pointer-events:none;height:3px;border-radius:2px;background:#7d8590;transition:background 200ms,width 400ms cubic-bezier(.34,1.56,.64,1),box-shadow 150ms}",
      ".qjump-scroll[data-density='compact'] .qjump-dot{height:2px}",
      ".qjump-scroll[data-density='packed'] .qjump-dot{height:1px}",
      ".qjump-preview{position:fixed;max-width:240px;padding:4px 8px;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-overlay);box-shadow:0 8px 24px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap;pointer-events:none;z-index:2147483001}",
      "@keyframes qjump-bar-in{to{opacity:1}}"
    ].join("");
    var tagId = "dsh-question-jump-bar/qjump.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      var tag = document.createElement("style");
      tag.dataset.plugin = "dsh-question-jump-bar";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ---- Interaction CSS: selection add-to-chat popup + edit-message panel ----
    var interactCss = [
      /* 编辑按钮（user 消息复制按钮右侧的铅笔），视觉对齐原生 p-xYUq_action */
      ".qjump-edit-btn{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:transparent;border:none;border-radius:28px;justify-content:center;align-items:center;padding:6px;display:inline-flex}",
      ".qjump-edit-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
      /* 选中文字浮层按钮 —— reasonix 浮层风格：bg-overlay 94% 不透明 + 毛玻璃 + 2px 粗边框
         + 明显投影；前景色文字 + 品牌强调色图标，hover 浅色悬停底（浅/深主题自适应） */
      "@keyframes qjump-sel-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}",
      ".qjump-sel-pop{position:fixed;z-index:2147483002;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 8px;box-sizing:border-box;border:2px solid var(--dsw-alias-border-l2);border-radius:8px;cursor:pointer;pointer-events:auto;white-space:nowrap;color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 94%,transparent);box-shadow:0 12px 30px rgba(0,0,0,.28);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font-size:12px;font-weight:500;line-height:1;animation:qjump-sel-in .16s ease-out forwards}",
      ".qjump-sel-pop:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}",
      ".qjump-sel-pop:active{transform:translateY(1px)}",
      ".qjump-sel-icon{display:inline-flex;color:var(--dsw-alias-state-business-primary)}",
      /* 编辑面板：参考 composer 输入框样式 */
      ".qjump-edit-overlay{position:fixed;z-index:2147483003;inset:0;background:rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center}",
      "body[data-ds-dark-theme] .qjump-edit-overlay{background:rgba(0,0,0,.36)}",
      ".qjump-edit-pop{width:min(560px,calc(100vw - 32px));background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-radius:22px;box-shadow:var(--dsw-shadow-lv2);padding:14px 14px 12px;box-sizing:border-box;flex-direction:column;gap:10px;display:flex}",
      ".qjump-edit-textarea{box-sizing:border-box;width:100%;min-height:84px;max-height:40vh;border:none;border-radius:12px;background:transparent;color:var(--dsw-alias-label-primary);padding:8px 10px;font-size:16px;line-height:24px;resize:vertical;outline:none;font-family:inherit}",
      ".qjump-edit-actions{display:flex;justify-content:flex-end;gap:6px}",
      ".qjump-edit-btn-cancel,.qjump-edit-btn-send{height:34px;padding:0 16px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;border:none;display:inline-flex;align-items:center;gap:6px;transition:background .12s ease,opacity .12s ease}",
      ".qjump-edit-btn-cancel{background:transparent;color:var(--dsw-alias-label-tertiary)}",
      ".qjump-edit-btn-cancel:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
      ".qjump-edit-btn-send{background:var(--dsw-alias-state-business-primary);color:#fff}",
      ".qjump-edit-btn-send:hover{opacity:.88}",
      ".qjump-edit-btn-send:disabled{opacity:.4;cursor:default}",
      /* 引用面板（conversation.input.dock，composer 上方）—— 左侧品牌色竖杠；背景与 sidebar 会话选中高亮一致 */
      ".qjump-quote{display:flex;align-items:center;gap:8px;width:auto;max-width:100%;margin:0 auto;box-sizing:border-box;padding:8px 10px 8px 18px;border:none;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:1.5;position:relative}",
      "body[data-ds-dark-theme] .qjump-quote{background:var(--dsw-alias-interactive-bg-hover)}",
      ".qjump-quote::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--dsw-alias-state-business-primary);border-radius:8px 0 0 8px}",
      ".qjump-quote-text{flex:1 1 auto;min-width:0;white-space:pre-wrap;word-break:break-word}",
      ".qjump-quote-text--collapsed{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
      ".qjump-quote-actions{flex:none;display:inline-flex;align-items:center;gap:2px}",
      ".qjump-quote-btn{display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:11px;cursor:pointer}",
      ".qjump-quote-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
      ".qjump-quote-remove{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}",
      ".qjump-quote-remove:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
      /* 自定义用户消息气泡（替换默认 user 渲染器） */
      ".qjump-msg-row{flex-direction:column;align-items:flex-end;gap:6px;display:flex}",
      ".qjump-msg-stack{flex-direction:column;align-items:flex-end;gap:8px;min-width:0;max-width:min(525px,82%);display:flex}",
      ".qjump-msg-bubble{background:var(--dsw-specific-bubble);max-width:100%;color:var(--dsw-alias-label-primary);border-radius:22px;padding:10px 16px;font-size:16px;line-height:24px}",
      ".qjump-msg-actions{display:flex;align-items:center;gap:10px;height:28px;padding:0 4px}",
      ".qjump-msg-ref-summary{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;padding:2px 0}",
      ".qjump-msg-copy-btn{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:transparent;border:none;border-radius:28px;justify-content:center;align-items:center;padding:6px;display:inline-flex;font-size:12px;position:relative}",
      ".qjump-msg-copy-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
      /* hover tooltip —— 复刻 DSH 原生 Tooltip 样式（_bubble_owhem_8），底部显示 */
      ".qjump-tooltip{position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);z-index:100;width:max-content;max-width:50vw;padding:3px 7px;border-radius:8px;background:var(--dsw-alias-tooltip-bg);color:var(--dsw-static-neutral-bluish-00);font-size:13px;line-height:20px;white-space:pre-line;overflow-wrap:break-word;pointer-events:none;opacity:0;visibility:hidden;animation:none}",
      ".qjump-tooltip--show{opacity:1;visibility:visible;animation:qjump-tip-in .15s var(--ds-ease-in-out)}",
      "@keyframes qjump-tip-in{from{opacity:0}to{opacity:1}}",
      /* 消息内的引用卡片：覆盖 composer dock 面板的 margin:0 auto（居中），改为靠右 */
      ".qjump-msg-quote{margin:0;width:fit-content;max-width:100%;border:none}"
    ].join("");
    var interactTagId = "dsh-question-jump-bar/qjump-interact.css";
    // HMR 重载时旧 <style> 仍存在（同 tagId 会被跳过注入），导致新增 CSS 不生效。
    // 改为：发现同名 style 先移除再重建，保证每次重载都注入最新样式。
    if (typeof document !== "undefined") {
      var _prevInteract = document.querySelector("style[data-plugin-css=" + JSON.stringify(interactTagId) + "]");
      if (_prevInteract) _prevInteract.remove();
      var itag = document.createElement("style");
      itag.dataset.plugin = "dsh-question-jump-bar";
      itag.dataset.pluginCss = interactTagId;
      itag.textContent = interactCss;
      document.head.appendChild(itag);
    }

    // ---- Fixed colors: dim tick always #7d8590; bright tick follows the
    // ---- conversation tab (对话/轨迹) accent token --dsw-alias-state-business-primary
    var COLOR_DIM = "#7d8590";
    var BRIGHT_TOKEN = "var(--dsw-alias-state-business-primary)";

    // Sample up to 120 ticks, uniformly, always including the active turn.
    function sampledQuestionTurns(totalQuestions, activeTurn, limit) {
      var total = Math.max(0, Math.floor(totalQuestions));
      var maxMarkers = Math.max(2, Math.floor(limit || 120));
      if (total <= maxMarkers) return Array.from({ length: total }, function (_, t) { return t; });
      var turns = Array.from({ length: maxMarkers }, function (_, index) {
        return Math.round((index * (total - 1)) / (maxMarkers - 1));
      });
      if (maxMarkers <= 2 || activeTurn == null || activeTurn <= 0 || activeTurn >= total - 1 || turns.indexOf(activeTurn) >= 0) return turns;
      var replaceIndex = 1;
      var closestDistance = Number.POSITIVE_INFINITY;
      for (var index = 1; index < turns.length - 1; index += 1) {
        var distance = Math.abs(turns[index] - activeTurn);
        if (distance < closestDistance) { closestDistance = distance; replaceIndex = index; }
      }
      turns[replaceIndex] = activeTurn;
      turns.sort(function (a, b) { return a - b; });
      return turns;
    }

    function compactText(text) {
      var t = String(text || "").replace(/\s+/g, " ").trim();
      return t.length > 80 ? t.slice(0, 80) + "…" : t;
    }

    var SCROLL_SELECTOR = "[data-conversation-scroll]";
    var USER_SELECTOR = "[data-chat-flow-kind=\"user\"]";

    // ======================================================================
    // Interaction layer (reasonix-style, ported for DSH web):
    //   1) 选中会话文字 → 浮动“追问”按钮 → 把该句载入输入框，便于追问
    //   2) user 消息复制按钮右侧注入铅笔(编辑)按钮 → 弹窗改文字 → 重新发送
    // DOM selectors target the live dsh-client-ui-conversation bundle
    // (hash class names below come from that bundle and are version-pinned).
    // ======================================================================

    var ACTIONS_CLASS = "p-xYUq_actions";           // MessageIconActions row
    var BUBBLE_CLASS = "gdEzaW_bubble";             // user message bubble
    var INPUT_TEXTAREA_SELECTOR = "[data-input-scroll] textarea";
    var COPY_BTN_SELECTOR = 'button[aria-label="复制"], button[aria-label="copy"]';

    var PENCIL_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.754.46l-1.312.446a.75.75 0 0 1-.96-.96l.446-1.312c.097-.284.25-.544.46-.754l8.17-8.17Z" fill="currentColor"/></svg>';
    var ADD_TO_CHAT_SVG = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 1.75C2 .784 2.784 0 3.75 0h8.5C13.216 0 14 .784 14 1.75v10.5a1.75 1.75 0 0 1-1.75 1.75h-4.63a.75.75 0 0 0-.53.22l-1.6 1.6a.75.75 0 0 1-1.24-.53v-1.29H3.75A1.75 1.75 0 0 1 2 11.75V1.75Z" fill="currentColor"/><path d="M5.25 5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5H6A.75.75 0 0 1 5.25 5Zm0 2.75A.75.75 0 0 1 6 7h2.25a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z" fill="currentColor"/></svg>';

    var QUOTE_ICON_SVG = '<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5.25 3.5C3.4 4.55 2.5 6.1 2.5 8.05 2.5 10.4 3.75 12 5.55 12c1.45 0 2.55-1 2.55-2.4 0-1.35-.9-2.25-2.15-2.25-.3 0-.55.05-.7.1.2-1.2 1.25-2.1 2.55-2.6L5.25 3.5Zm6.2 0c-1.85 1.05-2.75 2.6-2.75 4.55 0 2.35 1.25 3.95 3.05 3.95 1.45 0 2.55-1 2.55-2.4 0-1.35-.9-2.25-2.15-2.25-.3 0-.55.05-.7.1.2-1.2 1.25-2.1 2.55-2.6L11.45 3.5Z"/></svg>';
    var CLOSE_SVG = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    var CHEVRON_SVG = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // 引用文本 → markdown 引用块（发送时追加到消息末尾）
    function quoteToMarkdown(text) {
      return String(text || "").split(/\r?\n/).map(function (line) { return "> " + line; }).join("\n");
    }

    // 追问引用标记（用于消息文本中标记引用内容，自定义 user 渲染器解析为卡片）
    var QUOTE_MARK_START = "【追问引用】";
    var QUOTE_MARK_END = "【/追问引用】";
    // 解析消息文本中的引用标记，返回 {quote, bodyText}
    function parseQuoteText(text) {
      if (!text) return { quote: null, bodyText: text || "" };
      var start = text.indexOf(QUOTE_MARK_START);
      var end = text.indexOf(QUOTE_MARK_END);
      if (start === -1 || end === -1 || end <= start + QUOTE_MARK_START.length) return { quote: null, bodyText: text };
      var quote = text.slice(start + QUOTE_MARK_START.length, end).trim();
      var body = (text.slice(0, start) + text.slice(end + QUOTE_MARK_END.length)).replace(/\n{3,}/g, "\n\n").trim();
      return { quote: quote || null, bodyText: body };
    }

    // 简单的模块级发布订阅 store：追问面板（input.overlay）与引用面板（input.dock）共享状态
    var createQuoteStore = function () {
      var state = null;
      var listeners = [];
      return {
        get: function () { return state; },
        set: function (value) { state = value; listeners.slice().forEach(function (listener) { listener(state); }); },
        subscribe: function (listener) {
          listeners.push(listener);
          return function () {
            var i = listeners.indexOf(listener);
            if (i >= 0) listeners.splice(i, 1);
          };
        }
      };
    };
    var quoteStore = createQuoteStore();

    function findUserActionsRow(userEl) {
      if (!userEl) return null;
      var row = userEl.querySelector("." + ACTIONS_CLASS);
      if (row) return row;
      var copy = userEl.querySelector(COPY_BTN_SELECTOR);
      return copy ? copy.parentElement : null;
    }

    function userMessageText(userEl) {
      if (!userEl) return "";
      var bubble = userEl.querySelector("." + BUBBLE_CLASS);
      return (bubble ? bubble.textContent : userEl.textContent || "").trim();
    }

    function currentDraftText() {
      var ta = document.querySelector(INPUT_TEXTAREA_SELECTOR);
      return ta ? ta.value : "";
    }

    function focusComposerTextarea() {
      var ta = document.querySelector(INPUT_TEXTAREA_SELECTOR);
      if (!ta) {
        var scroll = document.querySelector(SCROLL_SELECTOR);
        ta = scroll ? scroll.querySelector("textarea") : null;
      }
      if (!ta) return;
      try { ta.focus(); } catch (e) {}
      try { ta.scrollIntoView({ block: "nearest" }); } catch (e) {}
      try {
        var len = ta.value ? ta.value.length : 0;
        ta.setSelectionRange(len, len);
      } catch (e) {}
    }

    /**
     * Session-scoped interaction overlay (registered in conversation.input.overlay).
     * Only the currently active session's instance performs DOM work; other
     * session instances render nothing, so multi-session stays clean.
     */
    function QJumpInteractionOverlay(props) {
      var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
      var useSessions = props.useSessions, sessionId = props.sessionId, inputActions = props.inputActions;
      var currentId = useSessions ? useSessions(function (s) { return s.current; }) : undefined;
      var isActive = currentId === sessionId;

      var selectionState = useState(null);
      var selection = selectionState[0], setSelection = selectionState[1];
      var editState = useState(null);
      var edit = editState[0], setEdit = editState[1];
      var editDraftState = useState("");
      var editDraft = editDraftState[0], setEditDraft = editDraftState[1];
      var selectionDismissedRef = useRef(null);

      // ---- Inject edit (pencil) buttons into user message action rows ----
      useEffect(function () {
        if (!isActive) return;

        var scan = function () {
          var scrollEl = document.querySelector(SCROLL_SELECTOR);
          if (!scrollEl) return;
          var users = Array.prototype.slice.call(scrollEl.querySelectorAll(USER_SELECTOR));
          users.forEach(function (userEl) {
            var actionsRow = findUserActionsRow(userEl);
            if (!actionsRow) return;
            if (actionsRow.querySelector("[data-qjump-edit]")) return;
            if (actionsRow.classList.contains("qjump-msg-actions")) return;
            if (!actionsRow.querySelector(COPY_BTN_SELECTOR)) return;
            var btn = document.createElement("button");
            btn.type = "button";
            btn.setAttribute("data-qjump-edit", "");
            btn.className = "qjump-edit-btn";
            btn.setAttribute("aria-label", "编辑");
            btn.title = "编辑并重新发送";
            btn.innerHTML = PENCIL_SVG;
            var copyBtn = actionsRow.querySelector(COPY_BTN_SELECTOR);
            actionsRow.insertBefore(btn, copyBtn.nextSibling);
          });
        };

        scan();
        var scanFrame = null;
        var scheduleScan = function () {
          if (scanFrame !== null) return;
          scanFrame = requestAnimationFrame(function () {
            scanFrame = null;
            scan();
          });
        };
        var mo = typeof MutationObserver !== "undefined" ? new MutationObserver(scheduleScan) : null;
        if (mo) mo.observe(document.body, { childList: true, subtree: true });

        return function () {
          if (scanFrame !== null) cancelAnimationFrame(scanFrame);
          if (mo) mo.disconnect();
          var scrollEl = document.querySelector(SCROLL_SELECTOR);
          if (scrollEl) {
            Array.prototype.slice.call(scrollEl.querySelectorAll("[data-qjump-edit]")).forEach(function (b) { b.remove(); });
          }
        };
      }, [isActive]);

      // ---- Selection → “追问” floating button ----
      // 兼容性红线：绝不在全局事件里清除 document 选区（removeAllRanges）。
      // 浏览器划词翻译等扩展依赖选区存活到它自己的按钮被点击的那一刻；
      // 一旦我们抢先清空选区，扩展就读取不到文字。关闭浮层一律走
      // selectionchange（选区自然塌缩时）/ 滚动 / Esc，而不是主动改选区。
      useEffect(function () {
        if (!isActive) return;

        var frame = null;

        var scheduleShow = function (target) {
          if (frame !== null) cancelAnimationFrame(frame);
          frame = requestAnimationFrame(function () {
            frame = null;
            var selection = document.getSelection();
            if (!selection || selection.isCollapsed) { setSelection(null); return; }
            var text = selection.toString().trim();
            if (text === "") { setSelection(null); return; }
            var anchor = selection.anchorNode;
            if (!anchor) { setSelection(null); return; }
            var node = anchor.nodeType === 1 ? anchor : anchor.parentElement;
            if (!node) { setSelection(null); return; }
            var scrollEl = document.querySelector(SCROLL_SELECTOR);
            if (!scrollEl || !scrollEl.contains(node)) { setSelection(null); return; }
            // 排除输入框自身的选中、插件自己的浮层、以及追问卡片内的选中（卡片内可选文字但不触发追问按钮）
            if (node.closest("[data-input-scroll], textarea, .qjump-sel-pop, .qjump-edit-pop, .qjump-edit-overlay, .qjump-quote")) { setSelection(null); return; }
            if (selectionDismissedRef.current === text) return;
            var range = selection.rangeCount ? selection.getRangeAt(selection.rangeCount - 1) : null;
            var rect = range && typeof range.getBoundingClientRect === "function" ? range.getBoundingClientRect() : null;
            var x, y;
            // 显示在选区第一个字的正上方：按钮底边贴近选区顶部，可遮挡上一行文字
            if (rect && (rect.width > 0 || rect.height > 0)) { x = rect.left; y = rect.top - 32; }
            else { x = 12; y = 12; }
            x = Math.max(8, Math.min(window.innerWidth - 180, x));
            y = Math.max(8, Math.min(window.innerHeight - 34, y));
            setSelection({ text: text, x: x, y: y });
          });
        };

        var onPointerUp = function (e) {
          if (e.button !== 0) return;
          var t = e.target instanceof Element ? e.target : null;
          if (t && t.closest(".qjump-sel-pop, .qjump-edit-pop, .qjump-edit-overlay")) return;
          // 点击会话之外的元素（划词翻译按钮、空白处等）：只收起自己的浮层，
          // 把鼠标松开的时刻留给其它扩展。
          var scrollEl = document.querySelector(SCROLL_SELECTOR);
          if (!t || !scrollEl || !scrollEl.contains(t)) { setSelection(null); return; }
          selectionDismissedRef.current = null;
          scheduleShow(e.target);
        };
        var onKeyUp = function () { scheduleShow(null); };
        var onSelectionChange = function () {
          var selection = document.getSelection();
          if (!selection || selection.isCollapsed || selection.toString().trim() === "") setSelection(null);
        };
        // Esc 只隐藏浮层，绝不动选区
        var onKeyDown = function (e) {
          if (e.key === "Escape") setSelection(null);
        };
        var onScroll = function () { setSelection(null); };

        document.addEventListener("pointerup", onPointerUp);
        document.addEventListener("keyup", onKeyUp);
        document.addEventListener("selectionchange", onSelectionChange);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onScroll);

        return function () {
          if (frame !== null) cancelAnimationFrame(frame);
          document.removeEventListener("pointerup", onPointerUp);
          document.removeEventListener("keyup", onKeyUp);
          document.removeEventListener("selectionchange", onSelectionChange);
          document.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onScroll);
        };
      }, [isActive]);

      // ---- Click delegation for injected edit buttons ----
      useEffect(function () {
        if (!isActive) return;
        var onClick = function (e) {
          var btn = e.target && e.target.closest ? e.target.closest("[data-qjump-edit]") : null;
          if (!btn) return;
          e.preventDefault();
          e.stopPropagation();
          var userEl = btn.closest(USER_SELECTOR);
          var text = userMessageText(userEl);
          var rect = (userEl || btn).getBoundingClientRect();
          var popX = Math.max(12, Math.min(window.innerWidth - 572, rect.left + rect.width / 2 - 260));
          var popY = Math.max(12, Math.min(window.innerHeight - 240, rect.top - 60));
          setEdit({ text: text, x: popX, y: popY });
          setEditDraft(text);
          setSelection(null);
          selectionDismissedRef.current = null;
        };
        document.addEventListener("click", onClick, true);
        return function () { document.removeEventListener("click", onClick, true); };
      }, [isActive]);

      if (!isActive) return null;

      var doSendEdit = function () {
        var text = editDraft.trim();
        if (!text) return;
        if (inputActions && typeof inputActions.setDraft === "function") inputActions.setDraft(text);
        focusComposerTextarea();
        if (inputActions && typeof inputActions.submit === "function") inputActions.submit();
        setEdit(null);
      };

      var children = [];

      if (selection) {
        children.push(React.createElement("button", {
          key: "sel",
          className: "qjump-sel-pop",
          style: { left: selection.x + "px", top: selection.y + "px" },
          onMouseDown: function (e) { e.preventDefault(); e.stopPropagation(); },
          onClick: function () {
            var docSel = document.getSelection();
            if (docSel) docSel.removeAllRanges();
            setSelection(null);
            quoteStore.set({ sessionId: sessionId, text: selection.text });
            focusComposerTextarea();
          }
        },
          React.createElement("span", { className: "qjump-sel-icon", dangerouslySetInnerHTML: { __html: ADD_TO_CHAT_SVG } }),
          React.createElement("span", { className: "qjump-sel-label" }, "追问")
        ));
      }

      if (edit) {
        children.push(React.createElement("div", {
          key: "edit-overlay",
          className: "qjump-edit-overlay",
          onMouseDown: function (e) {
            if (e.target === e.currentTarget) setEdit(null);
          }
        },
          React.createElement("div", {
            className: "qjump-edit-pop",
            onMouseDown: function (e) { e.stopPropagation(); }
          },
            React.createElement("textarea", {
              className: "qjump-edit-textarea",
              value: editDraft,
              autoFocus: true,
              onFocus: function (e) { var t = e.target; t.setSelectionRange(t.value.length, t.value.length); },
              onChange: function (e) { setEditDraft(e.target.value); },
              onKeyDown: function (e) {
                if (e.key === "Escape") { e.preventDefault(); setEdit(null); }
                else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); doSendEdit(); }
              }
            }),
            React.createElement("div", { className: "qjump-edit-actions" },
              React.createElement("button", {
                className: "qjump-edit-btn-cancel",
                onClick: function () { setEdit(null); }
              }, "取消"),
              React.createElement("button", {
                className: "qjump-edit-btn-send",
                disabled: editDraft.trim() === "",
                onClick: doSendEdit
              }, "重新发送")
            )
          )
        ));
      }

      return React.createElement(React.Fragment, null, children);
    }

    /**
     * 引用面板（conversation.input.dock，composer 上方的一行）。
     * 点击「追问」后在此显示选中的文字（reasonix composer-context 风格）：
     *  - 默认折叠 2 行，可点“展开/收起”查看全文
     *  - 移除按钮清空引用
     *  - 焦点在输入框且存在引用时，按 Enter 会把引用以 markdown 引用块
     *    追加到消息末尾一并发送（不把引用塞进输入框草稿）
     */
    function QJumpQuotePanel(props) {
      var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
      var sessionId = props.sessionId, inputActions = props.inputActions;

      var quoteState = useState(null);
      var quote = quoteState[0], setQuote = quoteState[1];
      var expandedState = useState(false);
      var expanded = expandedState[0], setExpanded = expandedState[1];
      var panelRef = useRef(null);

      useEffect(function () {
        var current = quoteStore.get();
        setQuote(current && current.sessionId === sessionId ? current.text : null);
        setExpanded(false);
        return quoteStore.subscribe(function (s) {
          setQuote(s && s.sessionId === sessionId ? s.text : null);
          setExpanded(false);
        });
      }, [sessionId]);

      // 引用面板宽度与输入框等宽（ResizeObserver 实时同步）
      useEffect(function () {
        if (!quote) return;
        var ta = document.querySelector(INPUT_TEXTAREA_SELECTOR);
        if (!ta) return;
        var sync = function () {
          if (panelRef.current) panelRef.current.style.width = ta.offsetWidth + "px";
        };
        sync();
        var ro = new ResizeObserver(sync);
        ro.observe(ta);
        return function () { ro.disconnect(); };
      }, [quote]);

      useEffect(function () {
        var current = quoteStore.get();
        setQuote(current && current.sessionId === sessionId ? current.text : null);
        setExpanded(false);
        return quoteStore.subscribe(function (s) {
          setQuote(s && s.sessionId === sessionId ? s.text : null);
          setExpanded(false);
        });
      }, [sessionId]);

      // 发送时把引用带上：预注入（setDraft 追加引用），不拦截 DSH 的提交，
      // 由 DSH 自己提交含引用的 draft。覆盖两种途径：
      //   - Enter（无修饰、非组合输入、焦点在 composer 输入框）
      //   - 点击发送按钮（aria-label 发送消息/send）
      useEffect(function () {
        if (!quote || !inputActions) return;
        var attachQuote = function () {
          var ta = document.querySelector(INPUT_TEXTAREA_SELECTOR);
          var draft = ta ? ta.value || "" : "";
          // 引用用特殊标记包裹（自定义 user 渲染器解析成卡片），引用在上、内容在下
          var marked = QUOTE_MARK_START + "\n" + quote + "\n" + QUOTE_MARK_END;
          if (typeof inputActions.setDraft === "function") inputActions.setDraft(marked + (draft ? "\n\n" + draft : ""));
        };
        var onKeyDown = function (e) {
          if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
          var ta = document.querySelector(INPUT_TEXTAREA_SELECTOR);
          if (!ta) return;
          var activeEl = document.activeElement;
          if (activeEl !== ta && !(ta.contains && ta.contains(activeEl))) return;
          attachQuote();
          quoteStore.set(null);
        };
        var onClick = function (e) {
          var t = e.target;
          var btn = t && t.closest
            ? t.closest('button[aria-label="发送消息"], button[aria-label="发送"], button[aria-label="Send message"], button[aria-label="Send"]')
            : null;
          if (!btn) return;
          attachQuote();
          quoteStore.set(null);
        };
        document.addEventListener("keydown", onKeyDown, true);
        document.addEventListener("click", onClick, true);
        return function () {
          document.removeEventListener("keydown", onKeyDown, true);
          document.removeEventListener("click", onClick, true);
        };
      }, [quote, sessionId, inputActions]);

      if (!quote) return null;

      return React.createElement("div", { className: "qjump-quote", ref: panelRef, role: "region", "aria-label": "引用内容" },
        React.createElement("div", {
          className: "qjump-quote-text" + (expanded ? "" : " qjump-quote-text--collapsed")
        }, quote),
        React.createElement("div", { className: "qjump-quote-actions" },
          React.createElement("button", {
            className: "qjump-quote-btn",
            type: "button",
            onClick: function () { setExpanded(function (v) { return !v; }); }
          },
            React.createElement("span", { dangerouslySetInnerHTML: { __html: CHEVRON_SVG } }),
            expanded ? "收起" : "展开"
          ),
          React.createElement("button", {
            className: "qjump-quote-remove",
            type: "button",
            "aria-label": "移除引用",
            title: "移除引用",
            onClick: function () { quoteStore.set(null); }
          },
            React.createElement("span", { dangerouslySetInnerHTML: { __html: CLOSE_SVG } })
          )
        )
      );
    }

    /**
     * 自定义用户消息渲染器（替换 conversation.chat.node key="user"）。
     * 解析消息文本中的 【追问引用】...【/追问引用】标记，渲染为可展开/收起的引用卡片，
     * 其他部分以纯文本显示。保留操作行（复制、编辑）。
     */
    function QJumpUserMessage(props) {
      var node = props.node, t = props.t, renderMessageImages = props.renderMessageImages;
      var useSession = props.useSession, sessionId = props.sessionId, inputActions = props.inputActions;
      var data = node && node.data;
      if (!data) return null;
      var content = data.content, referenceLabels = data.referenceLabels, time = data.time;
      // contentParts：拆分 content 数组
      var texts = [], images = [], rest = [];
      if (content && typeof content === "object" && typeof content.length === "number") {
        for (var i = 0; i < content.length; i++) {
          var b = content[i];
          if (b && b.type === "text" && typeof b.text === "string") texts.push(b.text);
          else if (b && b.type === "image" && b.attachment !== void 0) images.push({ attachment: b.attachment });
          else rest.push(b);
        }
      }
      var text = texts.join("");
      var _a = parseQuoteText(text), quote = _a.quote, bodyText = _a.bodyText;
      var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
      var expandedState = useState(false);
      var expanded = expandedState[0], setExpanded = expandedState[1];
      var editState = useState(null);
      var edit = editState[0], setEdit = editState[1];
      var editDraftState = useState("");
      var editDraft = editDraftState[0], setEditDraft = editDraftState[1];
      var copiedState = useState(false);
      var copied = copiedState[0], setCopied = copiedState[1];
      var tipState = useState(false);
      var tipShow = tipState[0], setTipShow = tipState[1];
      var editTipState = useState(false);
      var editTipShow = editTipState[0], setEditTipShow = editTipState[1];
      var copyTimer = useRef(null);
      useEffect(function () { return function () { if (copyTimer.current !== null) clearTimeout(copyTimer.current); }; }, []);
      var doSendEdit = function () {
        var t = editDraft.trim();
        if (!t) return;
        if (inputActions && typeof inputActions.setDraft === "function") inputActions.setDraft(t);
        var ta = document.querySelector(INPUT_TEXTAREA_SELECTOR);
        if (ta) try { ta.focus(); } catch (e) {}
        if (inputActions && typeof inputActions.submit === "function") inputActions.submit();
        setEdit(null);
      };
      var handleCopy = function () {
        if (copied) return;
        try {
          var p = navigator.clipboard.writeText(text);
          if (p && typeof p.then === "function") {
            p.then(function () {
              setCopied(true);
              copyTimer.current = setTimeout(function () { copyTimer.current = null; setCopied(false); }, 1500);
            });
          }
        } catch (e) {}
      };
      var showBubble = bodyText !== "" || rest.length > 0;
      var children = [];
      // 引用卡片（在上）
      if (quote) {
        children.push(React.createElement("div", { key: "quote", className: "qjump-quote qjump-msg-quote", role: "region", "aria-label": "引用内容" },
          React.createElement("div", { className: "qjump-quote-text" + (expanded ? "" : " qjump-quote-text--collapsed") }, quote),
          React.createElement("div", { className: "qjump-quote-actions" },
            React.createElement("button", { className: "qjump-quote-btn", type: "button", onClick: function () { setExpanded(function (v) { return !v; }); } },
              React.createElement("span", { dangerouslySetInnerHTML: { __html: CHEVRON_SVG } }),
              expanded ? "收起" : "展开"
            )
          )
        ));
      }
      // 用户输入内容（在下）
      if (showBubble) {
        children.push(React.createElement("div", { key: "bubble", className: "qjump-msg-bubble" },
          React.createElement("div", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word" } }, bodyText),
          rest.map(function (block, i) {
            return React.createElement("div", { key: i, style: { marginTop: 8, fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } },
              JSON.stringify(block)
            );
          })
        ));
      }
      // 引用标签摘要
      if (referenceLabels && referenceLabels.length > 0) {
        children.push(React.createElement("div", { key: "ref", className: "qjump-msg-ref-summary" },
          "@" + referenceLabels.join(", ")
        ));
      }
      // 消息操作行（复制、编辑）
      return React.createElement("div", { className: "qjump-msg-row", "data-time-hover-root": true },
        React.createElement("div", { className: "qjump-msg-stack" },
          images.length > 0 ? renderMessageImages({ images: images, align: "end" }) : null,
          React.createElement(React.Fragment, null, children)
        ),
        React.createElement("div", { className: "qjump-msg-actions" },
          React.createElement("button", { className: "qjump-msg-copy-btn", type: "button", "aria-label": copied ? "复制成功" : "复制", onClick: handleCopy, onMouseEnter: function () { setTipShow(true); }, onMouseLeave: function () { setTipShow(false); } },
            React.createElement("span", { dangerouslySetInnerHTML: { __html: copied ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z" fill="currentColor"/></svg>' : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6.14929 4.02032C7.11197 4.02032 7.87983 4.02016 8.49597 4.07598C9.12128 4.13269 9.65792 4.25188 10.1415 4.53106C10.7202 4.8653 11.2008 5.3459 11.535 5.92462C11.8142 6.40818 11.9334 6.94481 11.9901 7.57012C12.0459 8.18625 12.0458 8.95419 12.0458 9.9168C12.0458 10.8795 12.0459 11.6473 11.9901 12.2635C11.9334 12.8888 11.8142 13.4254 11.535 13.909C11.2008 14.4877 10.7202 14.9683 10.1415 15.3025C9.65792 15.5817 9.12128 15.7009 8.49597 15.7576C7.87984 15.8134 7.11196 15.8133 6.14929 15.8133C5.18667 15.8133 4.41874 15.8134 3.80261 15.7576C3.1773 15.7009 2.64067 15.5817 2.1571 15.3025C1.5784 14.9683 1.09778 14.4877 0.76355 13.909C0.484366 13.4254 0.365184 12.8888 0.308472 12.2635C0.252649 11.6473 0.252808 10.8795 0.252808 9.9168C0.252808 8.95418 0.252664 8.18625 0.308472 7.57012C0.365184 6.94481 0.484366 6.40818 0.76355 5.92462C1.09777 5.34589 1.57839 4.86529 2.1571 4.53106C2.64067 4.25188 3.1773 4.13269 3.80261 4.07598C4.41874 4.02017 5.18666 4.02032 6.14929 4.02032ZM6.14929 5.37774C5.16181 5.37774 4.46634 5.37761 3.92566 5.42657C3.39434 5.47472 3.07859 5.56574 2.83582 5.70587C2.4632 5.92106 2.15354 6.2307 1.93835 6.60333C1.79823 6.8461 1.70721 7.16185 1.65906 7.69317C1.6101 8.23385 1.61023 8.92933 1.61023 9.9168C1.61023 10.9043 1.61009 11.5998 1.65906 12.1404C1.70721 12.6717 1.79823 12.9875 1.93835 13.2303C2.15356 13.6029 2.46321 13.9126 2.83582 14.1277C3.07859 14.2679 3.39434 14.3589 3.92566 14.407C4.46634 14.456 5.16182 14.4559 6.14929 14.4559C7.13682 14.4559 7.83224 14.456 8.37292 14.407C8.90425 14.3589 9.21999 14.2679 9.46277 14.1277C9.83535 13.9126 10.145 13.6029 10.3602 13.2303C10.5004 12.9875 10.5914 12.6717 10.6395 12.1404C10.6885 11.5998 10.6884 10.9043 10.6884 9.9168C10.6884 8.92934 10.6885 8.23384 10.6395 7.69317C10.5914 7.16185 10.5004 6.8461 10.3602 6.60333C10.1451 6.23071 9.83536 5.92107 9.46277 5.70587C9.21999 5.56574 8.90424 5.47472 8.37292 5.42657C7.83224 5.3776 7.13682 5.37774 6.14929 5.37774ZM9.80164 0.367975C10.7638 0.367975 11.5314 0.36788 12.1473 0.423639C12.7726 0.480307 13.3093 0.598759 13.7928 0.877741C14.3717 1.21192 14.8521 1.69355 15.1864 2.27227C15.4655 2.75574 15.5857 3.29164 15.6425 3.9168C15.6983 4.53301 15.6971 5.3016 15.6971 6.26446V7.82989C15.6971 8.29264 15.6989 8.58993 15.6649 8.84844C15.4668 10.3525 14.401 11.5738 12.9833 11.9988V10.5467C13.6973 10.1903 14.2105 9.49662 14.3192 8.67169C14.3387 8.52347 14.3407 8.3358 14.3407 7.82989V6.26446C14.3407 5.27706 14.3398 4.58149 14.2909 4.04083C14.2428 3.50968 14.1526 3.19372 14.0126 2.95098C13.7974 2.57849 13.4876 2.26869 13.1151 2.05352C12.8724 1.91347 12.5564 1.82237 12.0253 1.77423C11.4847 1.72528 10.7888 1.7254 9.80164 1.7254H7.71472C6.7562 1.72558 5.92665 2.27697 5.52332 3.07891H4.07019C4.54221 1.51132 5.9932 0.368186 7.71472 0.367975H9.80164Z" fill="currentColor"/></svg>' } }),
            React.createElement("span", { className: "qjump-tooltip" + (tipShow ? " qjump-tooltip--show" : ""), role: "tooltip" }, copied ? "复制成功" : "复制")
          ),
          React.createElement("button", { className: "qjump-msg-copy-btn", type: "button", "aria-label": "重新编辑", onClick: function () { setEditDraft(bodyText); setEdit(true); }, onMouseEnter: function () { setEditTipShow(true); }, onMouseLeave: function () { setEditTipShow(false); } },
            React.createElement("span", { dangerouslySetInnerHTML: { __html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-2.872 6.575a.5.5 0 0 0 .62.62l6.575-2.872a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>' } }),
            React.createElement("span", { className: "qjump-tooltip" + (editTipShow ? " qjump-tooltip--show" : ""), role: "tooltip" }, "重新编辑")
          )
        ),
        edit ? React.createElement("div", { key: "edit-overlay", className: "qjump-edit-overlay", onMouseDown: function (e) { if (e.target === e.currentTarget) setEdit(null); } },
          React.createElement("div", { className: "qjump-edit-pop", onMouseDown: function (e) { e.stopPropagation(); } },
            React.createElement("textarea", { className: "qjump-edit-textarea", value: editDraft, autoFocus: true, onFocus: function (e) { var t = e.target; t.setSelectionRange(t.value.length, t.value.length); }, onChange: function (e) { setEditDraft(e.target.value); }, onKeyDown: function (e) { if (e.key === "Escape") { e.preventDefault(); setEdit(null); } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); doSendEdit(); } } }),
            React.createElement("div", { className: "qjump-edit-actions" },
              React.createElement("button", { className: "qjump-edit-btn-cancel", onClick: function () { setEdit(null); } }, "取消"),
              React.createElement("button", { className: "qjump-edit-btn-send", disabled: editDraft.trim() === "", onClick: doSendEdit }, "重新发送")
            )
          )
        ) : null
      );
    }

    function apply(ctx) {
      var slots = ctx.get("slots");
      if (slots === undefined) return;

      slots.inject("shell.overlay", function () {
        return slots.register(
          { name: "shell.overlay", id: "qjump-bar" },
          function (props) {
            var currentId = (props.useSessions ? props.useSessions(function (s) { return s.current; }) : undefined);
            var useState = React.useState, useEffect = React.useEffect, useCallback = React.useCallback, useMemo = React.useMemo, useRef = React.useRef;
            var turnsState = useState([]);
            var turns = turnsState[0], setTurns = turnsState[1];
            var activeState = useState(null);
            var active = activeState[0], setActive = activeState[1];
            var hoveredState = useState(null);
            var hovered = hoveredState[0], setHovered = hoveredState[1];
            var showPreviewState = useState(false);
            var showPreview = showPreviewState[0], setShowPreview = showPreviewState[1];
            var geometryState = useState(null);
            var geometry = geometryState[0], setGeometry = geometryState[1];
            var previewTopRef = useRef(0);
            var barRef = useRef(null);
            var railRef = useRef(null);

            var collect = useCallback(function () {
              var scrollEl = document.querySelector(SCROLL_SELECTOR);
              if (!scrollEl) { setTurns([]); return null; }
              var nodes = Array.prototype.slice.call(scrollEl.querySelectorAll(USER_SELECTOR));
              var list = nodes.map(function (el, index) {
                return { index: index, el: el, text: compactText(el.textContent) };
              });
              setTurns(list);
              return scrollEl;
            }, []);

            var syncGeometry = useCallback(function () {
              var scrollEl = document.querySelector(SCROLL_SELECTOR);
              if (!scrollEl) { setGeometry(null); return; }
              var rect = scrollEl.getBoundingClientRect();
              if (rect.height < 40) { setGeometry(null); return; }
              setGeometry({
                top: rect.top + rect.height / 2,
                right: Math.max(0, window.innerWidth - rect.right + 6),
                height: Math.min(Math.max(rect.height - 40, 120), 240)
              });
            }, []);

            var syncActive = useCallback(function () {
              var scrollEl = document.querySelector(SCROLL_SELECTOR);
              if (!scrollEl) { setActive(null); return; }
              var rect = scrollEl.getBoundingClientRect();
              var nodes = Array.prototype.slice.call(scrollEl.querySelectorAll(USER_SELECTOR));
              var current = null;
              for (var i = 0; i < nodes.length; i += 1) {
                var r = nodes[i].getBoundingClientRect();
                if (r.bottom >= rect.top) { current = i; break; }
              }
              if (current === null && nodes.length > 0) current = nodes.length - 1;
              setActive(current);
            }, []);

            useEffect(function () {
              collect();
              syncGeometry();
              syncActive();

              // 滚动：capture 捕获所有子容器滚动（容器重建也不丢失）
              var onScroll = function () { syncActive(); syncGeometry(); };
              window.addEventListener("scroll", onScroll, true);
              var onResize = function () { syncGeometry(); };
              window.addEventListener("resize", onResize);

              // body 级 MutationObserver：任何 DOM 增删（新消息、容器重建、切换视图）都会触发。
              // 挂 document.body 而不是某个滚动容器 —— 容器被 DSH 重建后 observer 不会失效。
              var refreshTimer = null;
              var scheduleRefresh = function () {
                if (refreshTimer !== null) return;
                refreshTimer = setTimeout(function () {
                  refreshTimer = null;
                  collect();
                  syncActive();
                  syncGeometry();
                }, 120);
              };
              var mo = typeof MutationObserver !== "undefined" ? new MutationObserver(scheduleRefresh) : null;
              if (mo) mo.observe(document.body, { childList: true, subtree: true });

              // 轮询兜底：即使 MutationObserver 漏报（文档片段替换等），1s 内也会刷新刻度
              var lastTotal = -1;
              var poll = setInterval(function () {
                var scrollEl = document.querySelector(SCROLL_SELECTOR);
                if (!scrollEl) { setTurns([]); return; }
                var n = scrollEl.querySelectorAll(USER_SELECTOR).length;
                if (n !== lastTotal) {
                  lastTotal = n;
                  collect();
                  syncActive();
                }
                syncGeometry();
              }, 1000);

              return function () {
                window.removeEventListener("scroll", onScroll, true);
                window.removeEventListener("resize", onResize);
                if (refreshTimer !== null) clearTimeout(refreshTimer);
                if (mo) mo.disconnect();
                clearInterval(poll);
              };
            }, [collect, syncGeometry, syncActive]);

            useEffect(function () {
              collect();
              syncGeometry();
              syncActive();
            }, [currentId, collect, syncGeometry, syncActive]);

            var total = turns.length;
            var activeTurn = active != null && active >= 0 && active < total ? active : (total > 0 ? total - 1 : null);
            var markerTurns = useMemo(function () { return sampledQuestionTurns(total, activeTurn, 120); }, [total, activeTurn]);
            var hoverIdx = hovered === null ? -1 : markerTurns.reduce(function (closest, turn, index) {
              return closest < 0 || Math.abs(turn - hovered) < Math.abs(markerTurns[closest] - hovered) ? index : closest;
            }, -1);

            var questionFromY = function (clientY) {
              var rail = railRef.current;
              if (!rail || total === 0) return null;
              var railRect = rail.getBoundingClientRect();
              var ratio = Math.max(0, Math.min(1, (clientY - railRect.top) / railRect.height));
              var turn = Math.min(total - 1, Math.floor(ratio * total));
              var barRect = (barRef.current || rail).getBoundingClientRect();
              var turnCenter = railRect.top - barRect.top + ((turn + 0.5) / total) * railRect.height;
              return { turn: turn, previewY: Math.max(0, Math.min(barRect.height, turnCenter)) };
            };

            var jumpTo = function (turn) {
              var target = turns[turn];
              if (!target) return;
              target.el.scrollIntoView({ behavior: "smooth", block: "start" });
              setActive(turn);
            };

            var clearHover = function () {
              setHovered(null);
              setShowPreview(false);
            };

            var onMove = function (e) {
              var hit = questionFromY(e.clientY);
              if (!hit) return;
              previewTopRef.current = hit.previewY;
              setHovered(hit.turn);
              setShowPreview(true);
            };

            var onMouseDown = function (e) {
              if (e.button !== 0) return;
              var hit = questionFromY(e.clientY);
              if (!hit) return;
              e.preventDefault();
              previewTopRef.current = hit.previewY;
              setHovered(hit.turn);
              setShowPreview(true);
              jumpTo(hit.turn);
              // 点击后把焦点交给轨道，让用户可以直接用方向键继续导航
              if (railRef.current) railRef.current.focus();
            };

            var onKeyDown = function (e) {
              if (total === 0) return;
              var current = activeTurn != null ? activeTurn : Math.max(0, total - 1);
              var page = Math.max(1, Math.round(total / 10));
              var next = null;
              switch (e.key) {
                case "ArrowUp": case "ArrowLeft": next = current - 1; break;
                case "ArrowDown": case "ArrowRight": next = current + 1; break;
                case "PageUp": next = current - page; break;
                case "PageDown": next = current + page; break;
                case "Home": next = 0; break;
                case "End": next = total - 1; break;
                case "Enter": case " ": next = current; break;
                default: return;
              }
              e.preventDefault();
              jumpTo(Math.max(0, Math.min(total - 1, next)));
            };

            var dotProps = function (idx, turn) {
              var isActive = activeTurn === turn;
              if (hoverIdx < 0) {
                return { width: isActive ? 18 : 12, background: isActive ? BRIGHT_TOKEN : COLOR_DIM };
              }
              var d = Math.abs(idx - hoverIdx);
              var width = d === 0 ? 32 : d === 1 ? 20 : d === 2 ? 14 : (isActive ? 18 : 12);
              var background = d === 0 ? BRIGHT_TOKEN
                : d === 1 ? "color-mix(in srgb, var(--dsw-alias-state-business-primary) 60%, transparent)"
                : d === 2 ? "color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent)"
                : (isActive ? BRIGHT_TOKEN : COLOR_DIM);
              return { width: width, transitionDelay: Math.min(d, 3) * 20 + "ms", background: background };
            };

            if (!geometry || total === 0) return null;
            var density = markerTurns.length > 80 ? "packed" : markerTurns.length > 40 ? "compact" : "normal";
            var activeValue = activeTurn != null ? activeTurn : Math.max(0, total - 1);
            var hoveredQuestion = hovered !== null && hovered >= 0 && hovered < total ? turns[hovered] : undefined;

            return React.createElement(
              "div",
              { className: "qjump-bar", style: { top: geometry.top - geometry.height / 2 + "px", right: geometry.right + "px", height: geometry.height + "px" }, ref: barRef },
              React.createElement(
                "div",
                {
                  className: "qjump-scroll",
                  ref: railRef,
                  role: "slider",
                  tabIndex: 0,
                  "aria-label": "会话问题导航",
                  "aria-orientation": "vertical",
                  "aria-valuemin": 1,
                  "aria-valuemax": Math.max(1, total),
                  "aria-valuenow": activeValue + 1,
                  "data-density": density,
                  onMouseMove: onMove,
                  onMouseDown: onMouseDown,
                  onMouseLeave: clearHover,
                  onKeyDown: onKeyDown
                },
                markerTurns.map(function (turn, index) {
                  var dot = dotProps(index, turn);
                  return React.createElement(
                    "span",
                    { className: "qjump-item", key: turn, "data-turn": turn, style: { top: ((turn + 0.5) / total) * 100 + "%" } },
                    React.createElement("span", { className: "qjump-dot", style: dot })
                  );
                })
              ),
              showPreview && hoveredQuestion ? React.createElement(
                "div",
                { className: "qjump-preview", style: { top: (geometry.top - geometry.height / 2 + previewTopRef.current) + "px", right: (geometry.right + 44) + "px" } },
                React.createElement("span", { className: "qjump-text" }, hoveredQuestion.text)
              ) : null
            );
          }
        );
      });

      // ---- Interaction overlay: selection add-to-chat + edit message ----
      slots.inject("conversation.input.overlay", function () {
        return slots.register(
          { name: "conversation.input.overlay", id: "qjump-interact" },
          QJumpInteractionOverlay
        );
      });

      // ---- 引用面板：composer 上方一行，展示“追问”引用的文字 ----
      slots.inject("conversation.input.dock", function () {
        return slots.register(
          { name: "conversation.input.dock", id: "qjump-quote", order: 40 },
          QJumpQuotePanel
        );
      });

      // ---- 自定义用户消息渲染器：解析引用标记为可展开的卡片 ----
      slots.inject("conversation.chat.node", function () {
        return slots.register(
          { name: "conversation.chat.node", key: "user", locale: "zh-CN", priority: -1 },
          QJumpUserMessage
        );
      });
    }

    var name = "dsh-question-jump-bar";
    var inject = ["slots"];

    exports.name = name;
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
