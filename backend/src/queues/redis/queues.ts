import { KeyValueStore } from "../services/KeyValueStore";
import { QueueJobService } from "../services/QueueJobService";

export enum QueueNames {
    emailOtpSend = "emailOTPSend"
}

export const cacheStorage = new KeyValueStore()
export const emailOtpSenderQueue = new QueueJobService(QueueNames.emailOtpSend);

