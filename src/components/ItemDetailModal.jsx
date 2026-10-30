import React, { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Tag,
  Sparkles,
  CheckCircle,
  Phone,
  Mail,
  User,
  Send,
  Trash2
} from "lucide-react";
import { findPotentialMatches } from "../services/matchingService";
import { fetchClaims } from "../services/dataService";
import { useAuth } from "../context/AuthContext";

export default function ItemDetailModal({
  item,
  allItems = [],
  onClose,
  onOpenClaim,
  onOpenMatch,
  onUpdateStatus,
  onDeleteItem
}) {
  const { currentUser, isAdmin } = useAuth();
  const [pendingClaim, setPendingClaim] = useState(null);
  useEffect(() => {
    if (item?.type !== "Found") return;
    fetchClaims().then((claims) =>
      setPendingClaim(claims.find((claim) => claim.itemId === item.id && claim.status === "Pending Review") || null)
    );
  }, [item?.id, item?.type]);
  if (!item) return null;

  const isOwner = currentUser && (currentUser.email === item.userEmail || currentUser.id === item.userId);
  const canManage = isOwner || isAdmin;
  const isLost = item.type === "Lost";
  const isReturned = item.status === "Returned";

  // Find candidate matches
  const matches = findPotentialMatches(item, allItems);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-tags-row">
              <span className={`type-tag ${isLost ? "type-lost" : "type-found"}`}>
                {item.type.toUpperCase()}
              </span>
              <span className={`status-badge badge-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                {item.status}
              </span>
            </div>
            <h2>{item.itemName}</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Tracker Flow */}
          <div className="status-tracker-box">
            <div className="tracker-title">Item Lifecycle Progress</div>
            <div className="tracker-steps">
              {isLost ? (
                <>
                  <div className={`tracker-step ${item.status === "Lost" || item.status === "Possible Match" || item.status === "Found" || item.status === "Returned" ? "step-active" : ""}`}>
                    <div className="step-circle">1</div>
                    <span className="step-label">Lost</span>
                  </div>
                  <div className="step-line"></div>
                  <div className={`tracker-step ${item.status === "Possible Match" || item.status === "Found" || item.status === "Returned" ? "step-active" : ""}`}>
                    <div className="step-circle">2</div>
                    <span className="step-label">Possible Match</span>
                  </div>
                  <div className="step-line"></div>
                  <div className={`tracker-step ${item.status === "Found" || item.status === "Returned" ? "step-active" : ""}`}>
                    <div className="step-circle">3</div>
                    <span className="step-label">Found</span>
                  </div>
                  <div className="step-line"></div>
                  <div className={`tracker-step ${item.status === "Returned" ? "step-active step-completed" : ""}`}>
                    <div className="step-circle">4</div>
                    <span className="step-label">Returned</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`tracker-step ${item.status === "Found" || item.status === "Claimed" || item.status === "Returned" ? "step-active" : ""}`}>
                    <div className="step-circle">1</div>
                    <span className="step-label">Found</span>
                  </div>
                  <div className="step-line"></div>
                  <div className={`tracker-step ${item.status === "Claimed" || item.status === "Returned" ? "step-active" : ""}`}>
                    <div className="step-circle">2</div>
                    <span className="step-label">Claimed</span>
                  </div>
                  <div className="step-line"></div>
                  <div className={`tracker-step ${item.status === "Returned" ? "step-active step-completed" : ""}`}>
                    <div className="step-circle">3</div>
                    <span className="step-label">Returned</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="modal-image-wrapper">
            <img
              src={item.imageURL || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80"}
              alt={item.itemName}
              className="modal-image"
            />
          </div>

          {/* Key Metadata Table */}
          <div className="metadata-grid">
            <div className="meta-card">
              <span className="meta-label">Category</span>
              <span className="meta-value">{item.category}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Color</span>
              <span className="meta-value">
                <span className="color-dot inline" style={{ backgroundColor: item.color?.toLowerCase() }}></span>
                {item.color || "Not specified"}
              </span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Campus Location</span>
              <span className="meta-value">{item.location}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Date Reported</span>
              <span className="meta-value">{item.date}</span>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h4 className="section-title">Item Description</h4>
            <p className="detail-description">{item.description}</p>
          </div>

          {/* Contact Details */}
          <div className="detail-section contact-card">
            <h4 className="section-title">
              <User size={16} />
              <span>Reported By</span>
            </h4>
            <div className="contact-info-content">
              <p><strong>{item.userName || "Campus Student"}</strong> ({item.userRole || "Student"})</p>
              <p className="contact-line">
                <Mail size={14} />
                <span>{item.userEmail || "Contact through campus desk"}</span>
              </p>
              {item.contactInfo && (
                <p className="contact-line">
                  <Phone size={14} />
                  <span>{item.contactInfo}</span>
                </p>
              )}
            </div>
          </div>

          {/* Potential Matches Box */}
          {matches.length > 0 && (
            <div className="detail-section matches-section">
              <h4 className="section-title text-amber">
                <Sparkles size={16} />
                <span>Possible Matches ({matches.length})</span>
              </h4>
              <div className="matches-mini-list">
                {matches.slice(0, 3).map(({ matchedItem, score }) => (
                  <div key={matchedItem.id} className="match-mini-card">
                    <img src={matchedItem.imageURL} alt={matchedItem.itemName} className="mini-thumb" />
                    <div className="mini-info">
                      <div className="mini-title">{matchedItem.itemName}</div>
                      <div className="mini-meta">{matchedItem.location} • {matchedItem.date}</div>
                    </div>
                    <div className="mini-score-tag">
                      <strong>{score}%</strong> Match
                    </div>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onOpenMatch(item, matchedItem)}
                    >
                      Compare
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer justify-between">
          <div className="left-actions">
            {canManage && (
              <button
                className="btn btn-danger-outline btn-sm"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete this report for "${item.itemName}"?`)) {
                    onDeleteItem(item.id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="right-actions">
            {pendingClaim && !isReturned && item.status !== "Claimed" && (
              <span className="claim-status-tag status-pending">Claim Under Review</span>
            )}

            {/* Only signed-in non-owners can claim a found item that is still
                available (not already claimed, returned or under review). */}
            {currentUser && !isOwner && !isReturned && !pendingClaim && item.type === "Found" && item.status !== "Claimed" && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onOpenClaim(item);
                }}
              >
                <Send size={16} />
                <span>Claim This Item</span>
              </button>
            )}

            {/* If Owner or Admin, can mark as Returned */}
            {canManage && !isReturned && (
              <button
                className="btn btn-success"
                onClick={() => {
                  onUpdateStatus(item.id, "Returned");
                  onClose();
                }}
              >
                <CheckCircle size={16} />
                <span>Mark as Returned</span>
              </button>
            )}

            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
