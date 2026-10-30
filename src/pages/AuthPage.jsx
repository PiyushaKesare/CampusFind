import React, { useState } from "react";
import { Lock, Mail, User, Shield, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ onNavigate }) {
  const { login, register, currentUser } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "piyusha@college.edu",
    password: "Password123!",
    role: "student"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your college email address.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!isLoginMode && !formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.role);
      }
      onNavigate("home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Top Header */}
        <div className="auth-header">
          <div className="auth-badge-icon">
            {isLoginMode ? <Lock size={20} /> : <User size={20} />}
          </div>
          <h2>{isLoginMode ? "Sign in to CampusFind" : "Create your account"}</h2>
          <p>
            {isLoginMode
              ? "Enter your college credentials to manage campus belongings."
              : "Register to report lost items and track recoveries on campus."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${isLoginMode ? "active" : ""}`}
            onClick={() => {
              setIsLoginMode(true);
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLoginMode ? "active" : ""}`}
            onClick={() => {
              setIsLoginMode(false);
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error-box">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Full Name
              </label>
              <div className="input-with-icon-wrapper">
                <User size={16} className="input-inner-icon" />
                <input
                  id="auth-name"
                  type="text"
                  className="form-input with-left-icon"
                  required
                  placeholder="e.g. Piyusha Kesare"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              College Email
            </label>
            <div className="input-with-icon-wrapper">
              <Mail size={16} className="input-inner-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input with-left-icon"
                required
                placeholder="student@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <div className="input-with-icon-wrapper">
              <Lock size={16} className="input-inner-icon" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                className="form-input with-left-icon with-right-icon"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-role">
                Campus Role
              </label>
              <select
                id="auth-role"
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty / Staff</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={loading}
          >
            <span>{loading ? "Processing..." : isLoginMode ? "Sign In" : "Create Account"}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Toggle link per DESIGN.md Section 6.2 */}
        <div className="auth-toggle-link-row">
          <span>{isLoginMode ? "Don't have an account?" : "Already have an account?"}</span>
          <button
            type="button"
            className="text-link-btn"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError("");
            }}
          >
            {isLoginMode ? "Sign up" : "Sign in"}
          </button>
        </div>

      </div>
    </div>
  );
}
