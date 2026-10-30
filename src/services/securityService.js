/**
 * Cloud Computing Security & RBAC Enforcement Service
 * Implements token inspection, permission evaluation, and audit logging.
 */

// Simulated JWT generator for college identity tokens
export function generateTokenClaims(user) {
  if (!user) return null;
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "https://securetoken.google.com/campus-lost-and-found",
    aud: "campus-lost-and-found",
    auth_time: now,
    user_id: user.id,
    sub: user.id,
    iat: now,
    exp: now + 3600, // 1 hour expiration
    email: user.email,
    email_verified: true,
    name: user.name,
    role: user.role || "student",
    college_domain: "college.edu",
    token_algorithm: "RS256"
  };
}

// Security evaluation audit trail
const SECURITY_LOGS_KEY = "campus_cloud_security_audit_logs";

export function logSecurityEvaluation(action, resource, user, allowed, reason) {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    const entry = {
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      resource,
      userId: user?.id || "anonymous",
      userEmail: user?.email || "anonymous",
      role: user?.role || "unauthenticated",
      allowed,
      reason
    };
    logs.unshift(entry);
    // Keep last 30 entries
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(logs.slice(0, 30)));
    return entry;
  } catch (e) {
    console.error("Security logging failed:", e);
    return null;
  }
}

export function getSecurityAuditLogs() {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: "sec-init-1",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      action: "DOCUMENT_READ",
      resource: "items/*",
      userId: "user-piyusha",
      userEmail: "piyusha@college.edu",
      role: "student",
      allowed: true,
      reason: "Public read permitted by firestore.rules line 18"
    },
    {
      id: "sec-init-2",
      timestamp: new Date(Date.now() - 60000).toISOString(),
      action: "DOCUMENT_DELETE",
      resource: "items/item-102",
      userId: "user-piyusha",
      userEmail: "piyusha@college.edu",
      role: "student",
      allowed: false,
      reason: "DENIED: Non-admin users cannot delete documents owned by others (Rule Line 31)"
    }
  ];
}

// Evaluate simulated request against firestore.rules
export function evaluateSecurityRule(action, resourceType, targetItem, currentUser) {
  if (!currentUser) {
    if (action === "read") {
      logSecurityEvaluation("READ", resourceType, null, true, "Anonymous read permitted for public lost & found directory");
      return { allowed: true, rule: "allow read: if true;" };
    }
    logSecurityEvaluation(action.toUpperCase(), resourceType, null, false, "Unauthenticated access blocked");
    return { allowed: false, rule: "allow write: if isAuthenticated();", error: "User is not authenticated" };
  }

  // Admin status comes only from the role assigned to the account, never from
  // the email address, so a student cannot gain admin UI by picking a name.
  const isAdmin = currentUser.role === "admin";
  const isOwner = targetItem && (targetItem.userId === currentUser.id || targetItem.userEmail === currentUser.email);

  if (action === "delete") {
    if (isAdmin) {
      logSecurityEvaluation("DELETE", `${resourceType}/${targetItem?.id}`, currentUser, true, "Admin role authorized for document deletion (Line 31)");
      return { allowed: true, rule: "allow delete: if isAdmin();" };
    } else {
      logSecurityEvaluation("DELETE", `${resourceType}/${targetItem?.id}`, currentUser, false, "Permission Denied: Only administrators have delete privileges (Line 31)");
      return { allowed: false, rule: "allow delete: if isAdmin();", error: "Security rule violation: Only administrators can delete items" };
    }
  }

  if (action === "update") {
    if (isAdmin || isOwner) {
      logSecurityEvaluation("UPDATE", `${resourceType}/${targetItem?.id}`, currentUser, true, isOwner ? "Author ownership verified" : "Admin override authorized");
      return { allowed: true, rule: "allow update: if isAdmin() || (isAuthenticated() && resource.data.userId == request.auth.uid);" };
    } else {
      logSecurityEvaluation("UPDATE", `${resourceType}/${targetItem?.id}`, currentUser, false, "Permission Denied: User is neither item author nor admin");
      return { allowed: false, rule: "allow update: if isAdmin() || isOwner();", error: "Security rule violation: You cannot edit another student's report" };
    }
  }

  return { allowed: true, rule: "allow read: if true;" };
}
