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
  emailAdminOtpSenderQueue,
  emailOtpSenderQueue,
  emailVerificationQueue,
  forgotPasswordLinkSenderQueue,
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
