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
      ".qjump-scroll{position:relative;width:32px;height:100%;cursor:pointer;pointer-events:auto;outline:none}",
      ".qjump-scroll::before{content:'';position:absolute;left:0;top:8%;bottom:8%;width:1.5px;border-radius:2px;background:linear-gradient(180deg,transparent,rgba(220,223,228,.85) 18%,rgba(220,223,228,.85) 82%,transparent);opacity:0;transform:scaleY(.6);transition:opacity .3s ease,transform .3s ease}",
      ".qjump-scroll:focus-visible::before{opacity:1;transform:scaleY(1);animation:qjump-focus-pulse 2.6s ease-in-out infinite}",
      "@keyframes qjump-focus-pulse{0%,100%{opacity:.45}50%{opacity:1}}",
      ".qjump-scroll:focus-visible .qjump-dot{box-shadow:0 0 10px rgba(220,223,228,.7)}",
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
    }

    var name = "dsh-question-jump-bar";
    var inject = ["slots"];

    exports.name = name;
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
