/* ============================================================================
 * typing.js —— 首屏「创见」释义打字机
 * 业务背景：站方对「创见」给出的五个释义词（革故鼎新 / 披星戴月 / 破旧立新 /
 * Createful / 吐故纳新）轮播展示。此区域纯装饰，读屏内容由 HTML 里
 * .sr-only 的一次性列表交代，因此动画文本 aria-hidden。
 * 约束：reduce-motion 时静态显示第一个词，不做删除循环。
 * ==========================================================================*/
(function () {
  var el = document.getElementById('type');
  if (!el) return;

  var phrases = ['革故鼎新', '披星戴月', '破旧立新', 'Createful', '吐故纳新'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { el.textContent = phrases[0]; return; }

  var pi = 0;   // 当前短语索引
  var ci = 0;   // 当前已打出的字符数
  var del = false; // 处于删除阶段

  function step() {
    var w = phrases[pi];
    if (!del) {
      ci++;
      if (ci >= w.length) {
        el.textContent = w;
        del = true;
        setTimeout(step, 1600); // 打满后停顿再删
        return;
      }
    } else {
      ci--;
      if (ci <= 0) {
        del = false;
        pi = (pi + 1) % phrases.length; // 删空后换下一个词
      }
    }
    el.textContent = w.slice(0, ci);
    setTimeout(step, del ? 40 : 120);
  }
  step();
})();
