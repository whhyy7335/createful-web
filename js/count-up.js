/* ============================================================================
 * count-up.js —— 成就区大数字滚动
 * 设计意图：数字是这块唯一的视觉主角，从 0 滚到真实值强化「达成」的成就感。
 * 关键约束：HTML 里 .count 已写好真实数字作为无 JS 兜底，本脚本执行时才清零
 * 重滚；滚完必须把文本还原成原始值，避免动画误差留下 50 / 320 这种错数。
 * ==========================================================================*/
(function () {
  'use strict';

  var nums = document.querySelectorAll('.count');
  if (!nums.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return; // 保持 HTML 原值即可

  var started = false;

  function run(el) {
    var target = parseInt(el.getAttribute('data-to') || el.textContent, 10);
    if (!isFinite(target)) return; // 数据异常时保留原文本，不写 NaN
    var t0 = 0;
    var dur = 1100;
    el.textContent = '0';
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic：先快后慢，符合「计数」直觉
      el.textContent = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toString(); // 收尾强制精确值
    }
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function (entries) {
    if (started) return;
    var hit = entries.some(function (e) { return e.isIntersecting; });
    if (!hit) return;
    started = true;      // 只滚一次，来回滚动不重复播放
    io.disconnect();
    Array.prototype.forEach.call(nums, run);
  }, { threshold: 0.3 });

  var anchor = document.querySelector('.stats');
  if (anchor) io.observe(anchor);
})();
