import React, { useState } from "react";
import { X, Cloud, Key, Check, RotateCcw, AlertCircle, Save, ExternalLink } from "lucide-react";
import { getStoredFirebaseConfig, saveStoredFirebaseConfig, isFirebaseConfigured } from "../firebase/config";
import { resetToSampleData } from "../services/dataService";

export default function FirebaseSettingsModal({ onClose, onConfigSaved }) {
  const currentConfig = getStoredFirebaseConfig() || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  const [formData, setFormData] = useState(currentConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.apiKey && formData.projectId) {
      saveStoredFirebaseConfig(formData);
    } else {
      // Clear to use sandbox
      saveStoredFirebaseConfig(null);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onConfigSaved) onConfigSaved();
      onClose();
      window.location.reload(); // Reload to initialize Firebase SDK
    }, 1200);
  };

  const handleSwitchToSandbox = () => {
    saveStoredFirebaseConfig(null);
    setFormData({
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: ""
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onConfigSaved) onConfigSaved();
      onClose();
      window.location.reload();
    }, 1000);
  };

  const handleResetData = () => {
    if (confirm("Reset local storage to original college demonstration items?")) {
      resetToSampleData();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="badge-cloud-header">
              <Cloud size={18} />
              <span>GCP Firebase Configuration</span>
            </div>
            <h2>Cloud Backend Settings</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Status Alert */}
            <div className={`status-banner ${isFirebaseConfigured() ? "banner-connected" : "banner-sandbox"}`}>
              <div className="banner-icon">
                <Cloud size={20} />
              </div>
              <div className="banner-text">
                <strong>
                  Current Status: {isFirebaseConfigured() ? "Connected to Google Cloud Firebase" : "Active in Campus Cloud Sandbox Mode"}
                </strong>
                <p className="text-xs mt-1">
                  {isFirebaseConfigured()
                    ? "Live Cloud Firestore is active. Items sync directly to your Google Cloud project."
                    : "No API keys required right now! The system is using a local Firestore & Storage simulation with full matching logic, ready for your presentation."}
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="alert alert-success mt-4">
                <Check size={18} />
                <span>Configuration updated successfully! Reloading services...</span>
              </div>
            )}

            {resetSuccess && (
              <div className="alert alert-success mt-4">
                <Check size={18} />
                <span>All sample records restored to default state!</span>
              </div>
            )}

            <div className="config-fields-group mt-4">
              <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                Firebase Web App Credentials (Optional):
              </h4>

              <div className="form-group">
                <label className="form-label">API Key</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="AIzaSy..."
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Project ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="campus-lost-found-demo"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Auth Domain</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="campus-lost-found.firebaseapp.com"
                    value={formData.authDomain}
                    onChange={(e) => setFormData({ ...formData, authDomain: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Storage Bucket</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="campus-lost-found.appspot.com"
                    value={formData.storageBucket}
                    onChange={(e) => setFormData({ ...formData, storageBucket: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">App ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1:123456789:web:abcdef..."
                    value={formData.appId}
                    onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="sandbox-actions mt-4">
              <button
                type="button"
                className="btn btn-outline btn-sm full-width"
                onClick={handleSwitchToSandbox}
              >
                <RotateCcw size={14} />
                <span>Switch to Campus Sandbox Mode (Clear Custom Keys)</span>
              </button>
            </div>
          </div>

          <div className="modal-footer justify-between">
            <button
              type="button"
              className="btn btn-outline btn-sm text-amber"
              onClick={handleResetData}
            >
              Reset Sample Data
            </button>

            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
