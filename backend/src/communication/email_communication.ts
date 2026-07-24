import { env } from "@root/config/env";
import nodemailer from "nodemailer";

export class EmailCommunication {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail(data: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    attachments?: nodemailer.SendMailOptions["attachments"];
  }): Promise<string> {
    const info = await this.transporter.sendMail({
      from: data.from || env.SMTP_SENDER,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
      attachments: data.attachments,
    });
    return info.messageId;
  }
}

export const sendBackOfficeEmail = async (data: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: nodemailer.SendMailOptions["attachments"];
}) => {
  const transporter = nodemailer.createTransport({
    host: env.BACKOFFICE_SMTP_HOST,
    port: Number(env.BACKOFFICE_SMTP_PORT),
    secure: false,
    auth: {
      user: env.BACKOFFICE_SMTP_EMAIL,
      pass: env.BACKOFFICE_SMTP_PASS,
    },
  });
  const info = await transporter.sendMail({
    ...data,
    from: data.from || env.BACKOFFICE_SMTP_EMAIL,
  });
  return info.messageId;
};