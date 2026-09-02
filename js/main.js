/* ============================================================================
 * main.js —— 全站公共能力：成就提示条（toast）+ 服务器地址一键复制
 * 业务背景：首屏彩蛋方块、复制服务器地址两个动作共用同一条「进度达成」提示，
 * 语义上模仿 Minecraft 的成就弹窗，所以做成全局单例挂在 window.CF 上。
 * 约束：DOM 结构缺失时静默退出，不阻断后续脚本。
 * ==========================================================================*/
(function () {
  'use strict';

  var el = document.getElementById('toast');
  var titleEl = document.getElementById('toast-title');
  var textEl = document.getElementById('toast-text');
  var timer = 0;

  function hide() {
    if (!el) return;
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
  }

  /**
   * 弹出一条成就式提示。
   * @param {string} title 主标题（如「进度达成！」）
   * @param {string} text  内容行
   * @param {number} [ms]  停留毫秒，默认 3800
   */
  function toast(title, text, ms) {
    if (!el || !titleEl || !textEl) return; // 结构被删时降级为无提示，不报错
    titleEl.textContent = title;
    textEl.textContent = text;
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(hide, ms || 3800);
  }

  /* ---------- 服务器地址：点击复制 ---------- */
  /* 旧站是纯文本，复制要靠手选；这里做成按钮 + 成就反馈。
     剪贴板 API 在 file:// 或非安全上下文下会失败，必须有 execCommand 兜底，
     两条路都失败时至少把地址通过提示条告知用户，不出现「点了没反应」。 */
  var addr = document.getElementById('copy-addr');
  if (addr) {
    addr.addEventListener('click', function () {
      var v = addr.getAttribute('data-addr') || addr.textContent.trim();
      copy(v).then(function (ok) {
        toast(ok ? '进度达成！' : '手动复制',
              ok ? '服务器地址已复制：' + v : '浏览器拒绝了剪贴板，地址是 ' + v);
      });
    });
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return legacyCopy(text); } // 权限被拒时退回旧接口
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  window.CF = { toast: toast };
})();
