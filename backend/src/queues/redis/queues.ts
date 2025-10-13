import { KeyValueStore } from "../services/KeyValueStore";
import { QueueJobService } from "../services/QueueJobService";

export enum QueueNames {
    emailSendQueue = "emailSendQueue"
}

export const cacheStorage = new KeyValueStore()
export const emailSenderQueue = new QueueJobService(QueueNames.emailSendQueue);

