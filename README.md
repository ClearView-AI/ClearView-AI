# ClearView🧹 AI Software Lifecycle Cleaner

Built for the BNY Mellon Hackathon — Best AI Hack | Best App | Auritas Data Viz | Snowflake

💡 Overview

ClearView is an AI-powered web app that automatically cleans and analyzes messy software inventory data.

Upload a CSV or text export of your organization’s software assets, and ClearView will:

Normalize vendor, product, and version names using the Gemini API

Predict End-of-Support (EOS) dates using rule-based logic or a reference dataset

Visualize lifecycle risk in an interactive dashboard

Export a fully cleaned dataset ready for audits or reports

This helps IT and compliance teams quickly identify outdated or high-risk software.

🧠 Why It Stands Out

⚙️ AI Automation: Gemini AI cleans and standardizes messy data

📊 Data Visualization: Real-time risk charts and lifecycle KPIs

⚡ Full-Stack Simplicity: Local setup, zero external config

🕒 Hackathon-Optimized: Fully demoable in under 10 hours

⚙️ Tech Stack
Layer	Technology
Frontend	React (Vite) + TailwindCSS + Chart.js
Backend	Node.js + Express + Prisma ORM
Database	SQLite (local file database)
AI Integration	Gemini API
Visualization	Chart.js / Plotly
Optional	Snowflake API for cloud storage
🧩 Features

✅ CSV upload and parsing
✅ AI-powered name normalization
✅ EOS prediction and risk tagging
✅ Dashboard with KPIs and charts
✅ Clean CSV export

🏗️ Quick Architecture
frontend/
  src/
    components/ (UploadPanel, Charts, Table)
backend/
  src/
    routes/ (ingest, normalize, eos, export)
    prisma/schema.prisma
data/
  eos_reference.csv

🏁 How to Run Locally
# 1. Clone the repository
git clone https://github.com/yourorg/clearview
cd clearview

# 2. Start the backend
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
# Runs on http://localhost:3000

# 3. Start the frontend
cd ../frontend
npm install
npm run dev
# Opens at http://localhost:5173


Then open your browser, upload a sample CSV, click Normalize → Compute EOS, and explore the dashboard.

🔍 Example Workflow

Upload software_inventory.csv

Click Normalize → Gemini cleans product names

Click Compute EOS → Tags software by lifecycle risk

View KPIs, risk charts, and manufacturer breakdowns

Export the cleaned dataset