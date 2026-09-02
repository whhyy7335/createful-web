/* ============================================================================
 * lightbox.js —— 作品墙大图查看器（无第三方依赖）
 * 业务背景：玩家建筑截图是本站最有说服力的内容，缩略图看不清细节，需要点开看。
 * 设计约束：
 *  1) 结构已在 HTML 里写好（#lightbox），本脚本只负责填充与切换，不动态建 DOM；
 *  2) 必须可键盘操作：Enter 打开、← → 切换、Esc 关闭，且关闭后焦点归还触发元素；
 *  3) 打开时锁 body 滚动，避免背景跟随滚动条跳动。
 * ==========================================================================*/
(function () {
  'use strict';

  var box = document.getElementById('lightbox');
  var img = document.getElementById('lb-img');
  var cap = document.getElementById('lb-caption');
  var idx = document.getElementById('lb-index');
  var prev = document.getElementById('lb-prev');
  var next = document.getElementById('lb-next');
  var close = document.getElementById('lb-close');
  if (!box || !img || !prev || !next || !close) return;

  var frames = Array.prototype.slice.call(document.querySelectorAll('.frame[data-full]'));
  if (!frames.length) return;

  var cur = 0;
  var lastFocus = null;

  function show(i) {
    cur = (i + frames.length) % frames.length; // 环形切换，最后一张能到第一张
    var f = frames[cur];
    img.src = f.getAttribute('data-full');
    img.alt = f.getAttribute('data-caption') || '玩家作品大图';
    if (cap) cap.textContent = f.getAttribute('data-caption') || '';
    if (idx) idx.textContent = (cur + 1) + ' / ' + frames.length;
    prev.disabled = frames.length < 2;
    next.disabled = frames.length < 2;
  }

  function open(i, trigger) {
    lastFocus = trigger || document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function shut() {
    box.hidden = true;
    document.body.style.overflow = '';
    img.removeAttribute('src'); // 释放已加载的大图内存
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  frames.forEach(function (f, i) {
    f.addEventListener('click', function () { open(i, f); });
  });

  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  close.addEventListener('click', shut);

  // 点遮罩关闭：只有点在 figure 之外才算遮罩
  box.addEventListener('click', function (e) { if (e.target === box) shut(); });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') shut();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'Tab') {
      // 焦点圈在对话框内，避免 Tab 跑到背景内容
      var f = [prev, next, close];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  });
})();
