import { db, isFirebaseConfigured } from "../firebase/config";
import { INITIAL_ITEMS, INITIAL_CATEGORIES, INITIAL_LOCATIONS } from "./mockData";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
  onSnapshot
} from "firebase/firestore";
import { findPotentialMatches } from "./matchingService";
import { triggerServerlessItemEvent } from "./serverlessEngine";
import { incrementResourceUsage } from "./resourceManager";
import { logSecurityEvaluation } from "./securityService";

const STORAGE_ITEMS_KEY = "campus_lost_found_items_v1";
const STORAGE_NOTIFS_KEY = "campus_lost_found_notifications_v1";
const STORAGE_CLAIMS_KEY = "campus_lost_found_claims_v1";

// Helper to get local items
function getLocalItems() {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read local items:", e);
  }
  // Initialize with rich mock data. Return a copy so later mutations (new
  // reports being prepended) never modify the imported seed array itself.
  const seeded = JSON.parse(JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveLocalItems(items) {
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
}

// 1. Fetch all items
export async function fetchAllItems() {
  incrementResourceUsage("read", 1);
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      if (items.length === 0) {
        // Empty database: show the bundled sample reports. They are display-only
        // and are not written to Firestore.
        return JSON.parse(JSON.stringify(INITIAL_ITEMS));
      }
      return items;
    } catch (err) {
      console.warn("Firestore fetch error, falling back to local sandbox:", err);
      return getLocalItems();
    }
  }
  return getLocalItems();
}

// 2. Store image as a data URL (Firebase Storage needs the paid Blaze plan)
export async function uploadItemImage(file) {
  incrementResourceUsage("write", 1);
  if (!file) return "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80";

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      resolve("https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80");
    };
    reader.readAsDataURL(file);
  });
}

// 3. Create a new item report (Lost or Found)
export async function createItemReport(itemData) {
  if (!itemData?.itemName?.trim()) {
    throw new Error("An item name is required to create a report.");
  }
  if (!["Lost", "Found"].includes(itemData.type)) {
    throw new Error("A report must be either Lost or Found.");
  }
  if (!itemData?.description?.trim()) {
    throw new Error("A description is required to create a report.");
  }

  incrementResourceUsage("write", 1);
  const newItem = {
    ...itemData,
    status: itemData.type === "Lost" ? "Lost" : "Found",
    createdAt: new Date().toISOString()
  };

  let createdWithId = null;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, "items"), {
        ...newItem,
        createdAt: serverTimestamp()
      });
      createdWithId = { ...newItem, id: docRef.id };
    } catch (err) {
      console.warn("Firestore addDoc failed, using local storage:", err);
    }
  }

  if (!createdWithId) {
    // Local sandbox mode
    const localItems = getLocalItems();
    createdWithId = {
      ...newItem,
      id: `item-${Date.now()}`
    };
    localItems.unshift(createdWithId);
    saveLocalItems(localItems);
  }

  // Asynchronously fire Serverless Cloud Function Trigger (FaaS) against the
  // active data source (Firestore when configured, local sandbox otherwise).
  const allCurrentItems = await fetchAllItems();
  triggerServerlessItemEvent(createdWithId, allCurrentItems).catch(console.error);

  // Check matching algorithm immediately for in-app alert
  await handleMatchCheckOnNewReport(createdWithId);

  return createdWithId;
}

// 4. Update item status (e.g. Lost -> Possible Match -> Found -> Returned)
export async function updateItemStatus(itemId, newStatus) {
  incrementResourceUsage("write", 1);
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, "items", itemId);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.warn("Firestore update error:", err);
    }
  }

  const items = getLocalItems();
  const updated = items.map(item => item.id === itemId ? { ...item, status: newStatus } : item);
  saveLocalItems(updated);
  return updated.find(i => i.id === itemId);
}

// 5. Delete item (Admin / Owner)
export async function deleteItemReport(itemId) {
  incrementResourceUsage("delete", 1);
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, "items", itemId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn("Firestore delete error:", err);
    }
  }

  const items = getLocalItems();
  const filtered = items.filter(item => item.id !== itemId);
  saveLocalItems(filtered);
  return true;
}


