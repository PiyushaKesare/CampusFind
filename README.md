# ☁️ CampusFind: Cloud-Based Lost & Found Management System

> **Cloud Computing Mini Project**  
> **Student:** Piyusha Kesare  
> **Platform:** Google Cloud Platform (GCP) & Firebase  
> **Frontend:** React.js + Modern Vanilla CSS (Vite)  
> **Live Local Dev Server:** `http://localhost:5173/`

---

## 📌 1. Project Overview

The **Cloud-Based Lost & Found Management System** is a centralized cloud web application built for college campuses. It eliminates fragmented WhatsApp group messages, social media posts, and physical notice boards by providing a unified digital portal where students and staff can report, search, automatically match, claim, and recover lost belongings.

### Key Capabilities
- 🔐 **Secure College Authentication:** Firebase Authentication manages student & administrator access.
- 📝 **Report Lost & Found Items:** Upload photographs, select campus locations, categories, and colors.
- ⚡ **Automated Matching Algorithm:** 5-parameter heuristic scoring engine (≥ 70% threshold) compares lost and found posts in real-time.
- 🔄 **Lifecycle Status Tracking:** Full status progression:
  - Lost items: `Lost → Possible Match → Found → Returned`
  - Found items: `Found → Claimed → Returned`
- 🛡️ **Central Admin Dashboard:** Campus security moderation, report approval/deletion, and user verification.
- 📩 **Proof-of-Ownership Claims:** Verified claim request flow preventing unauthorized pickups.
- 🔔 **In-App Notification Center:** Instant alerts for high-confidence matches and claim updates.

---

## ☁️ 2. Google Cloud Platform & Firebase Architecture

```text
                        STUDENT / STAFF
                               │
                               ▼
                    React.js Web Application
                    (Hosted on Firebase CDN)
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
Firebase Authentication  Cloud Firestore    Firebase Storage
  (User Accounts &        (NoSQL Realtime      (Photo Object
   JWT Access Control)     Collections)          Storage)
                               │
                               ▼
                   Matching Scoring Algorithm
                               │
                               ▼
                     Possible Match Alerts
```

### Why this demonstrates Cloud Computing Concepts:
1. **Cloud Storage vs. Database:** Images are stored in **Firebase Storage** (Object Storage) rather than bloated inside the database. Cloud Firestore stores only the lightweight CDN image URLs.
2. **Serverless Scalability:** Eliminates traditional monolithic servers. The platform auto-scales to handle campus-wide traffic spikes without manual provisioning.
3. **Remote Accessibility:** Edge CDN distribution ensures sub-100ms access from campus Wi-Fi, hostels, or mobile devices.
4. **Cloud Security Rules:** Firestore security rules enforce role-based access control (RBAC).

---

## 🌐 3. Implemented Cloud Computing Areas (Viva & Project Defense)

Your project implements **all 6 matching cloud computing areas** with dedicated code and an interactive console:

