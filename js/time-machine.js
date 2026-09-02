/* ============================================================================
 * time-machine.js —— 首屏「时间机器」：一天进度条
 * 正常进入网站时天空跟随访客本地时钟（day-cycle.js 的默认行为）。
 * 点快捷栏最右侧的时钟格，浮出一条 0~24h 的色带进度条；拖动即手动推移
 * 昼夜（太阳/月亮沿弧线走、天空与星星随之渐变）。点「回到现在」交还时钟。
 * 依赖 day-cycle.js 暴露的 window.CreatefulDay。
 * ==========================================================================*/
(function () {
  'use strict';

  var toggle = document.getElementById('tm-toggle');
  var panel = document.getElementById('tm-panel');
  var slider = document.getElementById('tm-slider');
  var timeOut = document.getElementById('tm-time');
  var reset = document.getElementById('tm-now');
  var day = window.CreatefulDay;
  if (!toggle || !panel || !slider || !day) return;

  var open = false;

  function fmt(hour) {
    var h = Math.floor(hour) % 24;
    var m = Math.floor((hour - Math.floor(hour)) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // 把当前小时（0~24）同步到进度条与读数
  function sync(hour) {
    slider.value = Math.round(hour * 60);
    timeOut.textContent = fmt(hour);
  }

  function apply(fast) {
    var hour = slider.value / 60;
    day.setManualHour(hour, fast);
    timeOut.textContent = fmt(hour);
    reset.hidden = false;
  }

  function setOpen(v) {
    open = v;
    panel.hidden = !v;
    toggle.setAttribute('aria-expanded', String(v));
    toggle.classList.toggle('is-active', v);
    if (v) {
      sync(day.getHour());          // 打开时对齐当前（真实或已手动）时间
      slider.focus();
    }
  }

  toggle.addEventListener('click', function () { setOpen(!open); });

  // 拖动中：太阳跟手（fast → CSS 缩短过渡）
  slider.addEventListener('input', function () { apply(true); });
  // 松手：撤掉 fast，恢复 1.6s 柔和过渡，避免停在拖拽的硬切档
  slider.addEventListener('change', function () { apply(false); });

  reset.addEventListener('click', function () {
    day.followClock();              // 交还给本地时钟
    sync(day.getHour());
    reset.hidden = true;
  });

  // ESC 收起面板，焦点还给按钮
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) { setOpen(false); toggle.focus(); }
  });

  // 面板开着时若时钟在走（非手动），读数跟着刷新；手动状态下不动
  setInterval(function () {
    if (open && !day.isManual()) sync(day.getHour());
  }, 30000);

  reset.hidden = true;             // 初始跟随真实时间，无需「回到现在」
})();
