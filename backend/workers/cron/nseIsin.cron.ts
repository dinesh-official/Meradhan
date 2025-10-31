import { NseRfqManager } from '@lib/manager/refq/nse/nseisin.manager';

import cron from 'node-cron';
import { revalidateBonds } from './scrap_bonds/revalidateBonds';

// Schedule to run every day at 8:00 AM and 8:00 PM
cron.schedule('0 8,20 * * *', async () => {
    try {
        console.log('Running task at 8:00 AM and 8:00 PM every day');
        const isinManger = new NseRfqManager();
        await isinManger.syneIsinDB();
    } catch (error) {
        console.error(error);
    }
});


// Schedule to run every day at 11:00 AM
cron.schedule('0 11 * * *', async () => {
    try {
        console.log('Running task at 11:00 AM every day');
        await revalidateBonds();

    } catch (error) {
        console.error(error);
    }
});