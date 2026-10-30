import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  MapPin,
  Calendar,
  Palette,
  CheckCircle,
  LayoutGrid,
  ListFilter
} from "lucide-react";
import ItemCard from "../components/ItemCard";
import { INITIAL_CATEGORIES, INITIAL_LOCATIONS } from "../services/mockData";
import { findPotentialMatches } from "../services/matchingService";

export default function SearchPage({
  items = [],
  searchQuery,
  setSearchQuery,
  onSelectItem,
  onOpenMatch
}) {
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'Lost' | 'Found'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'match'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setSelectedColor("");
    setSelectedStatus("Active");
    setSortBy("newest");
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Text Search (Item Name & Description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.itemName?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesLoc) {
          return false;
        }
      }

      // 2. Type Filter (Lost vs Found)
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // 4. Location Filter
      if (selectedLocation !== "all" && item.location !== selectedLocation) {
        return false;
      }

      // 5. Color Filter
      if (selectedColor.trim() && !item.color?.toLowerCase().includes(selectedColor.toLowerCase())) {
        return false;
      }

      // 6. Status Filter
      if (selectedStatus !== "all") {
        if (selectedStatus === "Active" && item.status === "Returned") return false;
        if (selectedStatus !== "Active" && item.status !== selectedStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
      }
      return 0;
    });
  }, [items, searchQuery, selectedType, selectedCategory, selectedLocation, selectedColor, selectedStatus, sortBy]);

  return (
    <div className="search-page-container">
      {/* Search Header Banner */}
      <div className="search-header-hero">
        <h1 className="search-hero-title">Search Campus Lost & Found</h1>
        <p className="search-hero-sub">
          Query real-time records stored in Cloud Firestore. Filter by item name, location, category, and date.
        </p>

        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search className="search-input-icon" size={20} />
          <input
            type="text"
            className="search-large-input"
            placeholder="Type keywords (e.g., 'Earphones', 'Library', 'Wallet', 'Calculator')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter and Results Layout */}
      <div className="search-layout">
        {/* Left Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-sidebar-header">
            <div className="filter-heading-text">
              <SlidersHorizontal size={18} />
              <span>Filter Reports</span>
            </div>
            <button
              className="btn-reset-filters"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Report Type</label>
            <div className="type-toggle-group">
              <button
                className={`type-toggle-btn ${selectedType === "all" ? "active" : ""}`}
                onClick={() => setSelectedType("all")}
              >
                All
              </button>
              <button
                className={`type-toggle-btn btn-lost ${selectedType === "Lost" ? "active" : ""}`}
                onClick={() => setSelectedType("Lost")}
              >
                Lost
              </button>
              <button
                className={`type-toggle-btn btn-found ${selectedType === "Found" ? "active" : ""}`}
                onClick={() => setSelectedType("Found")}
              >
                Found
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Lifecycle Status</label>
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Active">Active (Excludes Returned)</option>
              <option value="all">All Statuses</option>
              <option value="Lost">Lost</option>
              <option value="Possible Match">Possible Match</option>
              <option value="Found">Found</option>
              <option value="Claimed">Claimed</option>
              <option value="Returned">Returned</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {INITIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label className="filter-label">Campus Location</label>
            <select
              className="filter-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">All Campus Locations</option>
              {INITIAL_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="filter-group">
            <label className="filter-label">Color Keyword</label>
            <input
              type="text"
              className="filter-input"
              placeholder="e.g. Black, Blue, Silver"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
        </aside>

        {/* Right Content Area: Results */}
        <main className="search-results-area">
          <div className="results-control-bar">
            <div className="results-count">
              Found <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? "report" : "reports"}
              {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
            </div>

            <div className="results-actions-right">
              <div className="results-sort">
                <label className="sort-label">Sort:</label>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest Date</option>
                  <option value="oldest">Oldest Date</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <ListFilter size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid / List */}
          {filteredItems.length === 0 ? (
            <div className="empty-results-box">
              <Search size={44} className="text-muted mb-2" />
              <h3>No matching items found</h3>
              <p>Try clearing some filters or searching with different keywords.</p>
              <button
                className="btn btn-outline btn-md mt-4"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="items-grid">
              {filteredItems.map((item) => {
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
          ) : (
            <div className="items-list-compact">
              {filteredItems.map((item) => {
                const matches = findPotentialMatches(item, items);
                const topScore = matches.length > 0 ? matches[0].score : 0;
                const isLost = item.type === "Lost";
                return (
                  <div key={item.id} className="compact-item-row" onClick={() => onSelectItem(item)}>
                    <img src={item.imageURL} alt={item.itemName} className="compact-item-thumb" />
                    <div className="compact-item-info">
                      <div className="compact-title-row">
                        <span className={`type-tag ${isLost ? "type-lost" : "type-found"}`}>{item.type}</span>
                        <h4 className="compact-title">{item.itemName}</h4>
                        <span className={`status-badge badge-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
                      </div>
                      <div className="compact-meta-row">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    {topScore >= 70 && (
                      <span className="compact-match-badge" onClick={(e) => { e.stopPropagation(); onOpenMatch(item, matches[0].matchedItem); }}>
                        ⚡ {topScore}% Match
                      </span>
                    )}
                    <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); onSelectItem(item); }}>
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
