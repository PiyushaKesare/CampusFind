import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, isFirebaseConfigured } from "../firebase/config";
import {
  getIdTokenResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { INITIAL_USERS } from "../services/mockData";

const AuthContext = createContext();

const LOCAL_USER_KEY = "campus_lost_found_current_user";
const ROLE_OVERRIDE_KEY = "campus_lost_found_role_overrides";

// Firebase access tokens do not carry the campus role chosen at sign-up, so the
// selected role is remembered per account instead of guessing from the email.
function readRoleOverride(uid) {
  try {
    const map = JSON.parse(localStorage.getItem(ROLE_OVERRIDE_KEY) || "{}");
    return map[uid] || null;
  } catch (e) {
    return null;
  }
}

function rememberRole(uid, role) {
  try {
    const map = JSON.parse(localStorage.getItem(ROLE_OVERRIDE_KEY) || "{}");
    map[uid] = role;
    localStorage.setItem(ROLE_OVERRIDE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Could not persist role selection:", e);
  }
}

// Admin rights come only from the verified `role` custom claim set server-side
// (the same claim Firestore rules check). Email wording is never trusted.
async function resolveFirebaseRole(firebaseUser) {
  try {
    const token = await getIdTokenResult(firebaseUser);
    if (token.claims.role === "admin") return "admin";
  } catch (e) {
    console.error("Could not read role claim:", e);
  }
  return readRoleOverride(firebaseUser.uid) || "student";
}

export function AuthProvider({ children }) {
  // Default to Piyusha Kesare so the demo is instantly usable
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth listener if configured
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userObj = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: await resolveFirebaseRole(firebaseUser)
          };
          setCurrentUser(userObj);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObj));
        } else {
          // Session expired or was revoked: drop the stale local profile so
          // protected screens cannot keep rendering for a signed-out account.
          setCurrentUser(null);
          localStorage.removeItem(LOCAL_USER_KEY);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  // Save changes to localStorage
  const updateUserData = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  // Login handler
  const login = async (email, password) => {
    if (isFirebaseConfigured() && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const userObj = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split("@")[0],
        email: fbUser.email,
        role: await resolveFirebaseRole(fbUser)
      };
      updateUserData(userObj);
      return userObj;
    } else {
      // Local demo login check
      const matchedUser = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `user-${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: "student"
      };
      updateUserData(matchedUser);
      return matchedUser;
    }
  };

  // Register handler
  const register = async (name, email, password, role = "student") => {
    // Self-registration must never mint an administrator. Admin access is
    // provisioned through the verified campus account, not the public form.
    const safeRole = ["student", "faculty"].includes(role) ? role : "student";

    if (isFirebaseConfigured() && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      rememberRole(userCredential.user.uid, safeRole);
      const userObj = {
        id: userCredential.user.uid,
        name,
        email,
        role: safeRole
      };
      updateUserData(userObj);
      return userObj;
    } else {
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: safeRole
      };
      updateUserData(newUser);
      return newUser;
    }
  };

  // Sign out handler
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      await signOut(auth);
    }
    updateUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        isAdmin: currentUser?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
