import React, { useEffect, useState } from "react";
import {
  FileText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Clock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Send
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { findPotentialMatches } from "../services/matchingService";
import { fetchClaims } from "../services/dataService";

export default function MyReportsPage({
  items = [],
  onNavigate,
  onSelectItem,
  onOpenMatch,
  onUpdateStatus,
  onDeleteItem
}) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("lost"); // 'lost' | 'found' | 'claims'

  // Filter items reported by this user
  // If demo mode or matching email
  const userItems = items.filter(item => {
    if (!currentUser) return false;
    return item.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
           item.userId === currentUser.id;
  });

  const myLostItems = userItems.filter(i => i.type === "Lost");
  const myFoundItems = userItems.filter(i => i.type === "Found");
  const [allClaims, setAllClaims] = useState([]);
  useEffect(() => {
    fetchClaims().then(setAllClaims);
  }, [items]);
  const claimsForMyFoundItems = allClaims.filter(c =>
    c.itemOwnerId === currentUser?.id ||
    c.claimantId === currentUser?.id ||
    c.claimantEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
    myFoundItems.some(f => f.id === c.itemId)
  );

  const claimStatusClass = (status) => {
    if (status === "Approved") return "status-approved";
    if (status === "Rejected") return "status-rejected";
    return "status-pending";
  };

  const handleMarkReturned = (itemId, itemName) => {
    if (confirm(`Confirm marking "${itemName}" as Returned? This concludes the report lifecycle.`)) {
      onUpdateStatus(itemId, "Returned");
    }
  };

  return (
    <div className="my-reports-container">
      {/* User Header Profile */}
      <div className="my-reports-header">
        <div className="user-profile-summary">
          <div className="profile-large-avatar">
            {currentUser ? currentUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="profile-details">
            <h1 className="profile-title">{currentUser ? currentUser.name : "Guest User"}</h1>
            <p className="profile-email">{currentUser ? currentUser.email : "Not signed in"}</p>
            <div className="profile-badges">
              <span className="badge-role">{currentUser?.role?.toUpperCase() || "STUDENT"}</span>
              <span className="badge-stats">
                {userItems.length} Total Reports ({myLostItems.length} Lost, {myFoundItems.length} Found)
              </span>
            </div>
          </div>
        </div>

        <div className="my-reports-cta">
          <button
            className="btn btn-lost"
            onClick={() => onNavigate("report-lost")}
          >
            <PlusCircle size={16} />
            <span>Report Lost</span>
          </button>
          <button
            className="btn btn-found"
            onClick={() => onNavigate("report-found")}
          >
            <CheckCircle2 size={16} />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="reports-tab-nav">
        <button
          className={`report-tab-btn ${activeTab === "lost" ? "active" : ""}`}
          onClick={() => setActiveTab("lost")}
        >
          <span className="tab-label-full">My Lost Items</span>
          <span className="tab-label-short">Lost</span>
          <span className="tab-count-pill">{myLostItems.length}</span>
        </button>

        <button
          className={`report-tab-btn ${activeTab === "found" ? "active" : ""}`}
          onClick={() => setActiveTab("found")}
        >
          <span className="tab-label-full">My Found Items</span>
          <span className="tab-label-short">Found</span>
          <span className="tab-count-pill">{myFoundItems.length}</span>
        </button>

        <button
          className={`report-tab-btn ${activeTab === "claims" ? "active" : ""}`}
          onClick={() => setActiveTab("claims")}
        >
          <span className="tab-label-full">Claims & Inquiries</span>
          <span className="tab-label-short">Claims</span>
          <span className="tab-count-pill">{claimsForMyFoundItems.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="reports-tab-content">
        {activeTab === "lost" && (
          <div className="reports-list">
            {myLostItems.length === 0 ? (
              <div className="empty-reports-card">
                <FileText size={40} className="text-muted" />
                <h3>No lost items reported</h3>
                <p>Have you misplaced an item on campus? File a report now to enable cloud matching.</p>
                <button
                  className="btn btn-lost mt-4"
                  onClick={() => onNavigate("report-lost")}
                >
                  <PlusCircle size={16} />
                  <span>Report Lost Item</span>
                </button>
              </div>
            ) : (
              myLostItems.map((item) => {
                const matches = findPotentialMatches(item, items);
                const hasMatch = matches.length > 0 && matches[0].isHighConfidence;
                const isReturned = item.status === "Returned";

                return (
                  <div key={item.id} className={`my-item-row-card ${isReturned ? "item-completed" : ""}`}>
                    <img
                      src={item.imageURL}
                      alt={item.itemName}
                      className="my-item-thumb"
                    />

                    <div className="my-item-main-info">
                      <div className="my-item-title-row">
                        <h3 className="my-item-title">{item.itemName}</h3>
                        <span className={`status-badge badge-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="my-item-meta-row">
                        <span><strong>Category:</strong> {item.category}</span>
                        <span><strong>Color:</strong> {item.color}</span>
                        <span><strong>Location:</strong> {item.location}</span>
                        <span><strong>Date:</strong> {item.date}</span>
                      </div>

                      {/* Status Tracker */}
                      <div className="mini-lifecycle-bar">
                        <span className={`mini-step ${item.status === "Lost" || item.status === "Possible Match" || item.status === "Found" || item.status === "Returned" ? "active" : ""}`}>
                          Lost
                        </span>
                        <span className="arrow">→</span>
                        <span className={`mini-step ${item.status === "Possible Match" || item.status === "Found" || item.status === "Returned" ? "active" : ""}`}>
                          Possible Match
                        </span>
                        <span className="arrow">→</span>
                        <span className={`mini-step ${item.status === "Found" || item.status === "Returned" ? "active" : ""}`}>
                          Found
                        </span>
                        <span className="arrow">→</span>
                        <span className={`mini-step ${item.status === "Returned" ? "active completed" : ""}`}>
                          Returned
                        </span>
                      </div>

                      {/* Match Banner if high confidence */}
                      {hasMatch && !isReturned && (
                        <div className="match-callout-inline">
                          <Sparkles size={16} className="text-amber" />
                          <span>Possible match available: <strong>"{matches[0].matchedItem.itemName}"</strong> ({matches[0].score}% score)</span>
                          <button
                            className="btn btn-sm btn-primary ml-auto"
                            onClick={() => onOpenMatch(item, matches[0].matchedItem)}
                          >
                            Compare Match
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="my-item-actions">
                      {!isReturned ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkReturned(item.id, item.itemName)}
                          title="I got my item back!"
                        >
                          <CheckCircle2 size={15} />
                          <span>Mark Returned</span>
                        </button>
                      ) : (
                        <span className="badge-returned-resolved">
                          <CheckCircle2 size={14} />
                          <span>Resolved</span>
                        </span>
                      )}

                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onSelectItem(item)}
                      >
                        Details
                      </button>

                      <button
                        className="btn btn-danger-outline btn-sm"
                        title="Delete report"
                        aria-label={`Delete report for ${item.itemName}`}
                        onClick={() => {
                          if (confirm(`Delete report for "${item.itemName}"?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "found" && (
          <div className="reports-list">
            {myFoundItems.length === 0 ? (
              <div className="empty-reports-card">
                <CheckCircle2 size={40} className="text-muted" />
                <h3>No found items reported by you</h3>
                <p>Have you picked up an unattended belonging on campus? Help reunite it with the owner.</p>
                <button
                  className="btn btn-found mt-4"
                  onClick={() => onNavigate("report-found")}
                >
                  <CheckCircle2 size={16} />
                  <span>Report Found Item</span>
                </button>
              </div>
            ) : (
              myFoundItems.map((item) => {
                const matches = findPotentialMatches(item, items);
                const hasMatch = matches.length > 0 && matches[0].isHighConfidence;
                const isReturned = item.status === "Returned";

                return (
                  <div key={item.id} className={`my-item-row-card ${isReturned ? "item-completed" : ""}`}>
                    <img
                      src={item.imageURL}
                      alt={item.itemName}
                      className="my-item-thumb"
                    />

                    <div className="my-item-main-info">
                      <div className="my-item-title-row">
                        <h3 className="my-item-title">{item.itemName}</h3>
                        <span className={`status-badge badge-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="my-item-meta-row">
                        <span><strong>Category:</strong> {item.category}</span>
                        <span><strong>Color:</strong> {item.color}</span>
                        <span><strong>Found Location:</strong> {item.location}</span>
                        <span><strong>Date:</strong> {item.date}</span>
                      </div>

                      <div className="mini-lifecycle-bar">
                        <span className={`mini-step ${item.status === "Found" || item.status === "Claimed" || item.status === "Returned" ? "active" : ""}`}>
                          Found
                        </span>
                        <span className="arrow">→</span>
                        <span className={`mini-step ${item.status === "Claimed" || item.status === "Returned" ? "active" : ""}`}>
                          Claimed
                        </span>
                        <span className="arrow">→</span>
                        <span className={`mini-step ${item.status === "Returned" ? "active completed" : ""}`}>
                          Returned
                        </span>
                      </div>

                      {hasMatch && !isReturned && (
                        <div className="match-callout-inline">
                          <Sparkles size={16} className="text-amber" />
                          <span>Potential owner lost report: <strong>"{matches[0].matchedItem.itemName}"</strong> ({matches[0].score}%)</span>
                          <button
                            className="btn btn-sm btn-primary ml-auto"
                            onClick={() => onOpenMatch(item, matches[0].matchedItem)}
                          >
                            Compare Match
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="my-item-actions">
                      {!isReturned ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkReturned(item.id, item.itemName)}
                        >
                          <CheckCircle2 size={15} />
                          <span>Mark Returned</span>
                        </button>
                      ) : (
                        <span className="badge-returned-resolved">
                          <CheckCircle2 size={14} />
                          <span>Resolved</span>
                        </span>
                      )}

                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onSelectItem(item)}
                      >
                        Details
                      </button>

                      <button
                        className="btn btn-danger-outline btn-sm"
                        title="Delete report"
                        aria-label={`Delete report for ${item.itemName}`}
                        onClick={() => {
                          if (confirm(`Delete found report for "${item.itemName}"?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "claims" && (
          <div className="claims-list">
            {claimsForMyFoundItems.length === 0 ? (
              <div className="empty-reports-card">
                <Send size={40} className="text-muted" />
                <h3>No active claim requests</h3>
                <p>When someone claims an item you found with identifying proof, it will appear here for review.</p>
              </div>
            ) : (
              claimsForMyFoundItems.map((claim) => (
                <div key={claim.id} className="claim-card-row">
                  <div className="claim-card-header">
                    <h4>Claim for: "{claim.itemName}"</h4>
                    <span className={`claim-status-tag ${claimStatusClass(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="claim-body-grid">
                    <div>
                      <strong>Claimant:</strong> {claim.claimantName} ({claim.claimantEmail})
                    </div>
                    <div>
                      <strong>Roll No:</strong> {claim.studentRoll} | <strong>Phone:</strong> {claim.claimantPhone}
                    </div>
                    <div className="col-span-2 claim-proof-box">
                      <strong>Submitted Proof of Ownership:</strong>
                      <p className="mt-1 text-sm">{claim.proofDetails}</p>
                    </div>
                    <div>
                      <strong>Handover Spot:</strong> {claim.pickupPreference}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
