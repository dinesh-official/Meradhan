import { config } from '@config/config';
import nodemailer from 'nodemailer';

export class EmailCommunication {

    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.pass,
            },
        });
    }

    async sendEmail(data: { to: string; subject: string; html?: string; text?: string; from?: string; }): Promise<string> {
        const info = await this.transporter.sendMail({
            from: data.from || `${config.smtp.user}`,
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        });
        return info.messageId;
    }
}