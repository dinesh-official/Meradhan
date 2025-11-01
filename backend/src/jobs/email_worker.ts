import MeraDhanForgotPasswordEmail from "@emails/forgot-password";
import MeraDhanPasswordResetSuccessEmail from "@emails/reset-password-sucess";
import MeraDhanWelcomeEmail from "@emails/welcome";
import { render } from "@react-email/render";
import type { Job } from "bull";
import { EmailSenderGateway } from "../communication/email_communication";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import { forgotPasswordLinkSenderQueue, successResetPasswordQueue, welcomeEmailSenderQueue } from "./queue/worker_queues";

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


startQueueWorker(forgotPasswordLinkSenderQueue, async (job: Job) => {
    const emailSend = new EmailSenderGateway()
    const { userName, link, email, subject } = job.data as { email: string, userName: string, link: string, subject: string };
    console.log("Sending Email - " + email);
    const emailHtml = await render(MeraDhanForgotPasswordEmail({
        userName,
        resetLink: link,
    }));
    await emailSend.sendEmail({
        to: email,
        subject: subject,
        html: emailHtml
    })
})



startQueueWorker(successResetPasswordQueue, async (job: Job) => {
    const emailSend = new EmailSenderGateway()
    const { email, userName, subject } = job.data;
    console.log("Sending Email - " + email);
    const emailHtml = await render(MeraDhanPasswordResetSuccessEmail({
        userName
    }));
    await emailSend.sendEmail({
        to: email,
        subject: subject,
        html: emailHtml
    })
})