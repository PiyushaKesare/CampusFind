import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import ReportLostPage from "./pages/ReportLostPage";
import ReportFoundPage from "./pages/ReportFoundPage";
import MyReportsPage from "./pages/MyReportsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import ItemDetailModal from "./components/ItemDetailModal";
import MatchingModal from "./components/MatchingModal";
import ClaimModal from "./components/ClaimModal";

import { fetchAllItems, updateItemStatus, deleteItemReport } from "./services/dataService";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

const PROTECTED_TABS = ["report-lost", "report-found", "my-reports"];

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(currentUser ? "home" : "auth");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [detailItem, setDetailItem] = useState(null);
  const [matchModalData, setMatchModalData] = useState(null); // { baseItem, candidateItem }
  const [claimItem, setClaimItem] = useState(null);

  // Single navigation entry point so protected screens cannot be opened by
  // guests or non-admins (the footer and hero CTAs call onNavigate directly).
  const navigateTo = (tab) => {
    if (PROTECTED_TABS.includes(tab) && !currentUser) {
      setActiveTab("auth");
      return;
    }
    if (tab === "admin" && !isAdmin) {
      setActiveTab(currentUser ? "home" : "auth");
      return;
    }
    setActiveTab(tab);
  };

  // Keep the visible screen consistent when the signed-in user changes role
  // or signs out while a protected tab is open.
  useEffect(() => {
    if (PROTECTED_TABS.includes(activeTab) && !currentUser) {
      setActiveTab("auth");
    } else if (activeTab === "admin" && !isAdmin) {
      setActiveTab(currentUser ? "home" : "auth");
    }
  }, [activeTab, currentUser, isAdmin]);

  // Start every screen at the top; otherwise a scrolled admin/search page
  // leaves the next screen (and the auth form) halfway down the viewport.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeTab]);

  // Load items
  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchAllItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Dialogs are rendered by this component, so keep their shared behaviour in
  // one place: freeze background scrolling and let Escape close the topmost
  // dialog (invisible key handling used to leave users stuck on a modal).
  const anyModalOpen = Boolean(
    detailItem || matchModalData || claimItem
  );

  useEffect(() => {
    if (!anyModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (claimItem) setClaimItem(null);
      else if (matchModalData) setMatchModalData(null);
      else if (detailItem) setDetailItem(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [anyModalOpen, claimItem, matchModalData, detailItem]);

  // Update item status
  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      const updatedItem = await updateItemStatus(itemId, newStatus);
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
      if (detailItem && detailItem.id === itemId) {
        setDetailItem(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // Keep the in-memory list in sync when a report page creates a document
  const handleItemCreated = (newItem) => {
    if (!newItem?.id) return;
    setItems(prev => [newItem, ...prev.filter(item => item.id !== newItem.id)]);
  };

  // Delete item report
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteItemReport(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      if (detailItem && detailItem.id === itemId) {
        setDetailItem(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Open item detail
  const handleOpenDetail = (item) => {
    setDetailItem(item);
  };

  // Open item detail by ID (from notification click)
  const handleOpenDetailById = (itemId) => {
    const found = items.find(i => i.id === itemId);
    if (found) {
      setDetailItem(found);
    }
  };

  // Open matching modal
  const handleOpenMatch = (baseItem, candidateItem) => {
    setMatchModalData({ baseItem, candidateItem });
  };

  // Open claim modal
  const handleOpenClaim = (item) => {
    setClaimItem(item);
  };

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onSelectItem={handleOpenDetailById}
      />

      <main className="main-content">
        {activeTab === "home" && (
          <HomePage
            items={items}
            onNavigate={navigateTo}
            onSelectItem={handleOpenDetail}
            onOpenMatch={handleOpenMatch}
            onOpenArchitecture={() => setShowArchitecture(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === "search" && (
          <SearchPage
            items={items}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectItem={handleOpenDetail}
            onOpenMatch={handleOpenMatch}
          />
        )}

        {activeTab === "report-lost" && (
          <ReportLostPage
            items={items}
            onNavigate={navigateTo}
            onOpenMatch={handleOpenMatch}
            onItemCreated={handleItemCreated}
          />
        )}

        {activeTab === "report-found" && (
          <ReportFoundPage
            items={items}
            onNavigate={navigateTo}
            onOpenMatch={handleOpenMatch}
            onItemCreated={handleItemCreated}
          />
        )}

        {activeTab === "my-reports" && (
          <MyReportsPage
            items={items}
            onNavigate={navigateTo}
            onSelectItem={handleOpenDetail}
            onOpenMatch={handleOpenMatch}
            onUpdateStatus={handleUpdateStatus}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === "admin" && (
          <AdminDashboard
            items={items}
            onUpdateStatus={handleUpdateStatus}
            onDeleteItem={handleDeleteItem}
            onSelectItem={handleOpenDetail}
            onOpenArchitecture={() => setShowArchitecture(true)}
          />
        )}

        {activeTab === "auth" && (
          <AuthPage onNavigate={setActiveTab} />
        )}
      </main>

      <Footer
        isAdmin={isAdmin}
        onOpenArchitecture={() => setShowArchitecture(true)}
        setActiveTab={navigateTo}
      />

      {/* Item Detail Modal */}
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          allItems={items}
          onClose={() => setDetailItem(null)}
          onOpenClaim={handleOpenClaim}
          onOpenMatch={handleOpenMatch}
          onUpdateStatus={handleUpdateStatus}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Match Comparison Modal */}
      {matchModalData && (
        <MatchingModal
          baseItem={matchModalData.baseItem}
          candidateItem={matchModalData.candidateItem}
          onClose={() => setMatchModalData(null)}
          onOpenClaim={handleOpenClaim}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Claim Submission Modal */}
      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
