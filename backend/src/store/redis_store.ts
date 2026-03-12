import { KeyValueStore } from "./key_value_store";
import { QueueStore } from "./queue_store";

export enum QueueNames {
  emailOtpSend = "emailOTPSendMD",
  emailAdminOtpSend = "emailOTPSendMDAdmin",
  welComeEmail = "welcomeEmailMD",
  mobileOtpSend = "mobileOTPSendMD",
  forgotPasswordEmail = "forgotPasswordEmailMD",
  successResetPassword = "successResetPasswordMD",
  emailVerification = "emailVerificationMD",
  kraProcessWork = "kraProcessWorkMD",
  orderSettlement = "orderOrderSettlementMD",
  submitProfileCompleat = "submitProfileMD",
  rekycOtpSend = "rekycOtpSendMD",
}

// 🔹 Create a shared Redis connection using QueueStore (recommended)
export const sharedConnection = QueueStore.getStore();
// 🔹 Initialize your key-value cache storage
export const cacheStorage = new KeyValueStore(sharedConnection);
