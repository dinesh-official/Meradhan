import { meraDhanEmailVerificationEmailText } from "@emails/text/meraDhanEmailVerificationEmailText";
import { meraDhanForgotPasswordEmailText } from "@emails/text/meraDhanForgotPasswordEmailText";
import { meraDhanPasswordResetSuccessEmailText } from "@emails/text/meraDhanPasswordResetSuccessEmailText";
import { meraDhanWelcomeEmailText } from "@emails/text/meraDhanWelcomeEmailText";
import { meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText } from "@emails/text/meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText";
import { meraDhanKycSubmittedForVerificationEmailText } from "@emails/text/meraDhanKycSubmittedForVerificationEmailText";
import type { Job } from "bull";
import { EmailCommunication } from "../communication/email_communication";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import {
  addBankAccountsClearingCorporationsEmailQueue,
  emailVerificationQueue,
  forgotPasswordLinkSenderQueue,
  kycSubmittedForVerificationEmailQueue,
  successResetPasswordQueue,
  welcomeEmailSenderQueue,
} from "./queue/worker_queues";

startQueueWorker(welcomeEmailSenderQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, userName, subject } = job.data;
  // const emailHtml = await render(
  //   MeraDhanWelcomeEmail({
  //     userName,
  //   })
  // );
  await emailSend.sendEmail({
    to: email,
    subject: subject,
    // html: emailHtml,
    html: meraDhanWelcomeEmailText({ userName }),
  });
});

startQueueWorker(forgotPasswordLinkSenderQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { userName, link, email, subject } = job.data as {
    email: string;
    userName: string;
    link: string;
    subject: string;
  };

  // const emailHtml = await render(
  //   MeraDhanForgotPasswordEmail({
  //     userName,
  //     resetLink: link,
  //   })
  // );
  await emailSend.sendEmail({
    to: email,
    subject: subject,
    html: meraDhanForgotPasswordEmailText({ userName, resetLink: link }),
  });
});

startQueueWorker(successResetPasswordQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, userName, subject } = job.data;

  // const emailHtml = await render(
  //   MeraDhanPasswordResetSuccessEmail({
  //     userName,
  //   })
  // );
  await emailSend.sendEmail({
    to: email,
    subject: subject,
    html: meraDhanPasswordResetSuccessEmailText({ userName }),
  });
});

startQueueWorker(emailVerificationQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { userName, link, email, subject } = job.data as {
    email: string;
    userName: string;
    link: string;
    subject: string;
  };
  // const emailHtml = await render(
  //   MeraDhanEmailVerificationEmail({
  //     userName,
  //     verificationLink: link,
  //   })
  // );
  await emailSend.sendEmail({
    to: email,
    subject: subject,
    html: meraDhanEmailVerificationEmailText({
      userName,
      verificationLink: link,
    }),
  });
});

startQueueWorker(addBankAccountsClearingCorporationsEmailQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, customerName, subject } = job.data as {
    email: string;
    customerName: string;
    subject: string;
  };
  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText({
      customerName,
    }),
  });
});

startQueueWorker(kycSubmittedForVerificationEmailQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, customerName, title, subject } = job.data as {
    email: string;
    customerName: string;
    title?: "Mr." | "Ms.";
    subject: string;
  };
  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanKycSubmittedForVerificationEmailText({ customerName, title }),
  });
});
