import React, { useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
  Tag,
  Palette,
  FileText,
  Phone,
  Sparkles,
  Shield,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createItemReport, uploadItemImage } from "../services/dataService";
import { INITIAL_CATEGORIES, INITIAL_LOCATIONS } from "../services/mockData";
import { findPotentialMatches } from "../services/matchingService";

export default function ReportFoundPage({ items = [], onNavigate, onOpenMatch, onItemCreated }) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    itemName: "",
    category: "Electronics",
    color: "Black",
    date: new Date().toISOString().split("T")[0],
    location: "College Library",
    customLocation: "",
    custodyLocation: "Deposited at Main Library Reception Desk",
    description: "",
    contactInfo: currentUser ? `${currentUser.name} (${currentUser.email})` : ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [lostMatches, setLostMatches] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (JPG, PNG or WebP).");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("That image is larger than 5 MB. Please choose a smaller photo.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName.trim()) {
      alert("Please enter the item name.");
      return;
    }

    setLoading(true);
    try {
      // 1. Store image as a data URL
      const uploadedImageURL = imageFile
        ? await uploadItemImage(imageFile)
        : "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80";

      // 2. Prepare Firestore document
      const finalLocation = formData.location === "Other" && formData.customLocation
        ? formData.customLocation
        : formData.location;

      const reportPayload = {
        userId: currentUser?.id || "user-guest",
        userName: currentUser?.name || "Student",
        userEmail: currentUser?.email || "student@college.edu",
        userRole: currentUser?.role || "student",
        itemName: formData.itemName,
        category: formData.category,
        type: "Found",
        color: formData.color,
        location: finalLocation,
        date: formData.date,
        description: `${formData.description}\n[Current Custody: ${formData.custodyLocation}]`,
        imageURL: uploadedImageURL,
        contactInfo: `${formData.contactInfo} | Current Custody: ${formData.custodyLocation}`
      };

      // 3. Save to Cloud Firestore
      const created = await createItemReport(reportPayload);
      if (onItemCreated) onItemCreated(created);

      // 4. Run automated matching against existing lost reports
      const potentialMatches = findPotentialMatches(created, items);
      setLostMatches(potentialMatches);
      setSubmittedItem(created);
    } catch (err) {
      console.error("Failed to submit found report:", err);
      alert("Error reporting found item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page-container">
      <div className="report-card">
        {/* Header */}
        <div className="report-header found-header">
          <div className="header-icon-pill icon-pill-emerald">
            <CheckCircle2 size={24} />
          </div>
          <h2>Report a Found Item</h2>
          <p>
            Help a fellow student or staff member recover their missing belonging. Enter details and upload a photo to safely store it in the campus cloud.
          </p>
        </div>

        {submittedItem ? (
          <div className="submission-success-view">
            <div className="success-badge-large">
              <CheckCircle2 size={54} className="text-emerald" />
            </div>
            <h3 className="success-title">Found Item Report Recorded!</h3>
            <p className="success-desc">
              Thank you for reporting <strong>"{submittedItem.itemName}"</strong>. Your post is now searchable across the entire campus.
            </p>

            {lostMatches.length > 0 && lostMatches[0].isHighConfidence ? (
              <div className="match-alert-box">
                <div className="match-alert-header">
                  <Sparkles size={20} className="sparkle-anim" />
                  <h4>Potential Owner Located ({lostMatches[0].score}% Match)!</h4>
                </div>
                <p>
                  A student previously reported losing <strong>"{lostMatches[0].matchedItem.itemName}"</strong> at <strong>{lostMatches[0].matchedItem.location}</strong>.
                </p>
                <button
                  className="btn btn-primary btn-md mt-3"
                  onClick={() => onOpenMatch(submittedItem, lostMatches[0].matchedItem)}
                >
                  <Sparkles size={16} />
                  <span>Compare with Lost Report ({lostMatches[0].score}%)</span>
                </button>
              </div>
            ) : (
              <div className="info-box-neutral mt-4">
                <AlertCircle size={18} />
                <span>The item is logged. If an owner files a report matching these specifications, an automated match will be generated.</span>
              </div>
            )}

            <div className="success-actions mt-6">
              <button
                className="btn btn-primary"
                onClick={() => onNavigate("my-reports")}
              >
                Go to My Reports
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSubmittedItem(null);
                  setFormData({
                    itemName: "",
                    category: "Electronics",
                    color: "Black",
                    date: new Date().toISOString().split("T")[0],
                    location: "College Library",
                    customLocation: "",
                    custodyLocation: "Deposited at Main Library Reception Desk",
                    description: "",
                    contactInfo: currentUser ? `${currentUser.name} (${currentUser.email})` : ""
                  });
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Report Another Found Item
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-grid">
              {/* Item Name */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  Item Name *
                  <span className="form-hint">(e.g. Wireless Bluetooth Earbuds, Blue Milton Bottle, Leather Wallet)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Describe the found item briefly"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">
                  <Tag size={15} />
                  <span>Category *</span>
                </label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {INITIAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div className="form-group">
                <label className="form-label">
                  <Palette size={15} />
                  <span>Primary Color *</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Black, Silver, Blue, Red"
                  required
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              {/* Campus Location Found */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={15} />
                  <span>Where Did You Find It? *</span>
                </label>
                <select
                  className="form-select"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  {INITIAL_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="Other">Other Specific Spot</option>
                </select>
              </div>

              {/* Date Found */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} />
                  <span>Date Found *</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Custom Location if Other */}
              {formData.location === "Other" && (
                <div className="form-group col-span-2">
                  <label className="form-label">Specify Found Spot *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Corridor outside Chemistry Lab 2"
                    required
                    value={formData.customLocation}
                    onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                  />
                </div>
              )}

              {/* Current Custody / Deposit location */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  <Shield size={15} />
                  <span>Where is the Item Currently Kept? *</span>
                  <span className="form-hint">(Helps the genuine owner locate physical handover)</span>
                </label>
                <select
                  className="form-select"
                  value={formData.custodyLocation}
                  onChange={(e) => setFormData({ ...formData, custodyLocation: e.target.value })}
                >
                  <option value="Deposited at Main Library Reception Desk">Deposited at Main Library Reception Desk</option>
                  <option value="Handed over to Campus Main Gate Security">Handed over to Campus Main Gate Security</option>
                  <option value="Deposited at Department HOD Office">Deposited at Department HOD Office</option>
                  <option value="Safe with finder (Contact directly for handover)">Safe with finder (Contact directly for handover)</option>
                </select>
              </div>

              {/* Image Upload with Preview */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  <ImageIcon size={15} />
                  <span>Upload Photograph *</span>
                  <span className="form-hint">(Images stored with the report)</span>
                </label>

                <div className="image-upload-zone">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="preview-img" />
                      <button
                        type="button"
                        className="btn-remove-preview"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <label className="upload-dropzone">
                      <Upload size={32} className="upload-icon text-emerald" />
                      <span className="upload-text">Click to choose item photo or drag & drop</span>
                      <span className="upload-subtext">Clear photo helps owners confirm matching items</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="file-hidden-input"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  <FileText size={15} />
                  <span>Description & Identifying Context *</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required
                  placeholder="Describe where it was lying, condition, brand, and any notes for the owner..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              {/* Contact Information */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  <Phone size={15} />
                  <span>Your Contact / Finder Info</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Your Name and contact email/phone"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate("home")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-found btn-lg"
                disabled={loading}
              >
                {loading ? "Publishing to Cloud..." : "Submit Found Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
