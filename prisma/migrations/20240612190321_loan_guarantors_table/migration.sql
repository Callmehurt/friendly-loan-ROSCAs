-- CreateTable
CREATE TABLE `loan_guarantors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loanId` INTEGER NOT NULL,
    `guarantorId` INTEGER NOT NULL,
    `status` ENUM('requested', 'approved', 'rejected') NOT NULL DEFAULT 'requested',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loan_guarantors_loanId_guarantorId_key`(`loanId`, `guarantorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `loan_guarantors` ADD CONSTRAINT `loan_guarantors_guarantorId_fkey` FOREIGN KEY (`guarantorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
