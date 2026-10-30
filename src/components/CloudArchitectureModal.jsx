import React, { useState } from "react";
import {
  X,
  Cloud,
  Database,
  Lock,
  HardDrive,
  Globe,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle,
  CheckCircle,
  FileCode,
  ShieldCheck
} from "lucide-react";

export default function CloudArchitectureModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="badge-cloud-header">
              <Cloud size={18} />
              <span>Google Cloud Platform (GCP) & Firebase</span>
            </div>
            <h2>Cloud Architecture & Viva Guide</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${activeTab === "architecture" ? "active" : ""}`}
            onClick={() => setActiveTab("architecture")}
          >
            <Layers size={16} />
            <span>Cloud Architecture</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "concepts" ? "active" : ""}`}
            onClick={() => setActiveTab("concepts")}
          >
            <Cpu size={16} />
            <span>Viva Cloud Concepts</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "matching" ? "active" : ""}`}
            onClick={() => setActiveTab("matching")}
          >
            <TrendingUp size={16} />
            <span>Matching Algorithm</span>
          </button>
          <button
            className={`modal-tab-btn ${activeTab === "schema" ? "active" : ""}`}
            onClick={() => setActiveTab("schema")}
          >
            <Database size={16} />
            <span>Firestore Database Schema</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="modal-body">
          {activeTab === "architecture" && (
            <div className="arch-container">
              <div className="arch-diagram-card">
                <h4 className="diagram-title">System Cloud Architecture Flow</h4>
                <div className="diagram-visual">
                  <div className="diagram-box client-box">
                    <Globe size={24} className="diagram-icon" />
                    <strong>STUDENT / STAFF</strong>
                    <span>React.js Web App (Vite)</span>
                    <span className="diagram-sub">Responsive on Desktop & Mobile</span>
                  </div>

                  <div className="diagram-connector-down">
                    <span>HTTPS / REST / WebSocket</span>
                    <div className="arrow-line"></div>
                  </div>

                  <div className="diagram-cloud-grid">
                    <div className="cloud-service-card card-auth">
                      <Lock size={20} />
                      <h5>Firebase Authentication</h5>
                      <p>Handles secure login with college email credentials and JWT tokens.</p>
                      <span className="cloud-spec">User Identity & Access Control</span>
                    </div>

                    <div className="cloud-service-card card-db">
                      <Database size={20} />
                      <h5>Cloud Firestore</h5>
                      <p>NoSQL document store for item metadata, status tracking, and claim records.</p>
                      <span className="cloud-spec">Real-Time Sync & Collections</span>
                    </div>

                    <div className="cloud-service-card card-storage">
                      <HardDrive size={20} />
                      <h5>Firebase Storage</h5>
                      <p>Blob/Object bucket for high-res lost and found photographs.</p>
                      <span className="cloud-spec">Scalable Cloud Object Storage</span>
                    </div>

                    <div className="cloud-service-card card-hosting">
                      <Cloud size={20} />
                      <h5>Firebase Hosting</h5>
                      <p>Global CDN edge delivery for ultra-low latency asset delivery.</p>
                      <span className="cloud-spec">Global Multi-Region Edge</span>
                    </div>
                  </div>

                  <div className="diagram-connector-down">
                    <div className="arrow-line"></div>
                  </div>

                  <div className="diagram-box algorithm-box">
                    <Cpu size={24} className="diagram-icon text-amber" />
                    <strong>AUTOMATED MATCHING ENGINE</strong>
                    <span>5-Parameter Heuristic Scoring (Category, Name, Color, Location, Date)</span>
                    <span className="diagram-sub">Generates Real-time 70%+ Match Alerts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "concepts" && (
            <div className="concepts-list">
              <div className="concept-card">
                <div className="concept-icon-wrap">
                  <HardDrive size={20} />
                </div>
                <div className="concept-text">
                  <h4>1. Cloud Storage vs. Cloud Database (Why separate?)</h4>
                  <p>
                    <strong>Viva Answer:</strong> Storing binary images directly inside a database increases document sizes, slows down query execution, and is cost-inefficient. Instead, images are uploaded as raw files to <strong>Firebase Storage</strong> (Object Storage), which generates a public CDN URL. Only this lightweight URL string is saved inside <strong>Cloud Firestore</strong>.
                  </p>
                </div>
              </div>

              <div className="concept-card">
                <div className="concept-icon-wrap">
                  <TrendingUp size={20} />
                </div>
                <div className="concept-text">
                  <h4>2. Elastic Scalability & Serverless Architecture</h4>
                  <p>
                    <strong>Viva Answer:</strong> Traditional servers require managing physical machines, configuring OS patches, and handling traffic spikes manually. With Google Cloud Platform serverless infrastructure, the application scales from 1 student to 50,000 students automatically without downtime or server provisioning.
                  </p>
                </div>
              </div>

              <div className="concept-card">
                <div className="concept-icon-wrap">
                  <Globe size={20} />
                </div>
                <div className="concept-text">
                  <h4>3. Remote Accessibility & Global Edge CDN</h4>
                  <p>
                    <strong>Viva Answer:</strong> Hosted on Firebase Hosting's globally distributed Content Delivery Network (CDN). Whether students access the system from campus Wi-Fi, their hostels, or home computers, assets are cached at nearby edge locations with sub-100ms response times.
                  </p>
                </div>
              </div>

              <div className="concept-card">
                <div className="concept-icon-wrap">
                  <ShieldCheck size={20} />
                </div>
                <div className="concept-text">
                  <h4>4. Cloud Security & Role-Based Access Control (RBAC)</h4>
                  <p>
                    <strong>Viva Answer:</strong> Security is enforced at the database layer using Cloud Firestore Security Rules. Regular students can only edit their own reports, while administrators with elevated roles can moderate, verify, or remove inappropriate posts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matching" && (
            <div className="matching-viva-view">
              <div className="info-callout">
                <h4>Heuristic Matching Algorithm (No Machine Learning Overhead Required)</h4>
                <p>
                  For a cloud mini-project, deploying heavy deep-learning inference adds latency, server cost, and complexity. Instead, our deterministic 5-parameter algorithm computes instant real-time scores with 100% transparency.
                </p>
              </div>

              <div className="table-responsive mt-4">
                <table className="viva-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Max Weight</th>
                      <th>Logic Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Category Match</strong></td>
                      <td><span className="pts-pill">20 Pts</span></td>
                      <td>Exact string match across predefined campus taxonomy (Electronics, ID & Cards, Books, etc.)</td>
                    </tr>
                    <tr>
                      <td><strong>Item Name Similarity</strong></td>
                      <td><span className="pts-pill">30 Pts</span></td>
                      <td>Tokenized word overlap, substring check, and shared keyword ratio</td>
                    </tr>
                    <tr>
                      <td><strong>Location Match</strong></td>
                      <td><span className="pts-pill">20 Pts</span></td>
                      <td>Exact or sub-facility location comparison (e.g., Library 2nd floor vs Library Desk)</td>
                    </tr>
                    <tr>
                      <td><strong>Color Match</strong></td>
                      <td><span className="pts-pill">15 Pts</span></td>
                      <td>Color token matching (Black, Blue, Brown, Silver, etc.)</td>
                    </tr>
                    <tr>
                      <td><strong>Date Similarity</strong></td>
                      <td><span className="pts-pill">15 Pts</span></td>
                      <td>Time delta proximity (≤1 day: 15pts, ≤3 days: 12pts, ≤7 days: 8pts, ≤14 days: 4pts)</td>
                    </tr>
                    <tr className="table-total-row">
                      <td><strong>Total Score</strong></td>
                      <td><strong>100 Pts</strong></td>
                      <td><strong>Scores ≥ 70% automatically trigger "Possible Match Found" notification</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="schema-view">
              <div className="schema-card">
                <div className="schema-header">
                  <Database size={16} />
                  <span>Collection: items (Cloud Firestore)</span>
                </div>
                <pre className="code-block">{`{
  itemId: "item-101",
  userId: "user-piyusha",
  userName: "Piyusha Kesare",
  userEmail: "piyusha@college.edu",
  userRole: "student",
  itemName: "Black JBL Wireless Earphones",
  category: "Electronics",
  type: "Lost",               // "Lost" | "Found"
  color: "Black",
  location: "College Library",
  date: "2026-10-05",
  description: "Black wireless earphones with a small scratch on case.",
  imageURL: "https://storage.googleapis.com/.../earphones.jpg",
  contactInfo: "piyusha@college.edu | +91 98765 43210",
  status: "Possible Match",    // "Lost" | "Possible Match" | "Found" | "Claimed" | "Returned"
  createdAt: "2026-10-05T14:30:00Z"
}`}</pre>
              </div>

              <div className="schema-card mt-4">
                <div className="schema-header">
                  <Database size={16} />
                  <span>Collection: claims (Cloud Firestore)</span>
                </div>
                <pre className="code-block">{`{
  claimId: "claim-201",
  itemId: "item-102",
  claimantName: "Piyusha Kesare",
  claimantEmail: "piyusha@college.edu",
  claimantPhone: "+91 98765 43210",
  studentRoll: "CS-2024-42",
  proofDetails: "Has my initial 'P' on inner ear tip and pairing name 'Piyusha-JBL'",
  pickupPreference: "Central Library Front Counter",
  status: "Pending Review",
  createdAt: "2026-10-06T10:00:00Z"
}`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
