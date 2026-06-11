ALTER TABLE "Homework"
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentMimeType" TEXT,
ADD COLUMN "attachmentSize" INTEGER,
ADD COLUMN "attachmentData" BYTEA;

ALTER TABLE "HomeworkSubmit"
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentMimeType" TEXT,
ADD COLUMN "attachmentSize" INTEGER,
ADD COLUMN "attachmentData" BYTEA;
