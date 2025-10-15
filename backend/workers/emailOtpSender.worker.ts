import MeraDhanOtpEmail from "@emails/my-email";
import { EmailSenderGateway } from "@lib/gateway/emailsender/emailSender.gateway";
import { render } from "@react-email/render";
import type { Job } from "bullmq";
import { QueueNames } from "../src/queues/redis/queues";
import { startQueueWorker } from "./startQueueWorker";


startQueueWorker(QueueNames.emailOtpSend, async (job: Job) => {
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