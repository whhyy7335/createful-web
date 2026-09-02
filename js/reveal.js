/* ============================================================================
 * reveal.js —— 区块入场动画
 * 设计原则：隐藏态挂在 CSS 的 .js .reveal 上（<head> 里一行脚本决定 html.js），
 * 本文件只负责给进入视口的元素补 .in。JS 不执行 = 永远不会有 .in，但 CSS 的
 * 隐藏态也依赖 .js 类，因此即使脚本失败，内容仍保持完整可见。
 * 环境不支持 IntersectionObserver 时同样直接放弃动画、保留内容。
 * ==========================================================================*/
(function () {
  'use strict';

  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    // 老浏览器：不动画，兜底把入场状态补齐，避免卡在半透明
    Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target); // 一次性动画，播过不再触发
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  Array.prototype.forEach.call(items, function (el) { io.observe(el); });
})();
