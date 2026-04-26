# CHANGE_TELL | 易经推演

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 中文说明

### 项目简介
CHANGE_TELL 是一个基于现代人工智能技术的周易起卦与推演应用。它结合了传统的“梅花易数”时间起卦法与 Gemini API，为用户提供深度的卦象解析与生活建议。

### 核心功能
*   **时间起卦 (梅花易数)**：根据用户求问的精确时间（年、月、日、时）自动推导卦象。
*   **三卦流程推演**：自动推导本卦、互卦、变卦，分别对应当前状态、中间过程与最终趋势。
*   **体用生克判断**：按动爻定位体卦与用卦，并以五行生克输出核心吉凶。
*   **时令辅助分析**：结合农历月份判断体卦旺相休囚，作为辅助因素修正判断语气。
*   **AI 结构化解读**：Gemini 只负责文化化表达与建议，核心卦象、体用、生克、吉凶由本地规则确定。
*   **标准卦象展示**：内置六十四卦标准库，确保视觉展示的爻条与传统易理完全一致。
*   **极客风 UI**：采用暗色调、现代化的动效设计，营造神秘且专业的仪式感。

### 技术栈
*   **前端**: React, TypeScript, Tailwind CSS, Motion (framer-motion)
*   **后端**: Vercel Serverless Functions (Node.js)
*   **AI**: Gemini API（模型由 `api/chat.ts` 配置）

---

<a name="english"></a>
## English Description

### Project Introduction
CHANGE_TELL is an I Ching (Book of Changes) divination and interpretation application powered by modern AI. It combines the traditional "Mei Hua Yi Shu" (Plum Blossom Divination) time-based method with the Gemini API to provide hexagram analysis and life guidance.

### Core Features
*   **Time-based Divination**: Automatically derives hexagrams based on the precise time (Year, Month, Day, Hour) of the inquiry.
*   **Three-Stage Hexagram Flow**: Deterministic local rules calculate the **Original Hexagram** (current state), **Mutual Hexagram** (middle process), and **Changed Hexagram** (final trend).
*   **Body/Use Five-Element Judgment**: Local rules locate the body and use trigrams from the moving line, evaluate the five-element relation, and compute the core auspiciousness.
*   **Seasonal Context Adjustment**: Local rules use the lunar month to assess whether the body trigram is prosperous, supported, resting, imprisoned, or exhausted, then adjust the judgment tone.
*   **AI Structured Interpretation**: Gemini provides structured cultural expression and practical advice only; core hexagrams, body/use logic, five-element relation, and `overallStatus` are determined locally.
*   **Standardized Visualization**: Built-in library of the 64 hexagrams ensures that the visual representation of lines (Yao) is perfectly consistent with traditional principles.
*   **Geek Aesthetic UI**: Features a dark-themed, modern motion design to create a mysterious and professional atmosphere.

### Tech Stack
*   **Frontend**: React, TypeScript, Tailwind CSS, Motion (framer-motion)
*   **Backend**: Vercel Serverless Functions (Node.js)
*   **AI**: Gemini API (model configured in `api/chat.ts`)

---

### Deployment / 部署
The project is optimized for deployment on **Vercel**.
项目已针对 **Vercel** 部署进行了优化。

1. Clone the repository.
2. Set up `GOOGLE_GENERATIVE_AI_API_KEY` in your environment variables.
3. Push to Vercel.

## Vercel 部署

部署到 Vercel 时，需要在 Project Settings → Environment Variables 中配置：

* `GOOGLE_GENERATIVE_AI_API_KEY`：服务端 `/api/chat` 调用 Gemini 使用。

本地 `npm run build` 不需要该变量；线上请求 `/api/chat` 时必须存在。
