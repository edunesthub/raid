// src/services/adminAuditService.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Minimal admin audit logging. Records who did what, on which entity, and when.
 *
 * @param {Object} params
 * @param {string} params.adminId - The admin user's ID
 * @param {string} params.action - Action key (e.g., 'tournament_create')
 * @param {string} params.entityType - Entity type (e.g., 'tournament')
 * @param {string} [params.entityId] - Entity ID if applicable
 * @param {Object} [params.details] - Any extra metadata to store
 */
export async function logAdminAction({ adminId, action, entityType, entityId = null, details = {} }) {
  try {
    await addDoc(collection(db, 'admin_audit_logs'), {
      adminId,
      action,
      entityType,
      entityId: entityId || null,
      details: details || {},
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[adminAudit] Failed to log action:', action, err?.message);
  }
}
