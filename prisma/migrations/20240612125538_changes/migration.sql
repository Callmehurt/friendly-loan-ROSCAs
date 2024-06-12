/*
  Warnings:

  - Made the column `paymentId` on table `contributions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `contributions` MODIFY `paymentId` VARCHAR(191) NOT NULL;
