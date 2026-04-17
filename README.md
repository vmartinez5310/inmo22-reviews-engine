# Serverless Real Estate Review Engine (Micro-Frontend)

A production-ready, full-stack social proof system developed for Inmobiliarte 22. This project automates the lifecycle of customer testimonials, from data ingestion to SEO-optimized delivery, utilizing a serverless, decoupled architecture.

🚀 Key Engineering Features

* **Micro-Frontend Architecture:** Encapsulated "Smart Mount" deployment (Plug & Play) via a single DOM entry point (`#ier-app-root`). The component is self-rendering and isolated, preventing CSS/JS conflicts with rigid host platforms (like EasyBroker).
* **AIO & Dynamic SEO Indexing:** Implements JSON-LD (Schema.org) injection to provide structured data for Search Engines and AI/Generative Engine Optimization (GEO). The script dynamically injects `AggregateRating` metadata strictly on the host landing page, enhancing local authority without penalty risks.
* **Dynamic Theming & UI Encapsulation:** Configurable UI injection that adapts to brand guidelines (e.g., `theme: 'magenta'`) via JS parameters, built on a robust Flexbox layout to prevent stacking context and overflow issues.
* **Serverless API Backend:** Leverages Google Apps Script to expose a RESTful endpoint, serving real-time JSON payloads from a cloud-based spreadsheet database.
* **UX Optimization:** Built with a custom, synchronous Skeleton Screen pattern to reduce perceived latency and improve Core Web Vitals (LCP) before the data fetch resolves.
* **Enterprise Workflow:** Integrated "Broker-Approval" logic, allowing manual validation and corporate responses before public rendering.

🛠️ Tech Stack

* **Frontend:** Vanilla JavaScript (ES6 Modules, DOM Manipulation), CSS3 (Flexbox Architecture, Custom Variables & Animations), HTML5.
* **Backend:** Google Apps Script (Serverless API), JSON-LD (Schema.org).
* **Architecture:** Micro-Frontend, Decoupled Headless approach.

📁 Project Structure

* `/src/backend`: Google Apps Script source code.
* `/src/frontend`: Modular JS, CSS, and HTML assets.
* `config.example.js`: Template for sensitive endpoint configuration.

💡 AEM Developer Context

This project demonstrates my ability to architect Headless content solutions and micro-frontends, a critical skill in modern AEM Cloud Service environments. It mirrors the logic of consuming external APIs via Sling Models, dynamically theming output via Policy Configurations, and rendering self-contained, drag-and-drop functional components.

Developed by Valente Martínez | Software Engineer