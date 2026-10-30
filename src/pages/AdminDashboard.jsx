import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  PlusCircle,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  UserCheck,
  Search,
  Tag,
  MapPin,
  ExternalLink,
  Layers,
  Database,
  X
} from "lucide-react";
import { INITIAL_USERS, INITIAL_CATEGORIES } from "../services/mockData";
import { fetchClaims, updateClaimStatus } from "../services/dataService";

export default function AdminDashboard({
  items = [],
  onUpdateStatus,
  onDeleteItem,
  onSelectItem,
  onOpenArchitecture
}) {
  const [activeAdminTab, setActiveAdminTab] = useState("items"); // 'items' | 'users' | 'claims' | 'categories'
  const [adminSearch, setAdminSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalReports = items.length;
  const lostCount = items.filter(i => i.type === "Lost").length;
  const foundCount = items.filter(i => i.type === "Found").length;
  const returnedCount = items.filter(i => i.status === "Returned").length;
  const [claims, setClaims] = useState([]);
  useEffect(() => {
    fetchClaims().then(setClaims);
  }, []);
  const [claimFeedback, setClaimFeedback] = useState("");

  const claimStatusClass = (status) => {
    if (status === "Approved") return "status-approved";
    if (status === "Rejected") return "status-rejected";
    return "status-pending";
  };

  const handleClaimDecision = async (claim, decision) => {
    const actionLabel = decision === "Approved" ? "approve" : "reject";
    if (!confirm(`Are you sure you want to ${actionLabel} the claim for "${claim.itemName}"?`)) {
      return;
    }

    const result = await updateClaimStatus(claim.id, decision);
    if (!result.success) {
      setClaimFeedback(result.error);
      return;
    }

    setClaims(await fetchClaims());
    // An approved claim moves the found item into the Claimed stage.
    if (decision === "Approved" && typeof onUpdateStatus === "function") {
      onUpdateStatus(claim.itemId, "Claimed");
    }
    setClaimFeedback(
      decision === "Approved"
        ? `Claim for "${claim.itemName}" approved. The item is now marked Claimed.`
        : `Claim for "${claim.itemName}" rejected. The item remains available.`
    );
  };

  // The demo account list only contains three seed accounts, but reports can
  // be authored by other students. Fold every report author into the roster so
  // the admin view never silently omits registered campus users.
  const registeredUsers = [...INITIAL_USERS];
  items.forEach(item => {
    if (!item.userId && !item.userEmail) return;
    const exists = registeredUsers.some(user =>
      (item.userId && user.id === item.userId) ||
      (item.userEmail && user.email?.toLowerCase() === item.userEmail.toLowerCase())
    );
    if (!exists) {
      registeredUsers.push({
        id: item.userId || `user-${item.userEmail}`,
        name: item.userName || "Campus Student",
        email: item.userEmail || "No email on record",
        role: item.userRole || "student",
        department: "Report author",
        year: "Registered"
      });
    }
  });

  // Filtered reports for admin table
  const filteredReports = items.filter(item => {
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      const matchName = item.itemName?.toLowerCase().includes(q);
      const matchUser = item.userName?.toLowerCase().includes(q) || item.userEmail?.toLowerCase().includes(q);
      const matchLoc = item.location?.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchLoc) return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="admin-container">
      {/* Admin Hero Header */}
      <div className="admin-header-card">
        <div className="admin-header-left">
          <div className="admin-shield-icon">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="admin-badge-label">CAMPUS SECURITY & ADMINISTRATION</div>
            <h1 className="admin-title">Central Administrative Console</h1>
            <p className="admin-subtitle">
              Verify campus reports, moderate flagged items, oversee handovers, and review Cloud Firestore activity.
            </p>
          </div>
        </div>

        <div className="admin-header-right">
          <button className="btn btn-cloud-outline btn-md" onClick={onOpenArchitecture}>
            <Database size={16} />
            <span>Cloud Architecture</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid (Matches Section 10 Specification Exactly) */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-label">TOTAL REPORTS</div>
          <div className="kpi-value text-blue">{totalReports}</div>
          <div className="kpi-trend">All registered Firestore items</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-label">LOST ITEMS</div>
          <div className="kpi-value text-rose">{lostCount}</div>
          <div className="kpi-trend">Misplaced across campus</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-label">FOUND ITEMS</div>
          <div className="kpi-value text-emerald">{foundCount}</div>
          <div className="kpi-trend">Reported by campus finders</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-label">RETURNED ITEMS</div>
          <div className="kpi-value text-teal">{returnedCount}</div>
          <div className="kpi-trend">Successfully reunited</div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="admin-tabs-row">
        <button
          className={`admin-tab-btn ${activeAdminTab === "items" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("items")}
        >
          <FileText size={16} />
          <span>Report Moderation ({filteredReports.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminTab === "claims" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("claims")}
        >
          <CheckCircle2 size={16} />
          <span>Claim Verification ({claims.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminTab === "users" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("users")}
        >
          <UserCheck size={16} />
          <span>Registered Campus Users ({registeredUsers.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("categories")}
        >
          <Tag size={16} />
          <span>Taxonomy & Categories</span>
        </button>
      </div>

      {/* Tab 1: Item Moderation Table */}
      {activeAdminTab === "items" && (
        <div className="admin-panel-box">
          <div className="table-controls-bar">
            <div className="admin-search-wrap">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search reports by item name, student, or spot..."
                className="admin-search-input"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
            </div>

            <div className="admin-filter-wrap">
              <label>Status:</label>
              <select
                className="admin-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Lost">Lost</option>
                <option value="Possible Match">Possible Match</option>
                <option value="Found">Found</option>
                <option value="Claimed">Claimed</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Reported By</th>
                  <th>Status</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div className="admin-item-cell" onClick={() => onSelectItem(report)}>
                        <img src={report.imageURL} alt={report.itemName} className="admin-thumb" />
                        <div>
                          <div className="admin-item-title">{report.itemName}</div>
                          <div className="admin-item-id">ID: {report.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`type-tag ${report.type === "Lost" ? "type-lost" : "type-found"}`}>
                        {report.type}
                      </span>
                    </td>

                    <td>{report.category}</td>

                    <td>
                      <div className="cell-flex">
                        <MapPin size={13} className="text-muted" />
                        <span>{report.location}</span>
                      </div>
                    </td>

                    <td>{report.date}</td>

                    <td>
                      <div className="admin-user-cell">
                        <strong>{report.userName}</strong>
                        <span className="text-xs text-muted">{report.userEmail}</span>
                      </div>
                    </td>

                    <td>
                      <select
                        className={`status-select badge-${report.status?.toLowerCase().replace(/\s+/g, '-')}`}
                        value={report.status}
                        onChange={(e) => onUpdateStatus(report.id, e.target.value)}
                      >
                        <option value="Lost">Lost</option>
                        <option value="Possible Match">Possible Match</option>
                        <option value="Found">Found</option>
                        <option value="Claimed">Claimed</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>

                    <td>
                      <div className="admin-action-btns">
                        {report.status !== "Returned" && (
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => onUpdateStatus(report.id, "Returned")}
                            title="Mark as officially returned to owner"
                          >
                            <Check size={14} />
                            <span>Return</span>
                          </button>
                        )}

                        <button
                          className="btn btn-xs btn-outline"
                          onClick={() => onSelectItem(report)}
                          title="View Full Item Details"
                        >
                          View
                        </button>

                        <button
                          className="btn btn-xs btn-danger-outline"
                          onClick={() => {
                            if (confirm(`Admin Action: Permanently delete report for "${report.itemName}"?`)) {
                              onDeleteItem(report.id);
                            }
                          }}
                          title="Delete inappropriate or duplicate report"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Claims Management */}
      {activeAdminTab === "claims" && (
        <div className="admin-panel-box">
          <h3 className="text-lg font-bold mb-4">Ownership Verification Requests</h3>
          {claimFeedback && (
            <div className="alert alert-success mb-4">
              <CheckCircle2 size={16} />
              <span>{claimFeedback}</span>
            </div>
          )}
          {claims.length === 0 ? (
            <div className="text-center py-10 text-muted">
              No claim requests filed yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Claimed Item</th>
                    <th>Claimant Name</th>
                    <th>College Roll / Staff ID</th>
                    <th>Submitted Proof</th>
                    <th>Status</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id}>
                      <td><strong>{claim.itemName}</strong></td>
                      <td>{claim.claimantName}</td>
                      <td>{claim.studentRoll}</td>
                      <td className="max-w-xs text-sm">{claim.proofDetails}</td>
                      <td>
                        <span className={`claim-status-tag ${claimStatusClass(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        {claim.status === "Pending Review" ? (
                          <div className="admin-action-btns">
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() => handleClaimDecision(claim, "Approved")}
                              title="Approve this ownership claim"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              className="btn btn-xs btn-danger-outline"
                              onClick={() => handleClaimDecision(claim, "Rejected")}
                              title="Reject this ownership claim"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Registered Campus Users */}
      {activeAdminTab === "users" && (
        <div className="admin-panel-box">
          <h3 className="text-lg font-bold mb-4">Authorized Campus Users</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student / Staff Name</th>
                  <th>College Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.map((usr) => (
                  <tr key={usr.id}>
                    <td><strong>{usr.name}</strong></td>
                    <td>{usr.email}</td>
                    <td>
                      <span className={`badge-role ${usr.role === "admin" ? "role-admin" : "role-student"}`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Categories */}
      {activeAdminTab === "categories" && (
        <div className="admin-panel-box">
          <h3 className="text-lg font-bold mb-2">Campus Item Categories</h3>
          <p className="text-sm text-muted mb-4">Pre-indexed taxonomies in Cloud Firestore to accelerate matching:</p>
          <div className="category-pill-grid">
            {INITIAL_CATEGORIES.map(cat => (
              <div key={cat} className="admin-category-card">
                <Tag size={16} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
