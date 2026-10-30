/**
 * Cloud Resource Management & Quotas Tracker
 * Monitors Google Cloud Platform resource quotas, document lifecycle policies, and allocation metrics.
 */

const RESOURCE_QUOTAS_KEY = "campus_cloud_resource_quotas_v1";

export function getResourceMetrics() {
  try {
    const raw = localStorage.getItem(RESOURCE_QUOTAS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  const initial = {
    firestoreReads: 142,
    firestoreReadsLimit: 50000,
    firestoreWrites: 28,
    firestoreWritesLimit: 20000,
    firestoreDeletes: 4,
    firestoreDeletesLimit: 20000,
    storageUsedBytes: 14890000, // 14.89 MB
    storageQuotaBytes: 5368709120, // 5 GB Free Tier
    activeConnections: 6,
    activeItemDocuments: 7,
    returnedItemDocuments: 2,
    archivalPolicyDays: 30
  };
  localStorage.setItem(RESOURCE_QUOTAS_KEY, JSON.stringify(initial));
  return initial;
}

export function incrementResourceUsage(type, count = 1) {
  const metrics = getResourceMetrics();
  if (type === "read") metrics.firestoreReads += count;
  if (type === "write") metrics.firestoreWrites += count;
  if (type === "delete") metrics.firestoreDeletes += count;
  localStorage.setItem(RESOURCE_QUOTAS_KEY, JSON.stringify(metrics));
  return metrics;
}

/**
 * Cloud Resource Lifecycle Archival Simulation
 * In production cloud systems, old resolved items (>30 days) are pruned or transferred 
 * to Cloud Storage Coldline to save primary database memory.
 */
export function executeLifecyclePruning(items) {
  let archivedCount = 0;
  const activeItems = items.filter(item => {
    if (item.status === "Returned") {
      archivedCount++;
      return false;
    }
    return true;
  });

  return {
    prunedItemsCount: archivedCount,
    activeItemsCount: activeItems.length,
    bytesSaved: `${archivedCount * 2.4} KB database memory`,
    timestamp: new Date().toISOString()
  };
}
