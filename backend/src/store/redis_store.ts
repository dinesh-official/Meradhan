import { KeyValueStore } from "./key_value_store";
import { QueueStore } from "./queue_store";

export enum QueueNames {
  emailOtpSend = "emailOTPSendMD",
  welComeEmail = "welcomeEmailMD",
  mobileOtpSend = "mobileOTPSendMD",
  forgotPasswordEmail = "forgotPasswordEmailMD",
  successResetPassword = "successResetPasswordMD",
  kraProcessWork = "kraProcessWorkMD",
  orderSettlement = "orderSettlementMD",
}

// 🔹 Create a shared Redis connection using QueueStore (recommended)
export const sharedConnection = QueueStore.getStore();
// 🔹 Initialize your key-value cache storage
export const cacheStorage = new KeyValueStore(sharedConnection);
