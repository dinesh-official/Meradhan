import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";

// Initialize
const kycManager = new ParticipantManager();

// Save KYC data to customer
const data = await kycManager.getAllParticipants();

console.log(data);

