import React, { useState } from "react";
import {
  Upload,
  AlertCircle,
  PlusCircle,
  MapPin,
  Calendar,
  Tag,
  Palette,
  FileText,
  Phone,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createItemReport, uploadItemImage } from "../services/dataService";
import { INITIAL_CATEGORIES, INITIAL_LOCATIONS } from "../services/mockData";
import { findPotentialMatches } from "../services/matchingService";

export default function ReportLostPage({ items = [], onNavigate, onOpenMatch, onItemCreated }) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    itemName: "",
    category: "Electronics",
    color: "Black",
    date: new Date().toISOString().split("T")[0],
    location: "College Library",
    customLocation: "",
    description: "",
    contactInfo: currentUser ? currentUser.email : ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [foundMatches, setFoundMatches] = useState([]);

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
        : "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80";

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
        type: "Lost",
        color: formData.color,
        location: finalLocation,
        date: formData.date,
        description: formData.description,
        imageURL: uploadedImageURL,
        contactInfo: formData.contactInfo
      };

      // 3. Save to Cloud Firestore
      const created = await createItemReport(reportPayload);
      if (onItemCreated) onItemCreated(created);

      // 4. Run automated matching against existing found reports
      const potentialMatches = findPotentialMatches(created, items);
      setFoundMatches(potentialMatches);
      setSubmittedItem(created);
    } catch (err) {
      console.error("Failed to submit lost report:", err);
      alert("Error reporting lost item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page-container">
      <div className="report-card">
        {/* Header */}
        <div className="report-header lost-header">
          <div className="header-icon-pill">
            <PlusCircle size={24} />
          </div>
          <h2>Report a Lost Item</h2>
          <p>
            Submit detailed information about your lost belongings. Our cloud matching engine will compare it against all reported found items automatically.
          </p>
        </div>

        {submittedItem ? (
          <div className="submission-success-view">
            <div className="success-badge-large">
              <CheckCircle2 size={54} className="text-emerald" />
            </div>
            <h3 className="success-title">Lost Item Report Published!</h3>
            <p className="success-desc">
              Your report for <strong>"{submittedItem.itemName}"</strong> has been recorded in Cloud Firestore.
            </p>

            {foundMatches.length > 0 && foundMatches[0].isHighConfidence ? (
              <div className="match-alert-box">
                <div className="match-alert-header">
                  <Sparkles size={20} className="sparkle-anim" />
                  <h4>Possible Match Found ({foundMatches[0].score}%)!</h4>
                </div>
                <p>
                  A found item titled <strong>"{foundMatches[0].matchedItem.itemName}"</strong> reported at <strong>{foundMatches[0].matchedItem.location}</strong> has high similarity to your lost item!
                </p>
                <button
                  className="btn btn-primary btn-md mt-3"
                  onClick={() => onOpenMatch(submittedItem, foundMatches[0].matchedItem)}
                >
                  <Sparkles size={16} />
                  <span>Compare Match ({foundMatches[0].score}%)</span>
                </button>
              </div>
            ) : (
              <div className="info-box-neutral mt-4">
                <AlertCircle size={18} />
                <span>No direct matches yet. You will receive an in-app alert as soon as someone reports a matching item.</span>
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
                    description: "",
                    contactInfo: currentUser ? currentUser.email : ""
                  });
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Report Another Item
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
                  <span className="form-hint">(e.g. Black JBL Earphones, Casio FX-991CW, College ID Card)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Enter specific item name with brand or model"
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
                  placeholder="e.g. Black, Navy Blue, Silver, Brown"
                  required
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              {/* Campus Location */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={15} />
                  <span>Campus Location Lost *</span>
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

              {/* Date Lost */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} />
                  <span>Date Lost *</span>
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
                  <label className="form-label">Specify Custom Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Near Badminton Court, 3rd Floor Water Cooler"
                    required
                    value={formData.customLocation}
                    onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                  />
                </div>
              )}

              {/* Image Upload with Preview */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  <ImageIcon size={15} />
                  <span>Upload Photograph / Reference Image</span>
                  <span className="form-hint">(Stored with the report)</span>
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
                      <Upload size={32} className="upload-icon" />
                      <span className="upload-text">Click to choose image or drag & drop</span>
                      <span className="upload-subtext">JPG, PNG, WebP (Max 5MB)</span>
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
                  <span>Detailed Description *</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required
                  placeholder="Provide distinguishing features, scratches, stickers, accessories, exact room number, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              {/* Contact Details */}
              <div className="form-group col-span-2">
                <label className="form-label">
                  <Phone size={15} />
                  <span>Contact Information</span>
                  <span className="form-hint">(Visible to verified finders / campus desk)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Email and phone number"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                />
              </div>
            </div>

            {/* Form Actions */}
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
                className="btn btn-lost btn-lg"
                disabled={loading}
              >
                {loading ? "Publishing to Cloud..." : "Submit Lost Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
