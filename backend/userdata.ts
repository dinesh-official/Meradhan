// import { revalidateBonds } from "@jobs/cron/scrap_bonds/revalidate_bonds";

import { db } from "@core/database/database";

db.dataBase.nseDataSet.deleteMany({
    where: {
        participant: {
            userId: 142,
        },
    },
}).then(async () => {
    db.dataBase.nseCbricsParticipantModel.deleteMany({
        where: {
            userId: 142,
        },
    }).then(async () => {

    }).then(async () => {
        console.log("Deleted nseRfqParticipantInfoModel");
    }).catch(async (error) => {
        console.error(error);
        console.log("Failed to delete nseRfqParticipantInfoModel");
    });
    console.log("Deleted nseCbricsParticipantModel");
    console.log("Deleted nse DataSet and nseCbricsParticipantModel");
}).catch(async (error) => {
    console.error(error);
    console.log("Failed to delete nseCbricsParticipantModel");
});
