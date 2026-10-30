import React, { useState, useEffect } from "react";
import {
  X,
  Cloud,
  Database,
  HardDrive,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Key,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Server,
  Terminal,
  FileCode,
  Radio
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getResourceMetrics, executeLifecyclePruning } from "../services/resourceManager";
import { getServerlessLogs } from "../services/serverlessEngine";
import { getBucketMetadata } from "../services/storageService";
import { generateTokenClaims, getSecurityAuditLogs } from "../services/securityService";

export default function CloudResourceMonitor({ items = [], onClose }) {
  const { currentUser } = useAuth();
  const [activeAreaTab, setActiveAreaTab] = useState("serverless"); // 'paas' | 'storage' | 'database' | 'serverless' | 'security' | 'quotas'
  const [metrics, setMetrics] = useState(getResourceMetrics());
  const [serverlessLogs, setServerlessLogs] = useState(getServerlessLogs());
  const [securityLogs, setSecurityLogs] = useState(getSecurityAuditLogs());
  const [pruningResult, setPruningResult] = useState(null);

  const bucketMeta = getBucketMetadata();
  const tokenClaims = generateTokenClaims(currentUser);

  // Refresh serverless logs dynamically
  useEffect(() => {
    const handleServerlessUpdate = (e) => {
      setServerlessLogs(prev => [e.detail, ...prev]);
    };
    window.addEventListener("serverless-log-updated", handleServerlessUpdate);
    return () => window.removeEventListener("serverless-log-updated", handleServerlessUpdate);
  }, []);

  const handlePruning = () => {
    const result = executeLifecyclePruning(items);
    setPruningResult(result);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="badge-cloud-header">
              <Cloud size={18} />
              <span>GCP & Firebase Cloud Management Console</span>
            </div>
            <h2>Cloud Architecture & Implementation Inspector</h2>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* 6 Cloud Area Navigation Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab-btn ${activeAreaTab === "serverless" ? "active" : ""}`}
            onClick={() => setActiveAreaTab("serverless")}
          >
            <Cpu size={15} />
            <span>1. Serverless (FaaS)</span>
          </button>

          <button
            className={`modal-tab-btn ${activeAreaTab === "storage" ? "active" : ""}`}
            onClick={() => setActiveAreaTab("storage")}
          >
            <HardDrive size={15} />
            <span>2. Cloud Storage</span>
          </button>

          <button
            className={`modal-tab-btn ${activeAreaTab === "database" ? "active" : ""}`}
            onClick={() => setActiveAreaTab("database")}
          >
            <Database size={15} />
            <span>3. Cloud Database</span>
          </button>

          <button
            className={`modal-tab-btn ${activeAreaTab === "security" ? "active" : ""}`}
            onClick={() => setActiveAreaTab("security")}
          >
            <ShieldCheck size={15} />
            <span>4. Cloud Security (RBAC)</span>
          </button>

          <button
            className={`modal-tab-btn ${activeAreaTab === "quotas" ? "active" : ""}`}
            onClick={() => setActiveAreaTab("quotas")}
          >
            <TrendingUp size={15} />
            <span>5. Resource & Quotas</span>
          </button>

          <button
            className={`modal-tab-btn ${activeAreaTab === "paas" ? "active" : ""}`}
            onClick={() => setActiveAreaTab("paas")}
          >
            <Layers size={15} />
            <span>6. PaaS / SaaS</span>
          </button>
        </div>

        {/* Modal Body with 6 Dedicated Cloud Panes */}
        <div className="modal-body">
          {/* 1. SERVERLESS COMPUTING (FaaS) */}
          {activeAreaTab === "serverless" && (
            <div className="cloud-pane">
              <div className="status-banner banner-connected mb-4">
                <Cpu size={20} />
                <div>
                  <strong>Serverless Event-Driven Architecture (Google Cloud Functions)</strong>
                  <p className="text-xs mt-1">
                    Whenever a student files a lost or found report, a serverless background trigger (<code>onItemReportedEvent</code>) fires on-demand without managing 24/7 server hardware.
                  </p>
                </div>
              </div>

              <div className="grid grid-3 gap-3 mb-4">
                <div className="meta-card">
                  <span className="meta-label">RUNTIME</span>
                  <span className="meta-value">Node.js 20 Managed</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">MEMORY PROVISION</span>
                  <span className="meta-value">256 MB Ephemeral</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">SCALING POLICY</span>
                  <span className="meta-value">0 to 1,000 instances</span>
                </div>
              </div>

              <h4 className="section-title">
                <Terminal size={15} />
                <span>Live Serverless Execution Logs Stream:</span>
              </h4>

              <div className="serverless-logs-box">
                {serverlessLogs.map((log) => (
                  <div key={log.executionId} className="serverless-log-row">
                    <div className="log-top">
                      <span className="log-id">[{log.executionId}]</span>
                      <span className="log-trigger">{log.trigger}</span>
                      <span className="log-duration">{log.durationMs}ms latency</span>
                      <span className={`log-badge ${log.coldStart ? "cold" : "warm"}`}>
                        {log.coldStart ? "COLD START" : "WARM START"}
                      </span>
                    </div>
                    <div className="log-msg">{log.details}</div>
                    <div className="log-meta">
                      Region: {log.region} • Memory: {log.memoryUsed}/{log.memoryAllocated} • {new Date(log.eventTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CLOUD STORAGE (Object Storage) */}
          {activeAreaTab === "storage" && (
            <div className="cloud-pane">
              <div className="status-banner banner-connected mb-4">
                <HardDrive size={20} />
                <div>
                  <strong>Google Cloud Storage (Firebase Storage Object Buckets)</strong>
                  <p className="text-xs mt-1">
                    Unstructured binary images are decoupled from Cloud Firestore documents, uploaded directly to Google Cloud Storage buckets with CDN caching.
                  </p>
                </div>
              </div>

              <div className="grid grid-2 gap-4 mb-4">
                <div className="meta-card">
                  <span className="meta-label">BUCKET URI</span>
                  <span className="meta-value font-mono text-sm">{bucketMeta.bucketName}</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">STORAGE CLASS</span>
                  <span className="meta-value">{bucketMeta.storageClass} ({bucketMeta.locationType})</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">TOTAL OBJECTS</span>
                  <span className="meta-value">{items.length} Images Uploaded</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">BUCKET CONSUMPTION</span>
                  <span className="meta-value">{bucketMeta.totalSizeFormatted}</span>
                </div>
              </div>

              <h4 className="section-title">Enforced Firestore Rules (`firestore.rules`):</h4>
              <pre className="code-block">{`match /lost-and-found/{allPaths=**} {
  allow read: if true;
  allow create: if request.auth != null 
    && request.resource.size < 5 * 1024 * 1024   // Max 5MB Limit
    && request.resource.contentType.matches('image/.*'); // Strict MIME Image Check
  allow delete: if request.auth.token.role == 'admin';
}`}</pre>
            </div>
          )}

          {/* 3. CLOUD DATABASE (Cloud Firestore) */}
          {activeAreaTab === "database" && (
            <div className="cloud-pane">
              <div className="status-banner banner-connected mb-4">
                <Database size={20} />
                <div>
                  <strong>Cloud Firestore (Managed Serverless NoSQL Document Store)</strong>
                  <p className="text-xs mt-1">
                    Automatic multi-region replication, sub-second queries, compound indexing, and real-time document listeners.
                  </p>
                </div>
              </div>

              <div className="grid grid-3 gap-3 mb-4">
                <div className="meta-card">
                  <span className="meta-label">PRIMARY COLLECTION</span>
                  <span className="meta-value">/items ({items.length} docs)</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">CLAIMS COLLECTION</span>
                  <span className="meta-value">/claims</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">CONSISTENCY MODEL</span>
                  <span className="meta-value">Strong Global Consistency</span>
                </div>
              </div>

              <h4 className="section-title">Compound Cloud Query Indexes:</h4>
              <div className="index-list">
                <div className="index-card">
                  <strong>Index 1:</strong> <code>items (type ASC, status ASC, date DESC)</code>
                  <span className="text-xs text-muted block">Optimizes real-time homepage spotlight & matching filters</span>
                </div>
                <div className="index-card mt-2">
                  <strong>Index 2:</strong> <code>items (category ASC, location ASC, createdAt DESC)</code>
                  <span className="text-xs text-muted block">Powers campus search and automated category match queries</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. CLOUD COMPUTING SECURITY & RBAC */}
          {activeAreaTab === "security" && (
            <div className="cloud-pane">
              <div className="status-banner banner-connected mb-4">
                <ShieldCheck size={20} />
                <div>
                  <strong>Cloud Identity, Token Authentication (JWT) & Security Rules</strong>
                  <p className="text-xs mt-1">
                    Database-layer security enforced by declarative Cloud Firestore rules, preventing unauthorized document mutations.
                  </p>
                </div>
              </div>

              {tokenClaims && (
                <div className="jwt-inspector-card mb-4">
                  <div className="jwt-header">
                    <Key size={14} />
                    <span>Decoded Client JWT Token Claims:</span>
                  </div>
                  <pre className="code-block text-xs">{JSON.stringify(tokenClaims, null, 2)}</pre>
                </div>
              )}

              <h4 className="section-title">Real-Time Security Enforcement Audit Trail:</h4>
              <div className="audit-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Operation</th>
                      <th>Resource</th>
                      <th>Caller</th>
                      <th>Decision</th>
                      <th>Security Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td><code>{log.action}</code></td>
                        <td className="text-xs font-mono">{log.resource}</td>
                        <td className="text-xs">{log.userEmail} ({log.role})</td>
                        <td>
                          <span className={`status-badge ${log.allowed ? "badge-found" : "badge-lost"}`}>
                            {log.allowed ? "ALLOWED" : "DENIED"}
                          </span>
                        </td>
                        <td className="text-xs max-w-xs">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. CLOUD RESOURCE MANAGEMENT & QUOTAS */}
          {activeAreaTab === "quotas" && (
            <div className="cloud-pane">
              <div className="status-banner banner-connected mb-4">
                <TrendingUp size={20} />
                <div>
                  <strong>Resource Quotas & Lifecycle Pruning Management</strong>
                  <p className="text-xs mt-1">
                    Monitors cloud operation limits and executes automated lifecycle pruning policies to prevent database bloat.
                  </p>
                </div>
              </div>

              <div className="grid grid-3 gap-3 mb-4">
                <div className="meta-card">
                  <span className="meta-label">FIRESTORE READS (TODAY)</span>
                  <span className="meta-value">{metrics.firestoreReads} / {metrics.firestoreReadsLimit.toLocaleString()}</span>
                  <div className="progress-bar-bg mt-2">
                    <div className="progress-bar-fill" style={{ width: `${(metrics.firestoreReads / metrics.firestoreReadsLimit) * 100}%` }}></div>
                  </div>
                </div>

                <div className="meta-card">
                  <span className="meta-label">FIRESTORE WRITES (TODAY)</span>
                  <span className="meta-value">{metrics.firestoreWrites} / {metrics.firestoreWritesLimit.toLocaleString()}</span>
                  <div className="progress-bar-bg mt-2">
                    <div className="progress-bar-fill" style={{ width: `${(metrics.firestoreWrites / metrics.firestoreWritesLimit) * 100}%` }}></div>
                  </div>
                </div>

                <div className="meta-card">
                  <span className="meta-label">STORAGE CAPACITY</span>
                  <span className="meta-value">{(metrics.storageUsedBytes / (1024 * 1024)).toFixed(1)} MB / 5.0 GB</span>
                  <div className="progress-bar-bg mt-2">
                    <div className="progress-bar-fill" style={{ width: `${(metrics.storageUsedBytes / metrics.storageQuotaBytes) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="lifecycle-box">
                <h4 className="section-title">Lifecycle Pruning Policy (Preventing Cloud Bloat):</h4>
                <p className="text-sm text-muted mb-3">
                  In production cloud deployments, items marked <strong>"Returned"</strong> are archived after 30 days to optimize active Firestore memory and index efficiency.
                </p>
                <button className="btn btn-outline btn-sm" onClick={handlePruning}>
                  <RotateCcw size={14} />
                  <span>Execute Lifecycle Pruning Simulation</span>
                </button>

                {pruningResult && (
                  <div className="alert alert-success mt-3 text-xs">
                    <CheckCircle2 size={16} />
                    <span>
                      Pruning completed: {pruningResult.prunedItemsCount} returned items marked for cold-storage archival. Saved {pruningResult.bytesSaved}.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. PAAS & SAAS */}
          {activeAreaTab === "paas" && (
            <div className="cloud-pane">
              <div className="status-banner banner-connected mb-4">
                <Layers size={20} />
                <div>
                  <strong>PaaS (Platform as a Service) & Multi-Tenant SaaS Delivery</strong>
                  <p className="text-xs mt-1">
                    Managed Google Cloud infrastructure with global Firebase Edge Hosting CDN and multi-tenant student/staff role segmentation.
                  </p>
                </div>
              </div>

              <div className="grid grid-2 gap-4 mb-4">
                <div className="meta-card">
                  <span className="meta-label">DEPLOYMENT PLATFORM</span>
                  <span className="meta-value">Google Firebase Platform (PaaS)</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">END USER MODEL</span>
                  <span className="meta-value">Campus SaaS Application</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">GLOBAL EDGE CDN</span>
                  <span className="meta-value">Fastly / Cloudflare Edge Points</span>
                </div>
                <div className="meta-card">
                  <span className="meta-label">SSL / HTTPS ENCRYPTION</span>
                  <span className="meta-value">TLS 1.3 Automated Handshake</span>
                </div>
              </div>

              <h4 className="section-title">Firebase PaaS Configuration (`firebase.json`):</h4>
              <pre className="code-block">{`{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=7200" }]
      }
    ]
  }
}`}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
}
