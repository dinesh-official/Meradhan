-- CreateTable
CREATE TABLE "rbac_roles" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rbac_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rbac_modules" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rbac_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rbac_actions" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moduleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rbac_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rbac_role_policies" (
    "id" SERIAL NOT NULL,
    "actionId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rbac_role_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rbac_roles_key_key" ON "rbac_roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_modules_key_key" ON "rbac_modules"("key");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_actions_key_key" ON "rbac_actions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_role_policies_actionId_roleId_key" ON "rbac_role_policies"("actionId", "roleId");

-- AddForeignKey
ALTER TABLE "rbac_actions" ADD CONSTRAINT "rbac_actions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "rbac_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_role_policies" ADD CONSTRAINT "rbac_role_policies_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "rbac_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_role_policies" ADD CONSTRAINT "rbac_role_policies_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "rbac_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rbac_role_policies" ADD CONSTRAINT "rbac_role_policies_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "crm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
