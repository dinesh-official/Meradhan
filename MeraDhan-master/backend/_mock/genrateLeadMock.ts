import { db } from '@core/database/database';
import { faker } from '@faker-js/faker';

const generateMockLead = async () => {
  await db.dataBase.leadsModel.create({
    data: {
      fullName: faker.person.fullName(),
      bondType: faker.helpers.arrayElement(['CORPORATE', 'GOVERNMENT']),
      companyName: faker.company.name(),
      emailAddress: faker.internet.email(),
      leadSource: faker.helpers.arrayElement([
        'WEBSITE',
        'REFERRAL',
        'SOCIAL',
        'ADVERTISEMENT',
        'EVENT',
        'COLD_CALL',
        'EMAIL',
        'OTHER',
      ]),
      phoneNo: faker.phone.number(),
      status: faker.helpers.arrayElement(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED']),
      exInvestmentAmount: faker.number.int({ min: 5000, max: 100000 }),
      note: faker.lorem.sentence(),
      createdBy: 5,
    },
  });
};

export const createFakeLeadData = async (count: number = 100) => {
  try {
    // ✅ Connect Prisma client before use
    await db.dataBase.$connect();

    for (let i = 0; i < count; i++) {
      await generateMockLead();
      console.log(`✅ Created fake lead ${i + 1}/${count}`);
    }

    console.log('🎉 Fake leads creation completed.');
  } catch (error) {
    console.error('❌ Error creating fake leads:', error);
    throw error;
  } finally {
    // ✅ Always disconnect

  }
};

