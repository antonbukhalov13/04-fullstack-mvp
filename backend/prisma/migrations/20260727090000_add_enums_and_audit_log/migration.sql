-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('new', 'in_progress', 'approved', 'rejected');
CREATE TYPE "LoanStatus" AS ENUM ('pending_signature', 'active', 'closed', 'overdue', 'default');
CREATE TYPE "ScheduleItemStatus" AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE "PaymentRequestStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "OtpPurpose" AS ENUM ('login', 'sign_loan');
CREATE TYPE "AdminRole" AS ENUM ('admin', 'operator');
CREATE TYPE "FileOwnerType" AS ENUM ('application', 'contact_message', 'upload');

-- Application.status: String -> ApplicationStatus
ALTER TABLE "Application" ADD COLUMN "status_new" "ApplicationStatus" NOT NULL DEFAULT 'new';
UPDATE "Application" SET "status_new" = "status"::"ApplicationStatus";
ALTER TABLE "Application" DROP COLUMN "status";
ALTER TABLE "Application" RENAME COLUMN "status_new" TO "status";

-- Loan.status: String -> LoanStatus
ALTER TABLE "Loan" ADD COLUMN "status_new" "LoanStatus" NOT NULL DEFAULT 'pending_signature';
UPDATE "Loan" SET "status_new" = "status"::"LoanStatus";
ALTER TABLE "Loan" DROP COLUMN "status";
ALTER TABLE "Loan" RENAME COLUMN "status_new" TO "status";

-- PaymentScheduleItem.status: String -> ScheduleItemStatus
ALTER TABLE "PaymentScheduleItem" ADD COLUMN "status_new" "ScheduleItemStatus" NOT NULL DEFAULT 'pending';
UPDATE "PaymentScheduleItem" SET "status_new" = "status"::"ScheduleItemStatus";
ALTER TABLE "PaymentScheduleItem" DROP COLUMN "status";
ALTER TABLE "PaymentScheduleItem" RENAME COLUMN "status_new" TO "status";

-- PaymentRequest.status: String -> PaymentRequestStatus
ALTER TABLE "PaymentRequest" ADD COLUMN "status_new" "PaymentRequestStatus" NOT NULL DEFAULT 'pending';
UPDATE "PaymentRequest" SET "status_new" = "status"::"PaymentRequestStatus";
ALTER TABLE "PaymentRequest" DROP COLUMN "status";
ALTER TABLE "PaymentRequest" RENAME COLUMN "status_new" TO "status";

-- OtpCode.purpose: String -> OtpPurpose (handle 'sign-loan' -> 'sign_loan')
ALTER TABLE "OtpCode" ADD COLUMN "purpose_new" "OtpPurpose" NOT NULL DEFAULT 'login';
UPDATE "OtpCode" SET "purpose_new" = CASE WHEN "purpose" = 'sign-loan' THEN 'sign_loan' ELSE "purpose"::"OtpPurpose" END;
ALTER TABLE "OtpCode" DROP COLUMN "purpose";
ALTER TABLE "OtpCode" RENAME COLUMN "purpose_new" TO "purpose";

-- AdminUser.role: String -> AdminRole
ALTER TABLE "AdminUser" ADD COLUMN "role_new" "AdminRole" NOT NULL DEFAULT 'operator';
UPDATE "AdminUser" SET "role_new" = "role"::"AdminRole";
ALTER TABLE "AdminUser" DROP COLUMN "role";
ALTER TABLE "AdminUser" RENAME COLUMN "role_new" TO "role";

-- FileAttachment.ownerType: String -> FileOwnerType
ALTER TABLE "FileAttachment" ADD COLUMN "ownerType_new" "FileOwnerType" NOT NULL DEFAULT 'upload';
UPDATE "FileAttachment" SET "ownerType_new" = "ownerType"::"FileOwnerType";
ALTER TABLE "FileAttachment" DROP COLUMN "ownerType";
ALTER TABLE "FileAttachment" RENAME COLUMN "ownerType_new" TO "ownerType";

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "actorId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
