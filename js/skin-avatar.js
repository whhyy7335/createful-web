/* ============================================================================
 * skin-avatar.js —— 管理团队头像：按 Minecraft 皮肤规范裁脸部
 * 为什么不用 CSS background 直接裁：MC 皮肤是 64×64 的两段式展开图，脸部正面
 * 在 (8,8)-(16,16)，但头顶还有一层「帽子层」(40,8)-(48,16) 需要叠加，
 * CSS 叠两层 background 做像素放大容易糊边，用 canvas 按整数倍放大最干净。
 * 兜底：file:// 下 drawImage 会因跨源污染画布，catch 后退回 CSS 背景定位，
 * 保证本地双击预览也不出现空白头像。
 * ==========================================================================*/
(function () {
  'use strict';

  var faces = document.querySelectorAll('canvas.skin-face');
  if (!faces.length) return;

  // MC 标准皮肤脸部区域（64×64 布局）
  var FACE = { x: 8, y: 8, w: 8, h: 8 };
  var HAT  = { x: 40, y: 8, w: 8, h: 8 };
  var SCALE = 8; // 输出 64×64，CSS 再 pixelated 拉伸到 72px

  Array.prototype.forEach.call(faces, function (cv) {
    var src = cv.getAttribute('data-skin');
    if (!src) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    var img = new Image();
    img.onload = function () {
      try {
        // 脸部打底
        ctx.drawImage(img, FACE.x, FACE.y, FACE.w, FACE.h, 0, 0, cv.width, cv.height);
        // 帽子层只在非全透明像素上叠加（标准皮肤 hat 层其余部分为透明）
        ctx.drawImage(img, HAT.x, HAT.y, HAT.w, HAT.h, 0, 0, cv.width, cv.height);
      } catch (e) {
        // SecurityError（画布被跨源污染）→ 用背景图兜底
        fallback(cv);
      }
    };
    img.onerror = function () { fallback(cv); }; // 皮肤文件缺失/改名时不白屏
    img.src = src;
  });

  /** 退路：把皮肤头部区域用 CSS background 定位显示，并隐藏失效的 canvas */
  function fallback(cv) {
    var wrap = cv.parentNode;
    var src = cv.getAttribute('data-skin');
    if (!wrap || !src) return;
    cv.style.display = 'none';
    // 容器 72px 显示皮肤 8px 区域 → 整图放大 9 倍（background-size 900%），
    // 脸部起点 (8,8) 换算成百分比定位 = 12.5%
    wrap.style.backgroundImage = 'url("' + src + '")';
    wrap.style.backgroundSize = '900% 900%';
    wrap.style.backgroundPosition = '12.5% 12.5%';
    wrap.style.imageRendering = 'pixelated';
    wrap.style.backgroundRepeat = 'no-repeat';
  }
})();
