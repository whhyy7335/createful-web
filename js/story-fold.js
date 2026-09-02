/* ============================================================================
 * story-fold.js —— 四年故事自传的折叠控制
 * 交互约定：HTML 用 <details open> 书写，即「无 JS 时全文可见」；
 * 本脚本在 JS 可用时才把 open 摘掉，让首屏只留第一句「我的服务器，四岁了。」
 * 摘要文案随展开状态变化，让读者知道点下去会发生什么。
 * ==========================================================================*/
(function () {
  'use strict';

  var fold = document.querySelector('.story__fold');
  var summary = document.getElementById('story-toggle');
  if (!fold || !summary) return;

  var label = summary.querySelector('.summary-text');
  var OPEN_TEXT = '收起完整自传';
  var CLOSE_TEXT = '点击展开完整自传';

  // JS 可用 → 初始折叠（默认展开状态只保留引言，避免长文压垮首屏）
  fold.removeAttribute('open');
  if (label) label.textContent = CLOSE_TEXT;

  fold.addEventListener('toggle', function () {
    if (!label) return;
    label.textContent = fold.open ? OPEN_TEXT : CLOSE_TEXT;
  });
})();
