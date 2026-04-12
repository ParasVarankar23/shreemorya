import { connectDB } from "@/lib/db";
import AuditLog from "@/models/audit-log.model";

/**
 * Create audit log entry
 *
 * Normalized fields follow AuditLog schema (userId, userRole, ...).
 */
export async function createAuditLog({
    userId = null,
    userRole = "",
    action,
    entityType,
    entityId = null,
    entityCode = "",
    message = "",
    oldValues = null,
    newValues = null,
    metadata = null,
    ipAddress = "",
    userAgent = "",
    status = "SUCCESS",
    errorMessage = "",
}) {
    await connectDB();

    return AuditLog.create({
        userId,
        userRole,
        action,
        entityType,
        entityId,
        entityCode,
        message,
        oldValues,
        newValues,
        metadata,
        ipAddress,
        userAgent,
        status,
        errorMessage,
    });
}

// Allow both default and named import styles
export default createAuditLog;