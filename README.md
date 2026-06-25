# 🛡️ Community Hero

> **Hyperlocal Civic Action & Verification Network**  
> *A full-stack, AI-powered civic hazard reporting, tracking, and verification platform.*

🌐 **[Live Demo Hosted on Google Cloud](https://community-hero-b612d.web.app)**

---

## 📖 Project Overview

**Community Hero** is a hyperlocal citizen-engagement platform that empowers residents to report, verify, and track municipal infrastructure hazards (e.g., potholes, utility failures, waste overflow) in real-time. 

To overcome low engagement seen in traditional reporting portals, Community Hero introduces **Gamified Neighborhood Leagues (Karma Points)** and a **Sponsor-Funded Voucher Store**.

---

## ⚡ Key Features

1. **AI Vision Ingestion (Gemini 1.5 Flash)**: Upload an image or snap a live photo of a civic hazard. Gemini Vision automatically analyzes the incident, classifies it, assesses severity, and populates the details form.
2. **Hyperlocal City-Scoped Leagues**: Switch active cities (Bengaluru, Chennai, Delhi, Mumbai). The map, dashboards, active feeds, and leaderboards scope instantly to that city's local league.
3. **Interactive Leaflet Map**: Premium dark-mode maps showcasing custom, emoji-themed status markers with reactive sidebars.
4. **Anti-Fraud Guardrails**: 
   * **Self-Verification Block**: Prevents citizens from upvoting/verifying their own reports.
   * **Owner-Restricted Deletion**: Only the original creator can remove an issue from the active grid.
   * **Duplicate Signature Detection**: Computes a polynomial roll-hash of image uploads to prevent spamming.
5. **AI Civic Routing Agent**: Automatically drafts a formal municipal grievance petition utilizing coordinates and descriptions, ready to be dispatched to local authorities.
6. **AI Predictive Insights**: Scopes active hotspots, estimates resolution times, and compiles workload bottleneck forecasts per city.
7. **Karma Store**: Redeem earned points for sponsor vouchers funded by local businesses.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite
* **Maps**: Leaflet API, React-Leaflet (using CartoDB Dark Matter tiles)
* **Styling**: Vanilla CSS (Responsive Layouts, Glassmorphism, CSS grid overlays, Bezier transitions)
* **API / Backend Integration**: Google Gemini AI SDK, LocalStorage state syncing, HTML Canvas compression.

---

## ⚙️ Quick Start

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run Locally
Start the local Vite development server:
```bash
npm run dev
```
Open `http://localhost:3000` (or the terminal-provided link) in your browser.

### 3. Active Gemini API
To run the vision processor and drafting agents live:
1. Open the application.
2. Click **Configure Gemini** in the sidebar.
3. Paste your Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/)).
4. The status will switch to **Active 🟢** and run live queries against Gemini.

---

## 🚀 Hackathon Submission Status
* **Google Technologies utilized**: Gemini AI API (multimodal flash model), Google AI Studio.
* **Hosting capability**: Built to build into a single index bundle for secure deployment on Google Cloud (Firebase Hosting).
