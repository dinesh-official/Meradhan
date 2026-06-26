import { meraDhanEmailVerificationEmailText } from "@emails/text/meraDhanEmailVerificationEmailText";
import { meraDhanWelcomeEmailText } from "@emails/text/meraDhanWelcomeEmailText";
import { meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText } from "@emails/text/meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText";
import { meraDhanKycSubmittedForVerificationEmailText } from "@emails/text/meraDhanKycSubmittedForVerificationEmailText";
import { meraDhanBankAccountSubmissionReceivedEmailText } from "@emails/text/meraDhanBankAccountSubmissionReceivedEmailText";
import { meraDhanDematAccountSubmissionReceivedEmailText } from "@emails/text/meraDhanDematAccountSubmissionReceivedEmailText";
import { meraDhanKycReminderNotStartedEmailText } from "@emails/text/meraDhanKycReminderNotStartedEmailText";
import { meraDhanKycApprovedEmailText } from "@emails/text/meraDhanKycApprovedEmailText";
import type { Job } from "bull";
import { EmailCommunication } from "../communication/email_communication";
import { db } from "@core/database/database";
import fs from "node:fs";
import path from "node:path";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import {
  addBankAccountsClearingCorporationsEmailQueue,
  bankAccountSubmissionReceivedEmailQueue,
  dematAccountSubmissionReceivedEmailQueue,
  kycReminderNotStartedEmailQueue,
  kycApprovedEmailQueue,
  emailVerificationQueue,
  kycSubmittedForVerificationEmailQueue,
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
  const { email, customerName, title, subject } = job.data as {
    email: string;
    customerName: string;
    title?: "Mr." | "Ms.";
    subject: string;
  };
  const attachmentPath = path.resolve(
    process.cwd(),
    "backend/public/documents/NCL-bank-accounts-for-payee-addition.pdf",
  );
  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanKycSubmitAddClearingCorporationBankAccountsEmailText({ customerName, title }),
    attachments: fs.existsSync(attachmentPath)
      ? [
        {
          filename: "NCL-bank-accounts-for-payee-addition.pdf",
          content: fs.readFileSync(attachmentPath),
          contentType: "application/pdf",
        },
      ]
      : undefined,
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

startQueueWorker(bankAccountSubmissionReceivedEmailQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, customerName, title, last4Digits, subject } = job.data as {
    email: string;
    customerName: string;
    title?: "Mr." | "Ms.";
    last4Digits: string;
    subject: string;
  };
  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanBankAccountSubmissionReceivedEmailText({
      customerName,
      title,
      last4Digits,
    }),
  });
});

startQueueWorker(dematAccountSubmissionReceivedEmailQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, customerName, title, dpId, last4Digits, subject } = job.data as {
    email: string;
    customerName: string;
    title?: "Mr." | "Ms.";
    dpId: string;
    last4Digits: string;
    subject: string;
  };
  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanDematAccountSubmissionReceivedEmailText({
      customerName,
      title,
      dpId,
      last4Digits,
    }),
  });
});

startQueueWorker(kycReminderNotStartedEmailQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const {
    customerId,
    email,
    customerFullName,
    title,
    startKycLink,
    subject,
  } = job.data as {
    customerId: number;
    email: string;
    customerFullName: string;
    title?: "Mr." | "Ms.";
    startKycLink: string;
    subject: string;
  };

  // Send only if KYC not started: no active kyc_flow row and customer still not in-progress/verified.
  const customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { id: Number(customerId) },
    select: { kycStatus: true },
  });
  if (!customer) return;

  const hasActiveFlow = await db.dataBase.kYC_FLOW.findFirst({
    where: { userID: Number(customerId) },
    select: { id: true },
  });

  const status = String(customer.kycStatus ?? "").toUpperCase();
  const kycStartedByStatus =
    status === "UNDER_REVIEW" || status === "VERIFIED" || status === "RE_KYC";

  if (hasActiveFlow || kycStartedByStatus) return;

  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanKycReminderNotStartedEmailText({
      customerFullName,
      title,
      startKycLink,
      supportEmail: "support@meradhan.co",
    }),
  });
});

startQueueWorker(kycApprovedEmailQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, customerFullName, title, loginLink, subject } = job.data as {
    email: string;
    customerFullName: string;
    title?: "Mr." | "Ms.";
    loginLink: string;
    subject: string;
  };
  await emailSend.sendEmail({
    to: email,
    subject,
    html: meraDhanKycApprovedEmailText({
      customerFullName,
      title,
      loginLink,
      supportEmail: "support@meradhan.co",
    }),
  });
});
