import MeraDhanOtpEmail from "@emails/crm_login_otp_email";
import { EmailCommunication } from "../communication/email_communication";
import { SMSCommunication } from "../communication/sms_communication";
import { render } from "@react-email/render";
import type { Job } from "bull";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import { emailOtpSenderQueue, mobileOtpSenderQueue } from "./queue/worker_queues";

startQueueWorker(emailOtpSenderQueue, async (job: Job) => {
    const emailSend = new EmailCommunication()
    const { email, userName, subject, otp } = job.data;
    console.log("Sending Email - " + email);
    const emailHtml = await render(MeraDhanOtpEmail({
        otpCode: otp,
        userName
    }));
    
    await emailSend.sendEmail({
        to: email,
        subject: subject,
        html: emailHtml
    })

    
})

startQueueWorker(mobileOtpSenderQueue, async (job: Job) => {
    const mobileSend = new SMSCommunication()
    const { mobile, otp, template } = job.data as { mobile: string, otp: string, template: "signup" | "login" | "verify" };
    console.log("Sending SMS - " + mobile);
    await mobileSend.sendMsg91(mobile, otp, template)
})