| Cloud Computing Area | Implementation in System | File Reference |
| :--- | :--- | :--- |
| **1. Serverless Computing (FaaS)** | Event-driven Cloud Function trigger (`onItemReportedEvent`) with live execution telemetry (ms latency, 256MB memory provision). | [`serverlessEngine.js`](file:///d:/VsCode/Piyusha_CC/src/services/serverlessEngine.js) |
| **2. Cloud Storage** | Object storage bucket integration (`gs://campus-lost-and-found.appspot.com`), 5MB size limits, and public CDN URLs. | [`storageService.js`](file:///d:/VsCode/Piyusha_CC/src/services/storageService.js), [`storage.rules`](file:///d:/VsCode/Piyusha_CC/storage.rules) |
| **3. Cloud Database** | Cloud Firestore NoSQL collections (`items`, `claims`, `users`), compound queries, and real-time state listeners. | [`dataService.js`](file:///d:/VsCode/Piyusha_CC/src/services/dataService.js) |
| **4. Cloud Computing Security** | Declarative security rules (`firestore.rules`, `storage.rules`), decoded JWT client claims, and an audit trail log. | [`securityService.js`](file:///d:/VsCode/Piyusha_CC/src/services/securityService.js), [`firestore.rules`](file:///d:/VsCode/Piyusha_CC/firestore.rules) |
| **5. Cloud Resource Management** | Quotas tracker (Firestore Reads 50K/day, Writes 20K/day) and automated lifecycle pruning for resolved (`Returned`) items. | [`resourceManager.js`](file:///d:/VsCode/Piyusha_CC/src/services/resourceManager.js) |
| **6. PaaS & SaaS** | Google Firebase Platform as a Service with global edge hosting config (`firebase.json`, `.firebaserc`) and web client delivery. | [`firebase.json`](file:///d:/VsCode/Piyusha_CC/firebase.json), [`CloudResourceMonitor.jsx`](file:///d:/VsCode/Piyusha_CC/src/components/CloudResourceMonitor.jsx) |

*Click the **"Cloud Console"** button in the top navigation to view and demonstrate all 6 areas live!*

---

## 🧮 3. Matching Algorithm Scoring Formula

When a student reports an item, the cloud matching engine executes a deterministic 5-parameter comparison against opposite report types:

| Parameter | Max Weight | Evaluation Logic |
| :--- | :---: | :--- |
| **Item Name Similarity** | **30 Pts** | Tokenized keyword overlap, substring matching, and normalized string equality |
| **Category Match** | **20 Pts** | Exact match across pre-indexed campus categories (Electronics, ID & Cards, Books, etc.) |
| **Location Match** | **20 Pts** | Proximity and exact spot comparison (Library, Canteen, Basketball Court, etc.) |
| **Color Match** | **15 Pts** | Primary and accent color keyword matching |
| **Date Proximity** | **15 Pts** | ≤ 1 day: 15 pts \| ≤ 3 days: 12 pts \| ≤ 7 days: 8 pts \| ≤ 14 days: 4 pts |
| **Total Score** | **100 Pts** | **Scores ≥ 70% automatically trigger "Possible Match Found"** |

---

## 🚀 4. How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Launch
```bash
# 1. Navigate to project root
cd d:/VsCode/Piyusha_CC

# 2. Dependencies are already installed in node_modules, but if needed:
npm install

# 3. Start development server
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 🧪 5. Viva Demonstration Script

During your viva or project presentation, follow this 3-minute sequence:

1. **Home Page & Metrics:**
   - Show the live KPI stats cards: **Total Reports**, **Lost Belongings**, **Found Items**, and **Successfully Returned**.
   - Point out the **Cloud Status Pill** in the navbar ("Cloud Sandbox / GCP Live").
2. **Demonstrate Algorithm Match:**
   - Click the **"Compare Match (95%)"** button on the spotlight banner.
   - Show the side-by-side comparison between **Piyusha's Black JBL Earphones** and **Rahul's Found Bluetooth Earbuds**.
   - Show the **Algorithm Breakdown** bar (Name: 26/30, Category: 20/20, Location: 20/20, Color: 15/15, Date: 15/15 = 96%).
3. **Demonstrate Cloud Architecture Modal:**
   - Click the **"Cloud Architecture"** pill in the navbar.
   - Present the Architecture Flow, Firestore Collections (`items`, `claims`, `users`), and Cloud Viva Q&A.
4. **Demonstrate Reporting & Instant Matching:**
   - Go to **"Report Lost Item"**, fill in a test item, and submit.
   - Observe real-time matching evaluation and in-app notifications.
5. **Demonstrate Admin Dashboard:**
   - Switch account to **"Campus Security Admin"** using the user profile menu.
   - Show the moderation table with status override, item verification, and delete actions.

---

## ⚙️ 6. Connecting Your Live Firebase Project (Optional)

The application works 100% out-of-the-box in **Campus Cloud Sandbox Mode** with preloaded test data. If you have an active Google Cloud Firebase project, click the **Sliders (Settings)** icon in the top right navbar to paste your Firebase credentials:
- `apiKey`
- `projectId`
- `authDomain`
- `storageBucket`
- `appId`

The system will automatically initialize the live Firebase SDK!
