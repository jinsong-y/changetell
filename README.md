# CHANGE_TELL | 易经推演

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 中文说明

### 项目简介
CHANGE_TELL 是一个基于现代人工智能技术的周易起卦与推演应用。它结合了传统的“梅花易数”时间起卦法与 Google 最新的 **Gemini 3.1 Flash Lite** 大语言模型，为用户提供深度的卦象解析与生活建议。

### 核心功能
*   **时间起卦 (梅花易数)**：根据用户求问的精确时间（年、月、日、时）自动推导卦象。
*   **三卦联动**：自动推导**主卦**（现状）、**互卦**（中间过程）与**变卦**（未来趋势）。
*   **AI 深度解析**：利用 Gemini 3.1 Flash Lite 提供结构化的解卦报告，包含卜辞、含义、核心建议及总体运势。
*   **标准卦象展示**：内置六十四卦标准库，确保视觉展示的爻条与传统易理完全一致。
*   **极客风 UI**：采用暗色调、现代化的动效设计，营造神秘且专业的仪式感。

### 技术栈
*   **前端**: React, TypeScript, Tailwind CSS, Motion (framer-motion)
*   **后端**: Vercel Serverless Functions (Node.js)
*   **AI**: Google Generative AI (Gemini 3.1 Flash Lite)

---

<a name="english"></a>
## English Description

### Project Introduction
CHANGE_TELL is an I Ching (Book of Changes) divination and interpretation application powered by modern AI. It combines the traditional "Mei Hua Yi Shu" (Plum Blossom Divination) time-based method with Google's latest **Gemini 3.1 Flash Lite** model to provide profound hexagram analysis and life guidance.

### Core Features
*   **Time-based Divination**: Automatically derives hexagrams based on the precise time (Year, Month, Day, Hour) of the inquiry.
*   **Trio-Hexagram Logic**: Automatically calculates the **Main Hexagram** (Current state), **Mutual Hexagram** (Process), and **Changed Hexagram** (Future trend).
*   **AI Deep Interpretation**: Leverages Gemini 3.1 Flash Lite to deliver structured reports including judgments, meanings, core advice, and overall fortune.
*   **Standardized Visualization**: Built-in library of the 64 hexagrams ensures that the visual representation of lines (Yao) is perfectly consistent with traditional principles.
*   **Geek Aesthetic UI**: Features a dark-themed, modern motion design to create a mysterious and professional atmosphere.

### Tech Stack
*   **Frontend**: React, TypeScript, Tailwind CSS, Motion (framer-motion)
*   **Backend**: Vercel Serverless Functions (Node.js)
*   **AI**: Google Generative AI (Gemini 3.1 Flash Lite)

---

### Deployment / 部署
The project is optimized for deployment on **Vercel**.
项目已针对 **Vercel** 部署进行了优化。

1. Clone the repository.
2. Set up `GOOGLE_GENERATIVE_AI_API_KEY` in your environment variables.
3. Push to Vercel.
\n<!-- Deployment Fix -->
