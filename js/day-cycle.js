/* ============================================================================
 * day-cycle.js —— 首屏天空跟随访客本地时间变化
 * 模型（极简太阳高度角）：
 *   alt = sin(π × (h - 6) / 12)，h 为当地小时数。6 点日出 alt=0，
 *   12 点正午 alt=1，18 点日落 alt=0，夜里为负。不做经纬度/真实天文历，
 *   公益服官网要的是「它认识现在几点」的感觉，不是瑞士天文台。
 * 渲染策略：.hero 底色是写死的黄昏渐变，night / day 两层叠在其上，
 *   本脚本只按 alt 查关键帧表算两层的透明度。太阳贴着地平线附近、
 *   两层权重都归零时，露出的就是黄昏，所以晨昏各约一小时不用单独一层。
 * 无 JS：两层 opacity 默认 0 → 永远是黄昏，与旧版行为一致（优雅降级）。
 * 性能：每 60 秒重算一次；CSS 侧有 1.6s 过渡，分钟级的跳变看不出来。
 * ==========================================================================*/
(function () {
  'use strict';

  var root = document.documentElement;
  var stars = document.getElementById('stars');
  if (!root) return;

  /* alt → [night, day] 关键帧（线性插值）。
     刻意让 night 在天全黑前就衰减到 0，day 要到 alt>0.08 才进来，
     中间那段空隙就是留给黄昏渐变自己发光的窗口。 */
  var KEYS = [
    [-1.00, 1, 0],
    [-0.25, 1, 0],
    [-0.06, 0.85, 0],
    [ 0.00, 0.50, 0],
    [ 0.08, 0, 0],     // 日出后 ~45 分钟：黄昏层全显
    [ 0.22, 0, 0.95],
    [ 0.50, 0, 1],
    [ 1.00, 0, 1]
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function weights(alt) {
    if (alt <= KEYS[0][0]) return [KEYS[0][1], KEYS[0][2]];
    for (var i = 1; i < KEYS.length; i++) {
      if (alt <= KEYS[i][0]) {
        var a = KEYS[i - 1], b = KEYS[i];
        var t = (alt - a[0]) / (b[0] - a[0]);
        return [lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
      }
    }
    return [KEYS[KEYS.length - 1][1], KEYS[KEYS.length - 1][2]];
  }

  /** 太阳/月亮弧线：prog 0→1 对应东升西落，x 线性、top 走正弦弧 */
  function arc(prog) {
    return {
      x: (6 + prog * 86).toFixed(2) + '%',                      // 6% → 92%
      top: (76 - Math.sin(Math.PI * prog) * 64).toFixed(2) + '%' // 地平线76% → 最高点12%
    };
  }

  /** 太阳色：贴地平线暮橙，升高连续渐亮。逐分钟小步长重算，肉眼看不到跳变 */
  function mixHex(a, b, t) {
    var pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
    var pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    var hex = function (n) { return ('0' + Math.round(n).toString(16)).slice(-2); };
    return '#' + hex(lerp(pa[0], pb[0], t)) + hex(lerp(pa[1], pb[1], t)) + hex(lerp(pa[2], pb[2], t));
  }
  function sunColor(alt) {
    var t = Math.min(1, Math.max(0, alt));       // 0=贴地平线，1=最高点
    return mixHex('#ff8a2e', '#ffe9a8', t);
  }
  function sunGlow(alt) {
    var t = Math.min(1, Math.max(0, alt));
    return mixHex('#ff9e3d', '#fff3cf', t);
  }

  /* 手动时间（小时，0~24）。null = 跟随访客本地时钟。
     由 time-machine.js 通过 window.CreatefulDay 写入，实现进度条拖拽。 */
  var manualHour = null;

  function currentHour() {
    if (manualHour !== null) return manualHour;
    var now = new Date();
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  }

  function update() {
    var h = currentHour();
    var alt = Math.sin(Math.PI * (h - 6) / 12); // 6 点 0 → 12 点 1 → 18 点 0，夜里为负
    var w = weights(alt);
    var night = w[0], day = w[1];

    var sun = root.style;
    sun.setProperty('--w-night', night.toFixed(3));
    sun.setProperty('--w-day', day.toFixed(3));
    /* 整站 daylight 驱动：0%=夜间端 → 100%=日间端。
       刻意复用上面查表得到的 day 权重，而不是原始 alt。
       原因：alt 是太阳高度角的正弦值，正午才到 1，早上 7 点只有 0.26、
       下午 4 点只有 0.47。若直接用 alt 驱动 UI，会出现「天空已经全亮、
       面板还停在夜里」的脱节。day 权重才是人眼感知到的白昼程度，
       与 .sky--day 层同源，UI 与天空因此永远同步。 */
    sun.setProperty('--daylight', (day * 100).toFixed(1) + '%');
    root.setAttribute('data-daylight', '');

    // 太阳：只在 alt > -0.08（地平线略下）时可见，之后沉没。
    // 坐标不做 0~1 截断：弧线在两端自然延伸到地平线下，靠透明度控制可见性，
    // 太阳会从画面下方平滑滑出，而不是贴边瞬移。
    var dayProg = (h - 6) / 12;                    // 6 点=0，18 点=1
    var s = arc(dayProg);
    sun.setProperty('--sun-x', s.x);
    sun.setProperty('--sun-y', s.top);
    sun.setProperty('--sun-o', alt > -0.08 ? '1' : '0');
    sun.setProperty('--sun-c', sunColor(alt));
    sun.setProperty('--sun-glow', sunGlow(alt));

    // 月亮：18 点升、6 点落，与太阳同一条弧（同样不截断，从地平线下滑入）
    var moonProg = ((h - 18 + 24) % 24) / 12;      // 18 点=0，6 点=1
    var m = arc(moonProg);
    sun.setProperty('--moon-x', m.x);
    sun.setProperty('--moon-y', m.top);
    sun.setProperty('--moon-o', night > 0.05 ? '1' : '0');

    // 星星亮度跟随夜色权重
    if (stars) stars.style.opacity = night.toFixed(3);
  }

  update();
  // 60 秒校准一次；标签页休眠后回到前台也立刻补算，避免停在旧帧
  setInterval(update, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) update();
  });

  /* 对外接口：时间机器（js/time-machine.js）用这三个方法驱动昼夜。
     fast=true 时给 <html> 挂 .day-fast，CSS 侧把过渡缩到 ~90ms，
     拖进度条时太阳跟手；松手后撤掉，恢复 1.6s 的柔和过渡。 */
  window.CreatefulDay = {
    setManualHour: function (h, fast) {
      manualHour = ((h % 24) + 24) % 24;
      root.classList.toggle('day-fast', !!fast);
      update();
    },
    followClock: function () {
      manualHour = null;
      root.classList.remove('day-fast');
      update();
    },
    getHour: currentHour,
    isManual: function () { return manualHour !== null; }
  };
})();
