import { meraDhanOtpEmailText } from "@emails/text/meraDhanOtpEmailText";
import type { Job } from "bull";
import { EmailCommunication } from "../communication/email_communication";
import { SMSCommunication } from "../communication/sms_communication";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import {
  emailAdminOtpSenderQueue,
  emailOtpSenderQueue,
  mobileOtpSenderQueue,
  rekycOtpSenderQueue,
} from "./queue/worker_queues";
import { render } from "@react-email/components";
import MeraDhanOtpEmail from "@emails/crm_login_otp_email";
import RekycConfirmationOtpEmail from "@emails/rekyc_confirmation_otp_email";
import { meraDhanOtpEmailTextLogin } from "@emails/text/meraDhanOtpEmailTextLogin";
import { meraDhanOtpEmailTextSignup } from "@emails/text/meraDhanOtpEmailTextSignup";
import { meraDhanRekycOtpEmailText } from "@emails/text/meraDhanRekycOtpEmailText";

startQueueWorker(emailOtpSenderQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, userName, subject, otp, type } = job.data;
  console.log("Sending Email - " + email);
  // const emailHtml = await render(
  //   MeraDhanOtpEmail({
  //     otpCode: otp,
  //     userName,
  //   })
  // );
  if (type == "login") {
    await emailSend.sendEmail({
      to: email,
      subject: subject,
      text: meraDhanOtpEmailTextLogin({ userName, otpCode: otp }),
    });
    return;
  }
  if (type == "signup") {
    await emailSend.sendEmail({
      to: email,
      subject: subject,
      text: meraDhanOtpEmailTextSignup({ userName, otpCode: otp }),
    });
    return;
  }

  await emailSend.sendEmail({
    to: email,
    subject: subject,
    text: meraDhanOtpEmailText({ userName, otpCode: otp }),
  });
});

startQueueWorker(emailAdminOtpSenderQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, userName, subject, otp } = job.data;
  console.log("Sending Email - " + email);
  const emailHtml = await render(
    MeraDhanOtpEmail({
      otpCode: otp,
      userName,
    }),
  );

  await emailSend.sendEmail({
    to: email,
    subject: subject,
    text: emailHtml,
  });
});

startQueueWorker(rekycOtpSenderQueue, async (job: Job) => {
  const emailSend = new EmailCommunication();
  const { email, userName, subject, otp } = job.data as {
    email: string;
    userName: string;
    subject: string;
    otp: string;
  };
  console.log("Sending ReKYC OTP Email - " + email);
  const emailHtml = await render(
    RekycConfirmationOtpEmail({
      otpCode: otp,
      userName,
    }),
  );
  await emailSend.sendEmail({
    to: email,
    subject: subject,
    html: emailHtml,
    text: meraDhanRekycOtpEmailText({ userName, otpCode: otp }),
  });
});

startQueueWorker(mobileOtpSenderQueue, async (job: Job) => {
  const mobileSend = new SMSCommunication();
  const { mobile, otp, template } = job.data as {
    mobile: string;
    otp: string;
    template: "signup" | "login" | "verify";
  };
  console.log("Sending SMS - " + mobile);
  await mobileSend.sendMsg91(mobile, otp, template);
});
