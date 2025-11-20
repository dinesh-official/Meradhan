import { mobileOtpSenderQueue } from "@jobs/queue/worker_queues";

export const sendMobileOtp = async (data: {
  mobile: string;
  otp: string;
  template: "signup" | "login" | "verify";
}) => {
  await mobileOtpSenderQueue.add(
    {
      ...data,
    },
    {
      removeOnComplete: true,
      attempts: 2,
      removeOnFail: true,
    }
  );
};
