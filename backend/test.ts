import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import type { AxiosError } from "axios";

const participant = new ParticipantManager();
const main = async () => {
  try {
    const res = await participant.getAllParticipants();
    const cbricsManager = new NseCBRICS();
    await cbricsManager.unregisteredParticipant({
      "loginId": "P0131B",
      "firstName": "PART 131",
      "panNo": "PANNO0131A",
      "custodian": null,
      "contactPerson": "Mr Test",
      "mobileList": ["1231231231"],
      "emailList": ["test@testcompany.com"],
      "telephone": "1231231231",
      "address": "Test line 1",
      "address2": "Test line 2",
      "address3": "Test line 3",
      "stateCode": "16",
      "regAddress": "Test registered address",
      "leiCode": null,
      "expiryDate": null,
      "bankAccountList": [
        {
          "status": "A",
          "bankName": "HDFC",
          "bankIFSC": "HDFC1231221",
          "bankAccountNo": "123412312",
          "isDefault": "Y"
        }
      ],
      "dpAccountList": [
        {
          "status": "A",
          "dpType": "NSDL",
          "dpId": "IN234234",
          "benId": "29347239",
          "isDefault": "Y"
        }
      ],
      "dobDoi": "17-12-1996",
    });
    console.log(res);
  } catch (error) {
    console.log((error as AxiosError)?.response?.data);
  }
};

main();