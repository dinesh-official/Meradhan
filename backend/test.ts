import { CustomerKycManager } from "@services/customer/kyc/customer_kyc_manager.service";

const kycManager = new CustomerKycManager();
await kycManager.saveKycToCustomer(Number(45));
