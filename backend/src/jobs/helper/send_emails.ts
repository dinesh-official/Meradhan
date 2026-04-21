const getFormattedTimestamp = (): string => {
  const date = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Convert to IST (UTC + 5:30)
  const utcOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + utcOffsetMs);

  let hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes().toString().padStart(2, "0");
  const seconds = istDate.getUTCSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const day = istDate.getUTCDate().toString().padStart(2, "0");
  const month = months[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();

  return `${day}-${month}-${year} ${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
};

import {
  addBankAccountsClearingCorporationsEmailQueue,
  bankAccountSubmissionReceivedEmailQueue,
  dematAccountSubmissionReceivedEmailQueue,
  kycReminderNotStartedEmailQueue,
  kycApprovedEmailQueue,
  emailAdminOtpSenderQueue,
  emailOtpSenderQueue,
  emailVerificationQueue,
  forgotPasswordLinkSenderQueue,
  kycSubmittedForVerificationEmailQueue,
  rekycOtpSenderQueue,
  successResetPasswordQueue,
  welcomeEmailSenderQueue,
} from "@jobs/queue/worker_queues";

export const sendLoginOtpEmail = async (data: {
  email: string;
  userName: string;
  otp: string;
}) => {
  await emailOtpSenderQueue.add(
    {
      ...data,
      subject: `OTP for Secure Login to MeraDhan - ${getFormattedTimestamp()}`,
      type: "login",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendAdminLoginOtpEmail = async (data: {
  email: string;
  userName: string;
  otp: string;
}) => {
  await emailAdminOtpSenderQueue.add(
    {
      ...data,
      subject: `MeraDhan CRM - Login OTP ${getFormattedTimestamp()}`,
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendRekycConfirmationOtpEmail = async (data: {
  email: string;
  userName: string;
  otp: string;
}) => {
  await rekycOtpSenderQueue.add(
    {
      ...data,
      subject: `MeraDhan CRM - ReKYC Confirmation OTP ${getFormattedTimestamp()}`,
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendCustomerSignupOtpEmail = async (data: {
  email: string;
  userName: string;
  otp: string;
}) => {
  await emailOtpSenderQueue.add(
    {
      ...data,
      subject: `OTP for MeraDhan Signup - ${getFormattedTimestamp()}`,
      type: "signup",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendCustomerEmailChangeOtpEmail = async (data: {
  email: string;
  userName: string;
  otp: string;
}) => {
  await emailOtpSenderQueue.add(
    {
      ...data,
      subject: `OTP to verify your new MeraDhan email - ${getFormattedTimestamp()}`,
      type: "email_change",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendCustomerSigninOtpEmail = async (data: {
  email: string;
  userName: string;
  otp: string;
}) => {
  await emailOtpSenderQueue.add(
    {
      ...data,
      subject: `OTP for Secure Login to MeraDhan - ${getFormattedTimestamp()}`,
      type: "login",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendCustomerWelcomeEmail = async (data: {
  email: string;
  userName: string;
}) => {
  await welcomeEmailSenderQueue.add(
    {
      ...data,
      subject: `Welcome to MeraDhan – Your Journey to Secure Investments Begins!`,
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendForgetPasswordEmail = async (data: {
  email: string;
  userName: string;
  link: string;
}) => {
  await forgotPasswordLinkSenderQueue.add(
    {
      ...data,
      subject: `Reset Your Password – MeraDhan ${getFormattedTimestamp()}`,
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendPasswordResetSuccessEmail = async (data: {
  email: string;
  userName: string;
}) => {
  await successResetPasswordQueue.add(
    {
      ...data,
      subject: `Password Reset Successful – MeraDhan ${getFormattedTimestamp()}`,
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendEmailVerificationLink = async (data: {
  email: string;
  userName: string;
  link: string;
}) => {
  await emailVerificationQueue.add(
    {
      ...data,
      subject: `Verify Your Email – MeraDhan ${getFormattedTimestamp()}`,
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendKycSubmitAddClearingCorporationBankAccountsEmail = async (data: {
  email: string;
  customerName: string;
  /** Optional queue delay in ms (Bull delay). */
  delayMs?: number;
  title?: "Mr." | "Ms.";
}) => {
  await addBankAccountsClearingCorporationsEmailQueue.add(
    {
      ...data,
      subject:
        "Important: Please Add Clearing Corporation Bank Accounts Before Investing",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
      delay: data.delayMs,
    },
  );
};

export const sendKycSubmittedForVerificationEmail = async (data: {
  email: string;
  customerName: string;
  title?: "Mr." | "Ms.";
}) => {
  await kycSubmittedForVerificationEmailQueue.add(
    {
      ...data,
      subject: "KYC Submitted for Verification - MeraDhan",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendBankAccountSubmissionReceivedEmail = async (data: {
  email: string;
  customerName: string;
  title?: "Mr." | "Ms.";
  last4Digits: string;
}) => {
  await bankAccountSubmissionReceivedEmailQueue.add(
    {
      ...data,
      subject: "Bank Account Submission Received - Verification Pending",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendDematAccountSubmissionReceivedEmail = async (data: {
  email: string;
  customerName: string;
  title?: "Mr." | "Ms.";
  dpId: string;
  last4Digits: string;
}) => {
  await dematAccountSubmissionReceivedEmailQueue.add(
    {
      ...data,
      subject: "Demat Account Submission Received – Verification Pending",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};

export const sendKycReminderNotStartedEmail = async (data: {
  customerId: number;
  email: string;
  customerFullName: string;
  title?: "Mr." | "Ms.";
  startKycLink: string;
  /** Optional queue delay in ms (Bull delay). */
  delayMs?: number;
}) => {
  await kycReminderNotStartedEmailQueue.add(
    {
      ...data,
      subject: "Complete Your KYC to Start Investing on MeraDhan",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
      delay: data.delayMs,
    },
  );
};

export const sendKycApprovedEmail = async (data: {
  customerId: number;
  email: string;
  customerFullName: string;
  title?: "Mr." | "Ms.";
  loginLink: string;
}) => {
  await kycApprovedEmailQueue.add(
    {
      ...data,
      subject: "Your KYC Has Been Successfully Verified",
    },
    {
      removeOnComplete: true,
      attempts: 1,
      removeOnFail: true,
    },
  );
};
