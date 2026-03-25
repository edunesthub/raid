// src/services/adminAuditService.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AuditAction {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
}

export async function logAdminAction({ adminId, action, entityType, entityId = null, details = {} }: AuditAction) {
  try {
    const auditRef = collection(db, 'admin_audit_logs');
    await addDoc(auditRef, {
      adminId,
      action,
      entityType,
      entityId,
      details,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (err: any) {
    console.warn('[adminAudit] Failed to log action:', action, err?.message);
    return false;
  }
}
