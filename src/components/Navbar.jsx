import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { isFirebaseConfigured } from "../firebase/config";
import {
  Cloud,
  Search,
  PlusCircle,
  CheckCircle,
  Bell,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  onSelectItem
}) {
  const { currentUser, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Close any open navbar menu on outside click or Escape.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      const clickedMobileMenu =
        (mobileMenuRef.current && mobileMenuRef.current.contains(event.target)) ||
        (mobileMenuButtonRef.current && mobileMenuButtonRef.current.contains(event.target));
      if (!clickedMobileMenu) {
        setShowMobileMenu(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const goToTab = (tab) => {
    setActiveTab(tab);
    closeMenus();
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => setActiveTab("home")}>
          <div className="brand-icon-wrapper">
            <Cloud className="brand-cloud-icon" />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              Campus<span>Find</span>
            </div>
            <div className="brand-subtitle">Lost & Found</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>

          <button
            className={`nav-link ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <Search size={15} />
            <span>Search</span>
          </button>

          <button
            className={`nav-link report-lost-btn ${activeTab === "report-lost" ? "active" : ""}`}
            onClick={() => currentUser ? setActiveTab("report-lost") : setActiveTab("auth")}
            title="Report Lost"
            aria-label="Report Lost"
          >
            <PlusCircle size={15} />
            <span>Report Lost</span>
          </button>

          <button
            className={`nav-link report-found-btn ${activeTab === "report-found" ? "active" : ""}`}
            onClick={() => currentUser ? setActiveTab("report-found") : setActiveTab("auth")}
            title="Report Found"
            aria-label="Report Found"
          >
            <CheckCircle size={15} />
            <span>Report Found</span>
          </button>

          <button
            className={`nav-link ${activeTab === "my-reports" ? "active" : ""}`}
            onClick={() => currentUser ? setActiveTab("my-reports") : setActiveTab("auth")}
          >
            <span>My Reports</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-link admin-nav-link ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
              title="Admin"
              aria-label="Admin"
            >
              <ShieldCheck size={15} />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Mobile navigation toggle */}
          <button
            ref={mobileMenuButtonRef}
            className="icon-action-btn mobile-menu-btn"
            onClick={() => {
              setShowNotifications(false);
              setShowUserMenu(false);
              setShowMobileMenu(!showMobileMenu);
            }}
            title="Open navigation menu"
            aria-label="Open navigation menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="notif-wrapper" ref={notificationsRef}>
            <button
              className="icon-action-btn notif-btn"
              onClick={() => {
                setShowUserMenu(false);
                setShowNotifications(!showNotifications);
              }}
              title="Notifications & Match Alerts"
              aria-label="Notifications & Match Alerts"
              aria-expanded={showNotifications}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <div className="notif-heading">
                    <Sparkles size={16} className="text-amber" />
                    <span>Match & Activity Alerts</span>
                  </div>
                  <span className="notif-count-badge">{notifications.length} alerts</span>
                </div>

                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No new notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notif-item ${!notif.read ? "unread" : ""}`}
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.relatedItemId) {
                            onSelectItem(notif.relatedItemId);
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <div className="notif-item-title">
                          <span>{notif.title}</span>
                          {!notif.read && <span className="unread-dot"></span>}
                        </div>
                        <p className="notif-item-body">{notif.message}</p>
                        {notif.score && (
                          <div className="notif-match-tag">
                            Match Score: <strong>{notif.score}%</strong>
                          </div>
                        )}
                        <span className="notif-time">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Viva Quick Switcher */}
          <div className="user-menu-wrapper" ref={userMenuRef}>
            {currentUser ? (
              <button
                className="user-profile-pill"
                onClick={() => {
                  setShowNotifications(false);
                  setShowUserMenu(!showUserMenu);
                }}
                title="Account menu"
                aria-label={`Account menu for ${currentUser.name}`}
                aria-expanded={showUserMenu}
              >
                <div className="user-avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role-tag">{currentUser.role}</span>
                </div>
                <ChevronDown size={14} />
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab("auth")}
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}

            {showUserMenu && currentUser && (
              <div className="user-dropdown">
                <div className="dropdown-user-header">
                  <div className="dropdown-user-name">{currentUser.name}</div>
                  <div className="dropdown-user-email">{currentUser.email}</div>
                  <div className="dropdown-user-role">
                    Role: <strong>{currentUser.role.toUpperCase()}</strong>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setActiveTab("my-reports");
                    closeMenus();
                  }}
                >
                  <User size={15} />
                  <span>My Reports</span>
                </button>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    logout();
                    closeMenus();
                    setActiveTab("auth");
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <nav className="mobile-nav-menu" ref={mobileMenuRef} aria-label="Mobile navigation">
          <button className={`mobile-nav-link ${activeTab === "home" ? "active" : ""}`} onClick={() => goToTab("home")}>Home</button>
          <button className={`mobile-nav-link ${activeTab === "search" ? "active" : ""}`} onClick={() => goToTab("search")}>Search</button>
          <button className={`mobile-nav-link ${activeTab === "report-lost" ? "active" : ""}`} onClick={() => goToTab("report-lost")}>Report Lost</button>
          <button className={`mobile-nav-link ${activeTab === "report-found" ? "active" : ""}`} onClick={() => goToTab("report-found")}>Report Found</button>
          <button className={`mobile-nav-link ${activeTab === "my-reports" ? "active" : ""}`} onClick={() => goToTab("my-reports")}>My Reports</button>
          {isAdmin && (
            <button className={`mobile-nav-link ${activeTab === "admin" ? "active" : ""}`} onClick={() => goToTab("admin")}>Admin Dashboard</button>
          )}
          <div className="mobile-nav-divider"></div>
          {currentUser ? (
            <button
              className="mobile-nav-link text-danger"
              onClick={() => {
                logout();
                closeMenus();
                setActiveTab("auth");
              }}
            >
              Sign Out
            </button>
          ) : (
            <button className="mobile-nav-link" onClick={() => goToTab("auth")}>Sign In</button>
          )}
        </nav>
      )}
    </header>
  );
}
