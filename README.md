# CREATEFUL 创见 · 官网静态站

## 昼夜系统

`js/day-cycle.js` 读取访客浏览器本地时间，沿一条弧线驱动太阳、月亮、天空分层
（正午 / 黄昏 / 深夜）与星星。6 点日出、12 点正午、18 点日落。禁用 JS 时天空
恒为黄昏，太阳停在默认位置，不影响阅读。

## 时间机器（v2 新增）

首屏快捷栏最右侧的时钟格（`#tm-toggle`）点开一条 0~24h 的色带进度条：

- 拖动进度条 → 手动推移一天的昼夜动画，太阳月亮跟手
- 点「回到现在」→ 交还给访客本地时钟
- 面板内读数实时显示当前模拟时间；ESC 收起

默认（不点按钮）始终跟随真实时间，与 v1 行为一致。

实现：`js/time-machine.js` 调用 `day-cycle.js` 暴露的 `window.CreatefulDay`
（`setManualHour` / `followClock` / `getHour` / `isManual`）。拖拽期间给 `<html>`
挂 `.day-fast`，把 1.6s 过渡缩到 0.09s 以求跟手，松手后自动撤除恢复柔和渐变。

## 快捷栏

首屏底部 `.hotbar__inner` 共 12 格，从左到右：

```
Wiki | 特性 配方 进度 故事 作品 团队 成就 关于 | QQ群 仪表盘 时间机器
```

## 外链清单

以下地址指向站外，部署后可按需替换：

| 用途 | 地址 | 出现次数 |
| --- | --- | --- |
| 服务器 Wiki | `https://wiki.createful.cn/docs` | 3 |
| 服务器仪表盘 | `https://dashboard.createful.cn` | 5 |
| QQ 群 | `https://qm.qq.com/q/43ovCosqCc` | 4 |
| 玩法调研问卷 | `https://www.wjx.cn/vm/elbPk9e.aspx` | 1 |

Wiki 入口共三处：顶部 HUD 操作区（`团队` 与 `QQ群` 之间，ghost 样式）、小屏导航
面板、首屏快捷栏第 1 格。均为 `target="_blank" rel="noopener noreferrer"`。

## 无障碍与降级

- 所有交互控件为原生 `button` / `input[type=range]`，键盘可达，带 `aria-label`
  与 `aria-expanded`
- `prefers-reduced-motion` 下关闭动画，并隐藏首屏装饰层
- 打印样式仅保留正文与链接原文
