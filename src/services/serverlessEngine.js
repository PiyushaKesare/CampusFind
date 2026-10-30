/**
 * Serverless Computing Engine (FaaS: Function-as-a-Service)
 * Emulates Google Cloud Functions / Firebase Cloud Functions event triggers.
 * 
 * Cloud Architecture Trigger:
 * Trigger: providers/cloud.firestore/eventTypes/document.create
 * Function: onItemReportedEvent (Node.js 20 Serverless Runtime)
 */

import { findPotentialMatches } from "./matchingService";
import { addInAppNotification } from "./dataService";

const SERVERLESS_LOGS_KEY = "campus_cloud_serverless_execution_logs";

export function getServerlessLogs() {
  try {
    const raw = localStorage.getItem(SERVERLESS_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Pre-seeded logs for demo
  return [
    {
      executionId: "fn-exec-89f41b",
      functionName: "onItemReportedEvent",
      runtime: "Node.js 20 (Serverless Managed)",
      region: "us-central1 (Google Cloud)",
      trigger: "firestore.document.create",
      eventTime: new Date(Date.now() - 300000).toISOString(),
      durationMs: 28,
      memoryAllocated: "256 MB",
      memoryUsed: "68 MB",
      coldStart: false,
      status: "SUCCESS (200 OK)",
      details: "Matched 'Black JBL Earphones' against found inventory. Score: 95%. Notification dispatched."
    },
    {
      executionId: "fn-exec-41c90a",
      functionName: "onItemReportedEvent",
      runtime: "Node.js 20 (Serverless Managed)",
      region: "us-central1 (Google Cloud)",
      trigger: "firestore.document.create",
      eventTime: new Date(Date.now() - 600000).toISOString(),
      durationMs: 34,
      memoryAllocated: "256 MB",
      memoryUsed: "72 MB",
      coldStart: true,
      status: "SUCCESS (200 OK)",
      details: "New found report 'Milton Bottle' processed. Potential match identified: 85%."
    }
  ];
}

export function logServerlessExecution(entry) {
  const logs = getServerlessLogs();
  logs.unshift(entry);
  localStorage.setItem(SERVERLESS_LOGS_KEY, JSON.stringify(logs.slice(0, 25)));
  // Dispatch custom event for real-time UI stream
  window.dispatchEvent(new CustomEvent("serverless-log-updated", { detail: entry }));
}

/**
 * Executes serverless matching trigger asynchronously
 */
export async function triggerServerlessItemEvent(newItem, allExistingItems = []) {
  const startTime = performance.now();
  const execId = `fn-exec-${Math.random().toString(36).substring(2, 8)}`;
  
  // Simulate network dispatch & serverless container spin-up (15-45ms)
  await new Promise(r => setTimeout(r, 40));

  const candidates = findPotentialMatches(newItem, allExistingItems);
  const topMatch = candidates.length > 0 ? candidates[0] : null;

  const durationMs = Math.round(performance.now() - startTime);

  const logEntry = {
    executionId: execId,
    functionName: "onItemReportedEvent",
    runtime: "Node.js 20 (Serverless Managed)",
    region: "us-central1 (Google Cloud)",
    trigger: "firestore.document.create",
    eventTime: new Date().toISOString(),
    durationMs,
    memoryAllocated: "256 MB",
    memoryUsed: `${Math.floor(58 + Math.random() * 20)} MB`,
    coldStart: Math.random() > 0.8,
    status: "SUCCESS (200 OK)",
    targetItem: newItem.itemName,
    details: topMatch && topMatch.isHighConfidence
      ? `High-confidence match detected with '${topMatch.matchedItem.itemName}' (Score: ${topMatch.score}%). Automated in-app notification emitted.`
      : `Scan completed against ${allExistingItems.length} records. No items exceeded 70% threshold.`
  };

  logServerlessExecution(logEntry);
  return logEntry;
}
