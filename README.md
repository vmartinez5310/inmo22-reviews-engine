# Serverless Real Estate Review Engine

A production-ready, full-stack social proof system developed for **Inmobiliarte 22**. This project automates the lifecycle of customer testimonials, from data ingestion to SEO-optimized delivery, utilizing a serverless architecture.



## 🚀 Key Engineering Features
- **Serverless API Backend:** Leverages Google Apps Script to expose a RESTful endpoint, serving real-time JSON payloads from a cloud-based spreadsheet database.
- **Dynamic SEO Indexing:** Implements **JSON-LD (Schema.org)** injection to provide structured data for search engines and AI agents, enhancing local SEO authority.
- **UX Optimization:** Built with a custom **Skeleton Screen** pattern to reduce perceived latency and improve Core Web Vitals (LCP).
- **Responsive Navigation:** A custom-built carousel engine with adaptive pagination (Desktop/Tablet/Mobile) and state-aware UI controls.
- **Enterprise Workflow:** Integrated "Broker-Approval" logic, allowing manual validation and corporate responses before public rendering.

## 🛠️ Tech Stack
- **Frontend:** Vanilla JavaScript (ES6 Modules), CSS3 (Custom Variables & Animations), HTML5.
- **Backend:** Google Apps Script (Serverless), JSON-LD (Schema.org).
- **Architecture:** Decoupled Headless approach.

## 📁 Project Structure
- `/src/backend`: Google Apps Script source code.
- `/src/frontend`: Modular JS, CSS, and HTML assets.
- `config.example.js`: Template for sensitive endpoint configuration.

## 💡 AEM Developer Context
This project demonstrates my ability to architect **Headless content solutions**, a critical skill in **AEM Cloud Service** environments. It mirrors the logic of consuming external APIs via **Sling Models** and rendering them through dynamic frontend components.

---
Developed by **Valente Martínez** | Software Engineer