// 6. Handle Match Checking when a new report is posted
async function handleMatchCheckOnNewReport(newReport) {
  const allItems = await fetchAllItems();
  const matches = findPotentialMatches(newReport, allItems);

  if (matches.length > 0 && matches[0].isHighConfidence) {
    const topMatch = matches[0];
    // Add in-app notification for the user
    addInAppNotification({
      title: `⚡ Possible Match Found (${topMatch.score}%)`,
      message: `A possible match for "${newReport.itemName}" was found: "${topMatch.matchedItem.itemName}" at ${topMatch.matchedItem.location}.`,
      relatedItemId: newReport.id,
      matchedItemId: topMatch.matchedItem.id,
      targetUserId: newReport.userId,
      score: topMatch.score
    });

    // Also notify the finder/owner of the matched item
    addInAppNotification({
      title: `🔔 Someone reported a matching ${newReport.type} item!`,
      message: `A report for "${newReport.itemName}" closely matches your item "${topMatch.matchedItem.itemName}" (${topMatch.score}% match score).`,
      relatedItemId: topMatch.matchedItem.id,
      matchedItemId: newReport.id,
      targetUserId: topMatch.matchedItem.userId,
      score: topMatch.score
    });
  }
}

// 7. In-App Notifications Service
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      // Older sandbox data stored the demo match alert without an owner.
      // Scope it to the student it actually refers to instead of showing it
      // to every account on the device.
      let migrated = false;
      list.forEach(notification => {
        if (notification.id === "notif-1" && !notification.targetUserId) {
          notification.targetUserId = "user-piyusha";
          migrated = true;
        }
      });
      if (migrated) {
        localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(list));
      }
      return list;
    }
  } catch (e) {
    console.error("Failed to read notifications:", e);
  }

  // Initial welcome notifications
  const initial = [
    {
      id: "notif-1",
      title: "🎯 95% Match Detected!",
      message: 'Possible match found between Piyusha\'s "Black JBL Earphones" and found "Black Bluetooth Earphones" at College Library.',
      createdAt: new Date().toISOString(),
      read: false,
      score: 95,
      relatedItemId: "item-101",
      matchedItemId: "item-102",
      targetUserId: "user-piyusha"
    },
    {
      id: "notif-2",
      title: "🏫 Welcome to Campus Lost & Found",
      message: "Cloud database connected. Search, report, and track lost belongings across all campus departments.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: true
    }
  ];
  localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(initial));
  return initial;
}

let notificationSequence = 0;

function createNotificationId() {
  notificationSequence += 1;
  return `notif-${Date.now()}-${notificationSequence}-${Math.random().toString(36).slice(2, 7)}`;
}

export function addInAppNotification(notification) {
  const list = getStoredNotifications();
  const newNotif = {
    id: createNotificationId(),
    createdAt: new Date().toISOString(),
    read: false,
    ...notification
  };
  if (isFirebaseConfigured() && db) {
    addDoc(collection(db, "notifications"), { ...newNotif, createdAt: serverTimestamp() }).catch((err) =>
      console.warn("Firestore notification write failed:", err)
    );
  }
  list.unshift(newNotif);
  localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(list));
  // Let the notification context refresh immediately, without a page reload.
  window.dispatchEvent(new Event("campus-notifications-updated"));
  return newNotif;
}

// Live notification feed for the signed-in student (Firestore only).
// Returns an unsubscribe function, or null when Firebase is not configured.
export function subscribeToNotifications(userId, onChange) {
  if (!isFirebaseConfigured() || !db || !userId) return null;
  return onSnapshot(
    query(collection(db, "notifications"), where("targetUserId", "in", [userId, null]), orderBy("createdAt", "desc")),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.warn("Notification listener failed:", err)
  );
}

export function markNotificationAsRead(notifId) {
  if (isFirebaseConfigured() && db) {
    updateDoc(doc(db, "notifications", notifId), { read: true }).catch((err) =>
      console.warn("Firestore notification update failed:", err)
    );
  }
  const list = getStoredNotifications();
  const updated = list.map(n => n.id === notifId ? { ...n, read: true } : n);
  localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("campus-notifications-updated"));
  return updated;
}

