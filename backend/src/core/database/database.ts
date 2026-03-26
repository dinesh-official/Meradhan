import userDataDb, {
  Prisma as DataBaseSchema,
} from "@databases/generated/prisma/postgres";
import logger from "@utils/logger/logger";
const dataBase = new userDataDb.PrismaClient();

// Export all databases here
export const db = {
  dataBase,
};

type DataBase = typeof dataBase;

export type { DataBaseSchema, DataBase };

// Function to connect to all databases and log the status
export const checkConnectToDatabases = async () => {
  disconnectFromDatabases().then(async () => {
    const dbList = Object.entries(db);

    logger.logInfo(`Connecting to ${dbList.length} databases...`);
    logger.logInfo(dbList.map(([name]) => `- ${name}`).join("\n"));
    for (const [name, client] of dbList) {
      try {
        await client.$connect();
        logger.logInfo(`✅ Connected to ${name} database`);
      } catch (error) {
        logger.logError(`❌ Failed to connect to ${name} database:`, error);
        throw error; // Exit if any database connection fails
      }
    }
  });
};

// Function to disconnect from all databases
export const disconnectFromDatabases = async () => {
  const dbList = Object.entries(db);
  for (const [name, client] of dbList) {
    try {
      await client.$disconnect();
    } catch (error) {
      logger.logError(`❌ Failed to disconnect from ${name} database:`, error);
    }
  }
};

export * from "@databases/generated/prisma/postgres";
