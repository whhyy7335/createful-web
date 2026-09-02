/* ============================================================================
 * easter-egg.js —— 首屏地形里那块颜色略偏的方块（页脚 Tips 预告的彩蛋）
 * 交互设定：敲一下播放方块碎裂动画，随后弹出 MC 成就式提示条，
 * 动画结束后方块自行恢复，允许别人再敲（不做一次性消耗，公益服图一乐）。
 * 依赖：window.CF.toast（main.js 提供）。toast 缺失时静默降级为只播动画。
 * ==========================================================================*/
(function () {
  'use strict';

  var block = document.getElementById('egg-block');
  if (!block) return;

  var cracked = false;

  block.addEventListener('click', function () {
    if (cracked) return;          // 碎裂动画播放中不重复触发
    cracked = true;
    block.classList.add('cracked');

    if (window.CF && window.CF.toast) {
      window.CF.toast('进度达成！', '你敲碎了创见的第一块方块。欢迎回家。');
    }

    // CSS 动画 0.3s 且 forwards，播完停在碎裂态；这里复位以便再次点击
    setTimeout(function () {
      block.classList.remove('cracked');
      cracked = false;
    }, 380);
  });
})();
