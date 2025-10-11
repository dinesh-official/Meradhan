export interface IEmailSenderGatewayInterface {
    sendEmail(data: { to: string; subject: string; html?: string; text?: string; from?: string; }): Promise<string>;
}
