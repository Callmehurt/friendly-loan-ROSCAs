import { LoanGuarantors } from "../utils/types";
import { db } from "../utils/db.server";
import { LoanGuarantorStatus } from "../utils/enums";


export class GuarantorService {
    
    //fetch guarantor
    fetchUserGuarantorRequests = async (userId: number): Promise<any> => {
        return await db.loanGuarantors.findMany({
            where: {
                guarantorId: userId,
                status: LoanGuarantorStatus.APPROVED
            },
            include: {
                loan: true
            }
        })
    }
    

}