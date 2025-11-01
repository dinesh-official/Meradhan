import { ParticipantManager } from "@lib/manager/refq/nse/cbrics.manager";

const cb = new ParticipantManager();

cb.getAllParticipants().then((data) => {
  console.log(data);
});
