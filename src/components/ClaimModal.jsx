import React, { useState } from "react";
import { X, Send, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { submitClaimRequest } from "../services/dataService";

export default function ClaimModal({ item, onClose, onSuccess }) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    claimantName: currentUser?.name || "",
    claimantEmail: currentUser?.email || "",
    claimantPhone: "",
    studentRoll: "",
    proofDetails: "",
    pickupPreference: "Campus Main Security Office"
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.proofDetails.trim()) {
      setError("Please describe identifying features or proof of ownership.");
      return;
    }

    setSubmitting(true);

    const claimPayload = {
      itemId: item.id,
      itemName: item.itemName,
      itemOwnerId: item.userId,
      claimantId: currentUser?.id || null,
      ...formData
    };

    const result = await submitClaimRequest(claimPayload);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSubmitted(true);

    if (onSuccess) {
      onSuccess(item.id);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-md" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="badge-match-header">
              <ShieldCheck size={18} />
              <span>Identity Verification</span>
            </div>
            <h2>Claim Found Item</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body text-center py-8">
            <div className="success-icon-badge">
              <CheckCircle2 size={48} className="text-emerald" />
            </div>
            <h3 className="text-xl font-bold mt-4">Claim Submitted Successfully!</h3>
            <p className="text-muted mt-2 max-w-md mx-auto">
              Your claim for <strong>"{item.itemName}"</strong> has been forwarded to the finder and campus authorities.
              You will receive an in-app notification once verified.
            </p>
            <div className="modal-footer justify-center mt-6">
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-error mb-3">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Item Summary Banner */}
              <div className="claim-item-summary">
                <img src={item.imageURL} alt={item.itemName} className="claim-thumb" />
                <div className="claim-meta">
                  <h4>{item.itemName}</h4>
                  <p className="text-sm text-muted">{item.category} • Found at {item.location}</p>
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Your Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.claimantName}
                  onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                />
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">College Email</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    value={formData.claimantEmail}
                    onChange={(e) => setFormData({ ...formData, claimantEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.claimantPhone}
                    onChange={(e) => setFormData({ ...formData, claimantPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Student Roll Number / Staff ID</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. CS-2024-42"
                  value={formData.studentRoll}
                  onChange={(e) => setFormData({ ...formData, studentRoll: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Proof of Ownership / Distinctive Markings
                  <span className="text-xs text-muted block">
                    (e.g., lock screen wallpaper, specific scratch, serial number, invoice, color of pouch)
                  </span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="Describe unique features only the genuine owner would know..."
                  value={formData.proofDetails}
                  onChange={(e) => setFormData({ ...formData, proofDetails: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Campus Handover Spot</label>
                <select
                  className="form-select"
                  value={formData.pickupPreference}
                  onChange={(e) => setFormData({ ...formData, pickupPreference: e.target.value })}
                >
                  <option value="Campus Main Security Office">Campus Main Security Office (Recommended)</option>
                  <option value="Central Library Front Counter">Central Library Front Counter</option>
                  <option value="Student Affairs Department">Student Affairs Department</option>
                  <option value="Department HOD Office">Department HOD Office</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Send size={16} />
                <span>{submitting ? "Submitting..." : "Submit Claim Request"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
