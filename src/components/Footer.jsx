import React from "react";
import { Cloud, Heart, Shield, Layers, Github } from "lucide-react";

export default function Footer({ isAdmin = false, onOpenArchitecture, setActiveTab }) {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <Cloud className="footer-cloud-icon" />
              <span>CampusFind Cloud</span>
            </div>
            <p className="footer-desc">
              A centralized, cloud-based lost and found management platform designed for college students, faculty, and administrative staff to report, track, match, and recover belongings.
            </p>
            <div className="footer-badges">
              <span className="tech-badge">Google Cloud</span>
              <span className="tech-badge">Firebase Auth</span>
              <span className="tech-badge">Cloud Firestore</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Actions</h4>
            <ul className="footer-links">
              <li><button onClick={() => setActiveTab("search")}>Search Lost & Found</button></li>
              <li><button onClick={() => setActiveTab("report-lost")}>Report a Lost Item</button></li>
              <li><button onClick={() => setActiveTab("report-found")}>Report a Found Item</button></li>
              <li><button onClick={() => setActiveTab("my-reports")}>My Reports Tracker</button></li>
              {isAdmin && (
                <li><button onClick={() => setActiveTab("admin")}>Campus Admin Dashboard</button></li>
              )}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Support & Safety</h4>
            <ul className="footer-links">
              <li><button onClick={() => setActiveTab("home")}>How It Works</button></li>
              <li><button onClick={() => setActiveTab("search")}>Lost Items Guidelines</button></li>
              <li><button onClick={() => setActiveTab("search")}>Found Item Handover</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 CampusFind. Lost & Found Management System.</p>
        </div>
      </div>
    </footer>
  );
}
