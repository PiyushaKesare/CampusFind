import React, { useState } from "react";
import {
  Search,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  MapPin,
  Calendar,
  Tag,
  TrendingUp,
  FileText,
  RotateCcw
} from "lucide-react";
import ItemCard from "../components/ItemCard";
import { findPotentialMatches } from "../services/matchingService";

export default function HomePage({
  items = [],
  onNavigate,
  onSelectItem,
  onOpenMatch,
  onOpenArchitecture,
  searchQuery,
  setSearchQuery
}) {
  const [filterType, setFilterType] = useState("all"); // 'all' | 'lost' | 'found'

  // Statistics calculation
  const totalReports = items.length;
  const lostCount = items.filter(i => i.type === "Lost").length;
  const foundCount = items.filter(i => i.type === "Found").length;
  const returnedCount = items.filter(i => i.status === "Returned").length;

  // Filter items for recent display
  const filteredItems = items.filter(item => {
    if (filterType === "lost") return item.type === "Lost";
    if (filterType === "found") return item.type === "Found";
    return true;
  });

  // Check top high-confidence match in the entire system to spotlight in a hero alert!
  let topSystemMatch = null;
  for (const item of items) {
    if (item.type === "Lost" && item.status !== "Returned") {
      const candidates = findPotentialMatches(item, items);
      if (candidates.length > 0 && candidates[0].isHighConfidence) {
        topSystemMatch = {
          base: item,
          match: candidates[0].matchedItem,
          score: candidates[0].score
        };
        break;
      }
    }
  }

  const handleHeroSearch = (e) => {
    e.preventDefault();
    onNavigate("search");
  };

  return (
    <div className="homepage-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Centralized Cloud-Based <br />
            <span className="text-gradient">Lost & Found Management</span>
          </h1>

          <p className="hero-subtitle">
            Say goodbye to scattered WhatsApp groups and cluttered notice boards. Report lost belongings, upload found items, and let our cloud matching algorithm reconnect students with their possessions.
          </p>

          {/* Quick Search Form */}
          <form className="hero-search-box" onSubmit={handleHeroSearch}>
            <Search className="hero-search-icon" size={20} />
            <input
              type="text"
              className="hero-search-input"
              placeholder="Search by item name (e.g., 'Earphones', 'Wallet', 'Calculator', 'ID Card')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="hero-search-btn">
              <span>Search Items</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Category Suggestion Chips */}
          <div className="hero-category-chips">
            <span className="chips-label">Popular Categories:</span>
            {[
              { label: "Electronics", icon: "🎧" },
              { label: "ID & Cards", icon: "💳" },
              { label: "Wallets & Bags", icon: "🎒" },
              { label: "Books & Stationery", icon: "📚" },
              { label: "Keys", icon: "🔑" },
              { label: "Personal", icon: "🚰" }
            ].map(chip => (
              <button
                key={chip.label}
                type="button"
                className="category-chip"
                onClick={() => {
                  setSearchQuery(chip.label);
                  onNavigate("search");
                }}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="hero-cta-row">
            <button
              className="btn btn-lost btn-lg"
              onClick={() => onNavigate("report-lost")}
            >
              <PlusCircle size={20} />
              <span>Report Lost Item</span>
            </button>

            <button
              className="btn btn-found btn-lg"
              onClick={() => onNavigate("report-found")}
            >
              <CheckCircle2 size={20} />
              <span>Report Found Item</span>
            </button>
          </div>

          {/* Floating Trust Pills */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-dot dot-emerald"></span>
              <span>5-Parameter Heuristic Match Engine</span>
            </div>
            <div className="trust-item">
              <span className="trust-dot dot-blue"></span>
              <span>Cloud Firestore Real-Time Sync</span>
            </div>
            <div className="trust-item">
              <span className="trust-dot dot-purple"></span>
              <span>College Roll ID Verified Claims</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Bar (Exact matching Section 10 of requirements) */}
      <section className="stats-bar-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">
              <FileText size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{totalReports}</span>
              <span className="stat-label">Total Reports</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-red">
              <PlusCircle size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{lostCount}</span>
              <span className="stat-label">Lost Belongings</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-green">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{foundCount}</span>
              <span className="stat-label">Found Items</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-emerald">
              <RotateCcw size={22} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{returnedCount}</span>
              <span className="stat-label">Successfully Returned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Spotlight: High Confidence Match Detected Banner */}
      {topSystemMatch && (
        <section className="match-spotlight-section">
          <div className="match-spotlight-card">
            {/* Left: Info */}
            <div className="spotlight-left">
              <div className="spotlight-tag">
                <Sparkles size={15} className="sparkle-anim" />
                <span>AI & Heuristic Algorithm Match</span>
                <span className="spotlight-score-pill">{topSystemMatch.score}% SCORE</span>
              </div>
              <h3 className="spotlight-title">Possible Campus Match Identified!</h3>
              <p className="spotlight-desc">
                High probability correlation detected between {topSystemMatch.base.userName || "a student"}'s reported <strong>"{topSystemMatch.base.itemName}"</strong> and {topSystemMatch.match.userName || "another student"}'s found <strong>"{topSystemMatch.match.itemName}"</strong> at <strong>{topSystemMatch.base.location}</strong>.
              </p>

              {/* Side-by-side preview avatars */}
              <div className="spotlight-thumbs-row">
                <div className="spotlight-thumb-wrap">
                  <span className="thumb-label lost">LOST</span>
                  <img src={topSystemMatch.base.imageURL} alt="Lost" className="spotlight-thumb" />
                  <span className="thumb-caption">{topSystemMatch.base.itemName}</span>
                </div>

                <div className="spotlight-connect-pulse">
                  <Sparkles size={16} className="text-amber" />
                  <span className="connect-line"></span>
                </div>

                <div className="spotlight-thumb-wrap">
                  <span className="thumb-label found">FOUND</span>
                  <img src={topSystemMatch.match.imageURL} alt="Found" className="spotlight-thumb" />
                  <span className="thumb-caption">{topSystemMatch.match.itemName}</span>
                </div>
              </div>
            </div>

            {/* Right: Circular Gauge & Action */}
            <div className="spotlight-right">
              <div className="spotlight-gauge-box">
                <svg className="gauge-svg" width="90" height="90" viewBox="0 0 100 100">
                  <circle
                    className="gauge-bg"
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="8"
                  />
                  <circle
                    className="gauge-fill"
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * topSystemMatch.score) / 100}
                  />
                </svg>
                <div className="gauge-text">
                  <span className="gauge-num">{topSystemMatch.score}%</span>
                  <span className="gauge-sub">CONFIDENCE</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-md spotlight-cta-btn"
                onClick={() => onOpenMatch(topSystemMatch.base, topSystemMatch.match)}
              >
                <Sparkles size={16} />
                <span>Evaluate Match Breakdown</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recent Items Section */}
      <section className="recent-items-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-heading">Recent Campus Reports</h2>
            <p className="section-subheading">
              Browse recently reported lost belongings and items awaiting recovery.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-row">
            <button
              className={`pill-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All Items ({totalReports})
            </button>
            <button
              className={`pill-btn pill-lost ${filterType === "lost" ? "active" : ""}`}
              onClick={() => setFilterType("lost")}
            >
              Lost Only ({lostCount})
            </button>
            <button
              className={`pill-btn pill-found ${filterType === "found" ? "active" : ""}`}
              onClick={() => setFilterType("found")}
            >
              Found Only ({foundCount})
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-grid">
          {filteredItems.slice(0, 6).map((item) => {
            const matches = findPotentialMatches(item, items);
            const topScore = matches.length > 0 ? matches[0].score : 0;
            return (
              <ItemCard
                key={item.id}
                item={item}
                potentialMatchScore={topScore}
                onViewDetails={() => onSelectItem(item)}
                onViewMatch={() => {
                  if (matches.length > 0) {
                    onOpenMatch(item, matches[0].matchedItem);
                  }
                }}
              />
            );
          })}
        </div>

        <div className="view-more-container">
          <button
            className="btn btn-outline btn-lg"
            onClick={() => onNavigate("search")}
          >
            <span>Explore All {totalReports} Campus Reports</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* How Your System Works Section (From Project Spec) */}
      <section className="how-it-works-section">
        <div className="text-center mb-10">
          <span className="badge-section-pill">HOW YOUR SYSTEM WORKS</span>
          <h2 className="section-heading">From Lost to Reunited in 4 Simple Steps</h2>
          <p className="section-subheading max-w-xl mx-auto">
            A seamless cloud workflow connecting students, staff, and security teams across campus.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>User Login</h4>
            <p>
              Students sign in securely using their college credentials managed by <strong>Firebase Authentication</strong>.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h4>Report Item</h4>
            <p>
              Fill out item name, category, color, location, and attach a photo.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Cloud Matching</h4>
            <p>
              The 5-parameter algorithm compares attributes in <strong>Cloud Firestore</strong> and flags matches scoring ≥ 70%.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h4>Verified Claim & Return</h4>
            <p>
              The owner verifies ownership, coordinates safe pickup, and marks the item status as <strong>Returned</strong>.
            </p>
          </div>
        </div>
      </section>


    </div>
  );
}
