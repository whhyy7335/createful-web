# CREATEFUL 创见

## 这是什么

CREATEFUL，中文名「创见」，是一个以 Minecraft 生存与轻量玩法为核心的小型公益服务器。
	
服务器最早起步于 2022 年 8 月 9 日，经历过面板服、关服、重开、重置、玩家流失，也经历过重新搭建、优化体验、整理玩法和重新出发。

## 昼夜系统

`js/day-cycle.js` 读取访客浏览器本地时间，沿一条弧线驱动太阳、月亮、天空分层
（正午 / 黄昏 / 深夜）与星星。6 点日出、12 点正午、18 点日落。禁用 JS 时天空
恒为黄昏，太阳停在默认位置，不影响阅读。

## 时间机器

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

服务器地址：`mc.createful.cn`
官网：[createful.cn](https://createful.cn)
QQ 群：[点击加入 QQ 群](https://qm.qq.com/q/43ovCosqCc)
实时仪表盘：[dashboard.createful.cn](https://dashboard.createful.cn)
Wiki：[wiki.createful.cn/docs](https://wiki.createful.cn/docs)

