import React, { useEffect, useState } from "react";
import { X, Sparkles, Check, ArrowRight, ShieldCheck, MapPin, Calendar, Tag, Send } from "lucide-react";
import { evaluateMatchPair } from "../services/matchingService";
import { fetchClaims } from "../services/dataService";
import { useAuth } from "../context/AuthContext";

export default function MatchingModal({
  baseItem,
  candidateItem,
  onClose,
  onOpenClaim,
  onUpdateStatus
}) {
  const { currentUser, isAdmin } = useAuth();
  // A submitted claim is only a request until an administrator verifies it,
  // so the found item must not accept a second claimant while one is pending.
  const pendingFoundItemId = (baseItem?.type === "Found" ? baseItem : candidateItem)?.id;
  const [pendingClaim, setPendingClaim] = useState(null);
  useEffect(() => {
    fetchClaims().then((claims) =>
      setPendingClaim(
        claims.find((claim) => claim.itemId === pendingFoundItemId && claim.status === "Pending Review") || null
      )
    );
  }, [pendingFoundItemId]);
  if (!baseItem || !candidateItem) return null;

  const evaluation = evaluateMatchPair(baseItem, candidateItem);
  const { score, breakdown, isMatch } = evaluation;

  const lostItem = baseItem.type === "Lost" ? baseItem : candidateItem;
  const foundItem = baseItem.type === "Found" ? baseItem : candidateItem;
  const isLostOwner = Boolean(
    currentUser &&
    (isAdmin || currentUser.id === lostItem.userId || currentUser.email === lostItem.userEmail)
  );
  const isFoundOwner = Boolean(
    currentUser &&
    (currentUser.id === foundItem.userId || currentUser.email === foundItem.userEmail)
  );
  const canClaimFoundItem = Boolean(
    currentUser &&
    foundItem.type === "Found" &&
    !isFoundOwner &&
    !pendingClaim &&
    foundItem.status !== "Claimed" &&
    foundItem.status !== "Returned"
  );
  const baseTypeClass = baseItem.type === "Lost" ? "type-lost" : "type-found";
  const candidateTypeClass = candidateItem.type === "Lost" ? "type-lost" : "type-found";
  const canMarkPossibleMatch = isLostOwner && lostItem.status === "Lost";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="badge-match-header">
              <Sparkles size={18} />
              <span>Matching Algorithm Evaluation</span>
            </div>
            <h2>Automated Match Comparison</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Match Score Hero Card */}
          <div className={`match-score-hero ${score >= 70 ? "hero-high-match" : "hero-medium-match"}`}>
            <div className="score-circle-wrapper">
              <div className="modal-gauge-box">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="42" strokeWidth="8" />
                  <circle
                    className="gauge-fill"
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * score) / 100}
                  />
                </svg>
                <div className="modal-gauge-center">
                  <span className="score-number">{score}%</span>
                  <span className="score-label">MATCH</span>
                </div>
              </div>
            </div>
            <div className="score-details">
              <div className="score-verdict">
                {score >= 70 ? (
                  <>
                    <div className="verdict-tag-row">
                      <span className="verdict-tag high">High Confidence Match</span>
                      <span className="verdict-subpill">5-Parameter Correlated</span>
                    </div>
                    <h3>Possible Match Identified!</h3>
                    <p>
                      The cloud matching algorithm evaluated category, title tokens, color, location, and date delta. There is a high probability these reports refer to the same physical item.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="verdict-tag medium">Moderate Similarity</span>
                    <h3>Partial Match Detected</h3>
                    <p>
                      Some parameters align, but certain key details (such as location or color) differ.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="comparison-grid">
            {/* Item 1 */}
            <div className="compare-card">
              <div className={`compare-card-tag ${baseTypeClass}`}>
                {baseItem.type.toUpperCase()} REPORT
              </div>
              <img
                src={baseItem.imageURL}
                alt={baseItem.itemName}
                className="compare-card-img"
              />
              <div className="compare-card-body">
                <h4>{baseItem.itemName}</h4>
                <div className="compare-meta-list">
                  <div className="compare-meta">
                    <Tag size={13} />
                    <span><strong>Category:</strong> {baseItem.category}</span>
                  </div>
                  <div className="compare-meta">
                    <span className="color-dot" style={{ backgroundColor: baseItem.color?.toLowerCase() }}></span>
                    <span><strong>Color:</strong> {baseItem.color}</span>
                  </div>
                  <div className="compare-meta">
                    <MapPin size={13} />
                    <span><strong>Location:</strong> {baseItem.location}</span>
                  </div>
                  <div className="compare-meta">
                    <Calendar size={13} />
                    <span><strong>Date:</strong> {baseItem.date}</span>
                  </div>
                </div>
                <div className="compare-reported-by">
                  Reported by: <strong>{baseItem.userName}</strong> ({baseItem.userRole})
                </div>
              </div>
            </div>

            {/* Comparison Flow Divider */}
            <div className="compare-divider">
              <div className="compare-divider-icon">
                <ArrowRight size={20} />
              </div>
              <span className="compare-vs">VS</span>
            </div>

            {/* Item 2 */}
            <div className="compare-card">
              <div className={`compare-card-tag ${candidateTypeClass}`}>
                {candidateItem.type.toUpperCase()} REPORT
              </div>
              <img
                src={candidateItem.imageURL}
                alt={candidateItem.itemName}
                className="compare-card-img"
              />
              <div className="compare-card-body">
                <h4>{candidateItem.itemName}</h4>
                <div className="compare-meta-list">
                  <div className="compare-meta">
                    <Tag size={13} />
                    <span><strong>Category:</strong> {candidateItem.category}</span>
                  </div>
                  <div className="compare-meta">
                    <span className="color-dot" style={{ backgroundColor: candidateItem.color?.toLowerCase() }}></span>
                    <span><strong>Color:</strong> {candidateItem.color}</span>
                  </div>
                  <div className="compare-meta">
                    <MapPin size={13} />
                    <span><strong>Location:</strong> {candidateItem.location}</span>
                  </div>
                  <div className="compare-meta">
                    <Calendar size={13} />
                    <span><strong>Date:</strong> {candidateItem.date}</span>
                  </div>
                </div>
                <div className="compare-reported-by">
                  Reported by: <strong>{candidateItem.userName}</strong> ({candidateItem.userRole})
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Points Breakdown Formula */}
          <div className="scoring-formula-box">
            <h4 className="formula-heading">
              <ShieldCheck size={16} />
              <span>Algorithm Breakdown (Max 100 Points):</span>
            </h4>
            <div className="breakdown-grid">
              <div className="breakdown-cell">
                <div className="breakdown-cell-header">
                  <span>Item Name Match</span>
                  <span className="pts">{breakdown.name} / 30 pts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(breakdown.name / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="breakdown-cell">
                <div className="breakdown-cell-header">
                  <span>Category Match</span>
                  <span className="pts">{breakdown.category} / 20 pts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(breakdown.category / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="breakdown-cell">
                <div className="breakdown-cell-header">
                  <span>Location Match</span>
                  <span className="pts">{breakdown.location} / 20 pts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(breakdown.location / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="breakdown-cell">
                <div className="breakdown-cell-header">
                  <span>Color Match</span>
                  <span className="pts">{breakdown.color} / 15 pts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(breakdown.color / 15) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="breakdown-cell">
                <div className="breakdown-cell-header">
                  <span>Date Similarity</span>
                  <span className="pts">{breakdown.date} / 15 pts</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(breakdown.date / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          {pendingClaim && foundItem.status !== "Returned" && (
            <span className="claim-status-tag status-pending">Claim Under Review</span>
          )}

          {canClaimFoundItem && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenClaim(foundItem);
              }}
            >
              <Send size={16} />
              <span>Claim This Item</span>
            </button>
          )}

          {canMarkPossibleMatch && (
            <button
              className="btn btn-success"
              onClick={() => {
                onUpdateStatus(lostItem.id, "Possible Match");
                onClose();
              }}
            >
              <Check size={16} />
              <span>Mark as Possible Match</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
