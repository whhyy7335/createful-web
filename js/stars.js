/* ============================================================================
 * stars.js —— 首屏黄昏天空的星点
 * 设计意图：星星数量与位置纯装饰、无需可访问，因此不进 HTML（避免源码噪音），
 * 由 JS 随机撒 <i> 节点；CSS 里 .hero__stars i 已有闪烁动画，这里只写随机量。
 * 约束：prefers-reduced-motion 时不生成（CSS 也会关掉动画，双重保险）。
 * ==========================================================================*/
(function () {
  'use strict';

  var host = document.getElementById('stars');
  if (!host) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 屏幕越宽星星越多，上限 72，移动端不至于太耗
  var count = Math.min(72, Math.round(window.innerWidth / 18));
  var frag = document.createDocumentFragment();

  for (var i = 0; i < count; i++) {
    var s = document.createElement('i');
    var dur = 2.2 + Math.random() * 3.4;
    s.style.left = (Math.random() * 100).toFixed(2) + '%';
    // 只在天空上半区，避免压在剪影地形上
    s.style.top = (Math.random() * 52).toFixed(2) + '%';
    s.style.animationDuration = dur.toFixed(2) + 's';
    // 负延迟：加载即处于动画中段，不会出现「全体同步眨眼」
    s.style.animationDelay = (-Math.random() * dur).toFixed(2) + 's';
    frag.appendChild(s);
  }
  host.appendChild(frag);
})();
