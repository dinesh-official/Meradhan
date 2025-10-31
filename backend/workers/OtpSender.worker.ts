import MeraDhanOtpEmail from "@emails/my-email";
import { EmailSenderGateway } from "@lib/gateway/emailsender/emailSender.gateway";
import { MobileOtpSenderGateway } from "@lib/gateway/mobileOtpSender/MobileOtpSender.gateway";
import { render } from "@react-email/render";
import type { Job } from "bull";
import { emailOtpSenderQueue, mobileOtpSenderQueue } from "../src/queues/redis/queues";
import { startQueueWorker } from "./startQueueWorker";

startQueueWorker(emailOtpSenderQueue, async (job: Job) => {
    const emailSend = new EmailSenderGateway()
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
    const mobileSend = new MobileOtpSenderGateway()
    const { mobile, otp, template } = job.data as { mobile: string, otp: string, template: "signup" | "login" | "verify" };
    console.log("Sending SMS - " + mobile);
    await mobileSend.sendMsg91(mobile, otp, template)
})
