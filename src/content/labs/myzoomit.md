---
kind: labs
tags: [labs]
title: MyZoomIt
description: 给演讲者、演示者的轻巧屏幕标注工具。基于 Windows Ink，支持触控笔、触摸和鼠标，快捷键驱动，免费便携，程序不到 0.6 MB。
cover: /uploads/labs-myzoomit.svg
projectUrl: https://github.com/Algustav/myZoomit/releases/download/v1.7/MyZoomIt-v1.7-win-x64.zip
pubDate: 2026-10-01
order: 0
---

## 给演示者的一支屏幕画笔

MyZoomIt 是我一直使用的 [ZoomIt](https://learn.microsoft.com/zh-cn/sysinternals/downloads/zoomit) 的现代改进版：轻量、快捷键驱动，尽量减少屏幕上的视觉干扰，让演示者把注意力放在讲解上。

我把绘图改为使用 **Windows Ink 原生控件**，追求更流畅的笔画和更好的系统兼容性，体验可以参考 Office 中的绘图工具。

**[下载便携版](https://github.com/Algustav/myZoomit/releases/download/v1.7/MyZoomIt-v1.7-win-x64.zip)** · [GitHub 项目与源码](https://github.com/Algustav/myZoomit)

适用 **Windows 11 x64**。配置随程序文件夹携带，免费使用，无需注册。展厅里的“打开体验”按钮也会直接下载便携版。

## 介绍动画

<video controls playsinline preload="metadata" poster="/uploads/labs-myzoomit.svg" aria-label="MyZoomIt 介绍动画" style="display:block;width:100%;height:auto;border-radius:16px;">
  <source src="/uploads/myzoomit-demo.mp4" type="video/mp4" />
  你的浏览器不支持视频播放，可<a href="/uploads/myzoomit-demo.mp4">下载介绍动画</a>观看。
</video>

## 主要特点

- **三种输入方式**：支持电磁／电容触控笔（如 Surface 系列设备）、手指触控和鼠标绘制。
- **平滑笔迹**：使用 Windows Ink，方便书写、整笔擦除、撤销与恢复；鼠标和触摸绘制也提供模拟压感的笔迹效果。
- **适应演示环境**：支持多屏幕，并兼容 Windows 自带的屏幕放大镜（`Win` + `+`）。
- **全屏演示**：适配 Edge 全屏和 PowerPoint 放映，避免呼出标注时任务栏意外出现。
- **快捷键优先**：为演示者优化的极简操作，减少屏幕视觉干扰。
- **轻巧便携**：可执行文件不到 **0.6 MB**，配置随身携带。
- **开源免费**：使用 C++ 开发，采用 MIT 协议。

## 开始使用

运行程序后，它会常驻系统托盘，图标可能位于隐藏图标区。

默认按 **`Ctrl + 2`** 进入屏幕标注，再按一次或按 `Esc` 退出。这个快捷键来自我的个人习惯，可以修改。进入标注后，即可使用鼠标、触控笔或手指绘制。

### 图形与颜色

| 图形 | 模式按键 | 临时修饰键 |
| --- | --- | --- |
| 手写 | `1` | — |
| 矩形 | `2` | `Ctrl` |
| 椭圆 | `3` | `Tab` |
| 直线 | `4` | `Shift` |
| 箭头 | `5` | `Ctrl + Shift` |

按下对应字母即可切换笔迹颜色：**`R` 红色、`G` 绿色、`B` 蓝色、`O` 橙色、`Y` 黄色、`P` 紫色、`W` 白色**。

### 常用操作

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl + 滚轮` | 调整笔迹粗细，范围 6–24 px，默认 12 px |
| `Ctrl + Z` | 撤销绘制、擦除或清空操作 |
| `Ctrl + Y` | 恢复撤销的操作 |
| `K` | 切换为纯黑背景，模拟黑板书写 |
| `E` | 切换整笔橡皮擦，再按一次恢复画笔 |
| `C` | 清空笔迹 |
| `Ctrl + 2` 或 `Esc` | 退出标注 |

**退出标注会清空笔迹。** 如需保留，请在退出前按 `PrtScr`／`PrtScn` 截屏保存。

## 演示辅助功能

- **鼠标强调**：可启用系统鼠标设置中的“按 Ctrl 显示鼠标位置”，帮助观众跟上演示者的指引。
- **开机自动运行**：让工具随时待命，减少演示前的准备操作。
- **可选悬浮状态菜单**：按需显示当前颜色、笔宽和图形快捷键，默认关闭。
- **便携设置**：快捷键、颜色、笔宽和工具保存在程序旁的 `settings.ini`。开机自启与系统鼠标强调属于当前电脑设置，不会随文件夹迁移。

## 致谢

鼠标和触摸屏绘制的算法借鉴了 [perfect-freehand](https://github.com/steveruizok/perfect-freehand)，用于改善笔画起笔粗头和不平顺的问题。
