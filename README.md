# 🧹 ClearView  
### *AI Software Lifecycle Cleaner*  
**Built for BNY Mellon | Best AI Hack | Best App | Auritas Data Viz | Snowflake**

---

## 💡 Overview  
**ClearView** is an AI-powered web application that intelligently cleans and analyzes messy software inventory data, giving organizations instant visibility into their technology lifecycle.  

Upload a CSV or text export of software assets, and ClearView will:  
- 🧠 **Normalize** vendor, product, and version names using the **Gemini API**  
- ⏳ **Predict** End-of-Support (EOS) dates using rule-based logic or a reference dataset  
- 📊 **Visualize** lifecycle health and risk through an interactive dashboard  
- 💾 **Export** a fully cleaned dataset ready for audits and compliance reports  

> ClearView helps IT and compliance teams quickly identify outdated or high-risk software — saving hours of manual data cleanup.

---

## 🧠 Why It Stands Out  
- ⚙️ **AI Automation:** Gemini AI intelligently standardizes inconsistent data  
- 📈 **Insightful Dashboards:** Real-time lifecycle KPIs and risk breakdowns  
- 💻 **Lightweight & Local:** Works fully offline with no external dependencies  
- 🚀 **Hackathon-Ready:** Fully buildable and demoable in under 10 hours  

---

## ⚙️ Tech Stack  

| Layer | Technology |
|:------|:------------|
| **Frontend** | React (Vite) + TailwindCSS + Chart.js |
| **Backend** | Node.js + Express + Prisma ORM |
| **Database** | SQLite (local file database) |
| **AI Integration** | Gemini API |
| **Visualization** | Chart.js / Plotly |
| **Optional** | Snowflake API (for cloud data storage) |

---

## 🧩 Key Features  
✅ Upload and parse CSV or text logs  
✅ AI-powered name normalization via Gemini  
✅ EOS prediction and lifecycle risk tagging  
✅ Clean visual KPIs with charts and tables  
✅ Export cleaned CSV for external use  

---

## 🏁 How to Run Locally  
```bash
git clone https://github.com/yourorg/clearview
cd clearview
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
# → Runs on http://localhost:3000

cd ../frontend
npm install
npm run dev
# → Opens at http://localhost:5173
