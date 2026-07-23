# CareerOps: AI CV Matcher

<div align="center">
  <h3>Match. Tailor. Hire.</h3>
  <p>The ultimate AI-powered resume and cover letter tailoring engine for modern professionals.</p>
</div>

---

## 🚀 Overview

**CareerOps** is a modern, high-performance web application designed to help job seekers instantly tailor their resumes and cover letters to specific job descriptions. By leveraging advanced LLM capabilities (Gemini API), the platform analyzes a candidate's profile against a job description, calculates a precise match score, and generates highly tailored application materials designed to pass ATS (Applicant Tracking Systems) and impress human recruiters.

## ✨ Features

- **Progressive Onboarding Wizard**: A seamless, intuitive 3-step workflow (Upload Profile → Provide Job Description → Get Results).
- **Intelligent Scoring System**: Generates a detailed breakdown of strengths, weaknesses, and missing keywords based on the job description.
- **Multilingual Support**: Automatically detects the language of the job description (English or French) and generates tailored content accordingly.
- **Instant Export**: Export tailored resumes and cover letters directly to PDF or LaTeX formats without leaving the app.
- **Brutalist, High-Contrast UI**: Designed with a sleek, minimalist tech aesthetic featuring solid high-contrast elements, fluid animations, and full Light/Dark mode support.
- **Local History**: Automatically saves analysis history locally so users can revisit past job matches.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Integration**: [@google/genai](https://github.com/google/gemini-nodejs) (Gemini 2.5 Flash)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Geist](https://vercel.com/font)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- A Gemini API Key (Can be configured directly in the app UI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deaThGuNNNN/AI-CV-Matcher.git
   cd AI-CV-Matcher
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Visit `http://localhost:3000` in your browser.

## 📐 Architecture & Design

CareerOps was built with a focus on **speed** and **user experience**. The architecture leverages Next.js App Router for clean route separation (Landing Page at `/`, core application at `/app`), ensuring the landing page remains incredibly lightweight while the highly interactive matching wizard is perfectly encapsulated. 

State is managed cleanly across components, and local storage is utilized to persist user settings (like API keys) and past analysis history securely on the client-side.

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
