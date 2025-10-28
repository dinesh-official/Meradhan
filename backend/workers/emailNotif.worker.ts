import MeraDhanWelcomeEmail from "@emails/welcome";
import { EmailSenderGateway } from "@lib/gateway/emailsender/emailSender.gateway";
import { render } from "@react-email/render";
import type { Job } from "bull";
import { welcomeEmailSenderQueue } from "../src/queues/redis/queues";
import { startQueueWorker } from "./startQueueWorker";

startQueueWorker(welcomeEmailSenderQueue, async (job: Job) => {
    const emailSend = new EmailSenderGateway()
    const { email, userName, subject } = job.data;
    console.log("Sending Email - " + email);
    const emailHtml = await render(MeraDhanWelcomeEmail({
        userName
    }));
    await emailSend.sendEmail({
        to: email,
        subject: subject,
        html: emailHtml
    })

})