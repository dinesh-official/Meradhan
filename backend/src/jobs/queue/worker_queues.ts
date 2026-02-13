import { QueueNames, sharedConnection } from "@store/redis_store";
import Bull from "bull";

// 🔹 Reuse shared Redis clients across all queues
const sharedRedisOpts = {
  createClient: (type: string) => {
    switch (type) {
      case "client":
        return sharedConnection.getInstance().duplicate();
      case "subscriber":
        return sharedConnection.getInstance().duplicate();
      default:
        return sharedConnection.getInstance().duplicate();
    }
  },
};

// 🔹 Initialize all queues using shared redis connections
export const welcomeEmailSenderQueue = new Bull(
  QueueNames.welComeEmail,
  sharedRedisOpts,
);
export const emailOtpSenderQueue = new Bull(
  QueueNames.emailOtpSend,
  sharedRedisOpts,
);
export const emailAdminOtpSenderQueue = new Bull(
  QueueNames.emailAdminOtpSend,
  sharedRedisOpts,
);

export const rekycOtpSenderQueue = new Bull(
  QueueNames.rekycOtpSend,
  sharedRedisOpts,
);
export const mobileOtpSenderQueue = new Bull(
  QueueNames.mobileOtpSend,
  sharedRedisOpts,
);
export const forgotPasswordLinkSenderQueue = new Bull(
  QueueNames.forgotPasswordEmail,
  sharedRedisOpts,
);
export const successResetPasswordQueue = new Bull(
  QueueNames.successResetPassword,
  sharedRedisOpts,
);
export const emailVerificationQueue = new Bull(
  QueueNames.emailVerification,
  sharedRedisOpts,
);

export const kraWorkerQueue = new Bull(
  QueueNames.kraProcessWork,
  sharedRedisOpts,
);

export const orderSettlementQueue = new Bull(
  QueueNames.orderSettlement,
  sharedRedisOpts,
);

export const profileSubmitSettlementQueue = new Bull(
  QueueNames.submitProfileCompleat,
  sharedRedisOpts,
);
