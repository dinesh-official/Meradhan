import userDataDb, { Prisma as DataBaseSchema } from '@databases/postgress/generated/prisma';
const dataBase = new userDataDb.PrismaClient();

// Export all databases here
export const db = {
    dataBase,
};

type DataBase = typeof dataBase;

export type {
    DataBaseSchema,
    DataBase
};

// Function to connect to all databases and log the status
export const checkConnectToDatabases = async () => {
    disconnectFromDatabases().then(async () => {
        const dbList = Object.entries(db);

        console.log(`Connecting to ${dbList.length} databases...`);
        console.log(dbList.map(([name]) => `- ${name}`).join('\n'));
        for (const [name, client] of dbList) {
            try {
                await client.$connect();
                console.log(`✅ Connected to ${name} database`);
            } catch (error) {
                console.error(`❌ Failed to connect to ${name} database:`, error);
                throw error; // Exit if any database connection fails
            }
        }
    });
}

// Function to disconnect from all databases
export const disconnectFromDatabases = async () => {
    const dbList = Object.entries(db);
    for (const [name, client] of dbList) {
        try {
            await client.$disconnect();
        } catch (error) {
            console.error(`❌ Failed to disconnect from ${name} database:`, error);
        }
    }
}


export *  from  '@databases/postgress/generated/prisma';
