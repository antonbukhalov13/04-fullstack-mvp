-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isReadByAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Notification_isReadByAdmin_idx" ON "Notification"("isReadByAdmin");
