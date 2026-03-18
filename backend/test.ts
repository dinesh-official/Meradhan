import { CustomerKycKycService } from "@resource/customer/kyc/kyc_process/customer_kyc.service";

const main = async () => {
  const customerKycService = new CustomerKycKycService();
  const response = await customerKycService.createKraVerifyRequestMock(3, { "pan": "AVEPK6139M", "dob": "30-05-1983" });
  console.log(JSON.stringify(response));
};

main();