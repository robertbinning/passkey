/*
  Warnings:

  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "session";

-- CreateTable
CREATE TABLE "Session" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sid")
);
