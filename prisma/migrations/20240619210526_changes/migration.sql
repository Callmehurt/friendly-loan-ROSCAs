-- AlterTable
ALTER TABLE `loans` MODIFY `status` ENUM('pending', 'rejected', 'active', 'completed') NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE `loan_guarantors` ADD CONSTRAINT `loan_guarantors_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
