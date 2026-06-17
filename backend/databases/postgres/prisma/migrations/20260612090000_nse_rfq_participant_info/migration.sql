-- CreateTable
CREATE TABLE "nse_rfq_participant_info" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "nameOverride" TEXT,
    "contactPerson" TEXT,
    "emailList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mobileList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "telephone" TEXT,
    "address" TEXT,
    "address2" TEXT,
    "address3" TEXT,
    "stateCode" TEXT,
    "panNo" TEXT,
    "leiCode" TEXT,
    "custodian" TEXT,
    "dobDoi" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nse_rfq_participant_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nse_rfq_participant_bank_account" (
    "id" SERIAL NOT NULL,
    "participantInfoId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankIFSC" TEXT NOT NULL,
    "bankAccountNo" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nse_rfq_participant_bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nse_rfq_participant_dp_account" (
    "id" SERIAL NOT NULL,
    "participantInfoId" INTEGER NOT NULL,
    "dpType" "DepositoryName" NOT NULL,
    "dpId" TEXT,
    "benId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nse_rfq_participant_dp_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nse_rfq_participant_info_code_key" ON "nse_rfq_participant_info"("code");

-- CreateIndex
CREATE INDEX "nse_rfq_participant_bank_account_participantInfoId_idx" ON "nse_rfq_participant_bank_account"("participantInfoId");

-- CreateIndex
CREATE INDEX "nse_rfq_participant_dp_account_participantInfoId_idx" ON "nse_rfq_participant_dp_account"("participantInfoId");

-- AddForeignKey
ALTER TABLE "nse_rfq_participant_bank_account" ADD CONSTRAINT "nse_rfq_participant_bank_account_participantInfoId_fkey" FOREIGN KEY ("participantInfoId") REFERENCES "nse_rfq_participant_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nse_rfq_participant_dp_account" ADD CONSTRAINT "nse_rfq_participant_dp_account_participantInfoId_fkey" FOREIGN KEY ("participantInfoId") REFERENCES "nse_rfq_participant_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;
