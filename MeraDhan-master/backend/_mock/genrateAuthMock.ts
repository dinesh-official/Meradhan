import { db } from '@core/database/database';
import { faker } from '@faker-js/faker';

const generateMockUser = async () => {
    await db.dataBase.cRMUserDataModel.create({
        data: {
            email: faker.internet.email(),
            name: faker.person.fullName(),
            role: 'ADMIN',
            phoneNo: "124567890",
            
        },
    });
};

export const createFakeUserAccounts = async (count: number = 100) => {
    try {
        for (let i = 0; i < count; i++) {
            await generateMockUser();
            console.log(i);
            
        }
    } catch (error) {
        console.error('Error creating fake users:', error);
        throw error;
    }
};