// 8. Claims Service
export async function submitClaimRequest(claimData) {
  try {
    // Server-side style validation: the form is not the only way claims are
    // created, so required ownership proof is enforced here as well.
    if (!claimData?.itemId) {
      return { success: false, error: "This claim is not linked to a reported item." };
    }
    if (!claimData.proofDetails || claimData.proofDetails.trim().length < 6) {
      return { success: false, error: "Please describe identifying features or proof of ownership." };
    }

    const claims = await fetchClaims();

    // One open claim per student per item: prevents duplicate submissions and
    // alerts to the finder while a verification is already in progress.
    const alreadyClaimed = claims.some((claim) =>
      claim.itemId === claimData.itemId &&
      claim.status === "Pending Review" &&
      ((claimData.claimantId && claim.claimantId === claimData.claimantId) ||
        (claimData.claimantEmail &&
          claim.claimantEmail.toLowerCase() === claimData.claimantEmail.toLowerCase()))
    );
    if (alreadyClaimed) {
      return { success: false, error: "You already have a claim under review for this item." };
    }

    const newClaim = {
      id: `claim-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "Pending Review",
      ...claimData
    };
    if (isFirebaseConfigured() && db) {
      const docRef = await addDoc(collection(db, "claims"), newClaim);
      newClaim.id = docRef.id;
    } else {
      claims.unshift(newClaim);
      localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims));
    }

    // The claim stays "Pending Review" until an administrator verifies the
    // proof; the found item is not marked "Claimed" on submission.
    addInAppNotification({
      title: "📩 New Item Claim Received",
      message: `${claimData.claimantName} has submitted a claim for "${claimData.itemName}". Awaiting admin verification.`,
      relatedItemId: claimData.itemId,
      targetUserId: claimData.itemOwnerId
    });

    return { success: true, claim: newClaim };
  } catch (e) {
    console.error("Claim submission failed:", e);
    return { success: false, error: "Claim submission failed. Please try again." };
  }
}

// 9. Claim verification (admin decides the outcome of a pending claim)
export async function updateClaimStatus(claimId, status) {
  if (status !== "Approved" && status !== "Rejected") {
    return { success: false, error: "Unsupported claim status." };
  }

  try {
    const claims = await fetchClaims();
    const claim = claims.find((entry) => entry.id === claimId);
    if (!claim) {
      return { success: false, error: "Claim not found." };
    }
    if (claim.status !== "Pending Review") {
      return { success: false, error: "This claim has already been reviewed." };
    }

    const reviewedAt = new Date().toISOString();
    claim.status = status;
    claim.reviewedAt = reviewedAt;

    // One item can only be handed to one verified owner: approving a claim
    // automatically closes any other open claims for the same item.
    if (status === "Approved") {
      claims.forEach((otherClaim) => {
        if (
          otherClaim.id !== claim.id &&
          otherClaim.itemId === claim.itemId &&
          otherClaim.status === "Pending Review"
        ) {
          otherClaim.status = "Rejected";
          otherClaim.reviewedAt = reviewedAt;
          if (otherClaim.claimantId) {
            addInAppNotification({
              title: "❌ Claim Rejected",
              message: `Another verified owner was approved for "${claim.itemName}", so your pending claim was closed.`,
              relatedItemId: claim.itemId,
              targetUserId: otherClaim.claimantId
            });
          }
        }
      });
    }

    if (isFirebaseConfigured() && db) {
      await updateDoc(doc(db, "claims", claim.id), { status, reviewedAt });
      for (const other of claims) {
        if (other.id !== claim.id && other.status === "Rejected" && other.reviewedAt === reviewedAt) {
          await updateDoc(doc(db, "claims", other.id), { status: "Rejected", reviewedAt });
        }
      }
    } else {
      localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims));
    }

    if (claim.claimantId) {
      addInAppNotification({
        title: status === "Approved" ? "✅ Claim Approved" : "❌ Claim Rejected",
        message:
          status === "Approved"
            ? `Your claim for "${claim.itemName}" was verified. Collect it from ${claim.pickupPreference || "the campus security office"}.`
            : `Your claim for "${claim.itemName}" could not be verified. Please contact the campus security desk with further proof.`,
        relatedItemId: claim.itemId,
        targetUserId: claim.claimantId
      });
    }

    return { success: true, claim };
  } catch (e) {
    console.error("Claim review failed:", e);
    return { success: false, error: "Could not update the claim. Please try again." };
  }
}

export function getClaims() {
  try {
    const raw = localStorage.getItem(STORAGE_CLAIMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Firestore-backed claims: fetch all claims, returns [] on failure.
export async function fetchClaims() {
  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await getDocs(collection(db, "claims"));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Firestore claims fetch failed:", err);
    }
  }
  return getClaims();
}

// Reset sandbox data to defaults
export function resetToSampleData() {
  localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
  localStorage.removeItem(STORAGE_CLAIMS_KEY);
  localStorage.removeItem(STORAGE_NOTIFS_KEY);
  return INITIAL_ITEMS;
}
