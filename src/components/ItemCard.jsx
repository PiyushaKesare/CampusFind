import React from "react";
import { MapPin, Calendar, Tag, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function ItemCard({
  item,
  onViewDetails,
  onViewMatch,
  potentialMatchScore,
  onQuickStatusChange
}) {
  const isLost = item.type === "Lost";
  const isReturned = item.status === "Returned";
  const isPossibleMatch = item.status === "Possible Match" || potentialMatchScore >= 70;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Returned":
        return "badge-returned";
      case "Possible Match":
        return "badge-match";
      case "Claimed":
        return "badge-claimed";
      case "Found":
        return "badge-found";
      default:
        return "badge-lost";
    }
  };

  return (
    <div className={`item-card ${isReturned ? "card-returned" : ""}`}>
      {/* Top Banner & Status Badges */}
      <div className="item-card-media">
        <img
          src={item.imageURL || "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80"}
          alt={item.itemName}
          className="item-card-img"
          loading="lazy"
          onError={(e) => {
            // Guard against an endless error loop if the fallback also fails.
            if (e.target.dataset.fallbackApplied) return;
            e.target.dataset.fallbackApplied = "true";
            e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80";
          }}
        />
        <div className="item-card-overlay">
          <div className="overlay-top">
            <span className={`type-tag ${isLost ? "type-lost" : "type-found"}`}>
              {item.type.toUpperCase()}
            </span>
            <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
              {item.status}
            </span>
          </div>

          {potentialMatchScore >= 70 && (
            <div className="match-banner" onClick={(e) => { e.stopPropagation(); onViewMatch(item); }}>
              <Sparkles size={13} className="sparkle-anim" />
              <span>Possible Match ({potentialMatchScore}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Item Information */}
      <div className="item-card-content">
        <div className="item-card-header">
          <h3 className="item-title" title={item.itemName}>
            {item.itemName}
          </h3>
        </div>

        <div className="item-tags-row">
          <span className="meta-tag category-tag">
            <Tag size={12} />
            <span>{item.category}</span>
          </span>
          {item.color && (
            <span className="meta-tag color-tag">
              <span
                className="color-dot"
                style={{
                  backgroundColor: item.color.toLowerCase() === "white" ? "#f1f5f9" : item.color.toLowerCase()
                }}
              ></span>
              <span>{item.color}</span>
            </span>
          )}
        </div>

        <p className="item-description-clamp">
          {item.description}
        </p>

        <div className="item-meta-details">
          <div className="meta-item">
            <MapPin size={13} className="meta-icon" />
            <span className="meta-text">{item.location}</span>
          </div>
          <div className="meta-item">
            <Calendar size={13} className="meta-icon" />
            <span className="meta-text">{item.date}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="item-card-footer">
          <button
            className="btn btn-outline btn-sm full-width"
            onClick={() => onViewDetails(item)}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </button>

          {isPossibleMatch && (
            <button
              className="btn btn-match-highlight btn-sm"
              onClick={() => onViewMatch(item)}
              title="Compare with potential matching reports"
            >
              <Sparkles size={14} />
              <span>Match</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
