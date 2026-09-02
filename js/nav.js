/* ============================================================================
 * nav.js —— 导航：小屏汉堡面板 + 当前分区高亮（scrollspy）
 * 设计约束：
 *  1) 汉堡按钮的展开状态用 aria-expanded / hidden 双属性表达，样式与语义同步；
 *  2) 高亮当前分区用 aria-current，CSS 已有 .hud__nav a[aria-current="true"] 规则，
 *     不新增 class，避免两套状态源；
 *  3) 点完导航项自动收起面板，符合移动端习惯；hash 变化也收起（兼容前进后退）。
 * ==========================================================================*/
(function () {
  'use strict';

  var toggle = document.querySelector('.hud__toggle');
  var panel = document.getElementById('hud-panel');
  var navLinks = document.querySelectorAll('.hud__nav a[href^="#"]');
  var panelLinks = panel ? panel.querySelectorAll('a[href^="#"]') : [];

  function setPanel(open) {
    if (!toggle || !panel) return;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  }

  if (toggle && panel) {
    // CSS 在小屏才显示按钮；桌面误触按 Esc 也应能关闭
    toggle.addEventListener('click', function () {
      setPanel(panel.hidden);
    });
    Array.prototype.forEach.call(panelLinks, function (a) {
      a.addEventListener('click', function () { setPanel(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setPanel(false); toggle.focus(); }
    });
    window.addEventListener('hashchange', function () { setPanel(false); });
  }

  /* ---------- scrollspy：标记当前所在分区 ---------- */
  var sections = [];
  Array.prototype.forEach.call(navLinks, function (a) {
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ link: a, sec: sec });
  });

  if (sections.length) {
    // 判定规则：取「视口 35% 高度那条线」落在哪个分区里。
    // 直接几何计算比 IntersectionObserver 回调顺序可靠（快速滚动时回调会乱序）。
    var ticking = false;

    function recalc() {
      ticking = false;
      var probe = window.innerHeight * 0.35;
      var hit = null;
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].sec.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) { hit = sections[i]; break; }
      }
      sections.forEach(function (s) {
        if (s === hit) s.link.setAttribute('aria-current', 'true');
        else s.link.removeAttribute('aria-current');
      });
    }

    function onScroll() {
      if (ticking) return;      // rAF 节流：一帧只算一次
      ticking = true;
      requestAnimationFrame(recalc);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    recalc();
  }
})();
