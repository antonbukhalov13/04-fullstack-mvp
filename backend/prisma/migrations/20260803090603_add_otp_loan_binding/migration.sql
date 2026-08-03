-- DropIndex
DROP INDEX "Application_companyName_idx";

-- DropIndex
DROP INDEX "Application_firstName_idx";

-- DropIndex
DROP INDEX "Application_lastName_idx";

-- DropIndex
DROP INDEX "User_name_idx";

-- DropIndex
DROP INDEX "User_phone_idx";

-- AlterTable
ALTER TABLE "AdminUser" ALTER COLUMN "role" DROP DEFAULT;

-- AlterTable
ALTER TABLE "FileAttachment" ALTER COLUMN "ownerType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "loanId" TEXT,
ALTER COLUMN "purpose" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "FileAttachment_ownerType_ownerId_idx" ON "FileAttachment"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX "OtpCode_phone_purpose_idx" ON "OtpCode"("phone", "purpose");

-- CreateIndex
CREATE INDEX "OtpCode_loanId_idx" ON "OtpCode"("loanId");

-- CreateIndex
CREATE INDEX "PaymentRequest_status_idx" ON "PaymentRequest"("status");

-- CreateIndex
CREATE INDEX "PaymentScheduleItem_status_idx" ON "PaymentScheduleItem"("status");

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
