import { db } from "@core/database/database";
import { SMSCommunication } from "@communication/sms_communication";
import {
  generateSqlFromNaturalLanguage,
  validateCustomerProfileSelectSql,
} from "@services/notifications/customer_nl_sql.service";
import { removeCountryCode } from "@utils/filters/convert";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Prisma } from "@databases/generated/prisma/postgres";
import {
  NotificationBatchDeliveryStatus,
  NotificationMedium,
  NotificationRecipientDeliveryStatus,
} from "@databases/generated/prisma/postgres";
import { env } from "@root/config/env";

const sms = new SMSCommunication();

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;
function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

function isValidIndianMobile(phone: string): boolean {
  const d = removeCountryCode(phone);
  return /^[6-9]\d{9}$/.test(d);
}

export class NotificationService {
  async queryCustomersFromPrompt(prompt: string) {
    const sqlRaw = await generateSqlFromNaturalLanguage(prompt);
    const validation = validateCustomerProfileSelectSql(sqlRaw);
    if (!validation.ok) {
      throw new AppError(validation.reason, {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_SQL",
      });
    }

    const rows = await db.dataBase.$queryRawUnsafe<Array<Record<string, unknown>>>(
      sqlRaw
    );

    const echoSql = process.env.NODE_ENV !== "production";
    return {
      rows,
      ...(echoSql ? { sql: sqlRaw } : {}),
    };
  }

  async createSavedList(
    userId: number,
    input: {
      name: string;
      customerProfileIds: number[];
      sourcePrompt?: string;
    }
  ) {
    const uniqueIds = [...new Set(input.customerProfileIds)];
    try {
      return await db.dataBase.$transaction(async (tx) => {
        const list = await tx.crmNotificationSavedListModel.create({
          data: {
            name: input.name,
            createdById: userId,
            sourcePrompt: input.sourcePrompt,
          },
        });
        if (uniqueIds.length > 0) {
          await tx.crmNotificationSavedListMemberModel.createMany({
            data: uniqueIds.map((customerProfileId) => ({
              savedListId: list.id,
              customerProfileId,
            })),
            skipDuplicates: true,
          });
        }
        return tx.crmNotificationSavedListModel.findUniqueOrThrow({
          where: { id: list.id },
          include: {
            _count: { select: { members: true } },
          },
        });
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        throw new AppError("A saved list with this name already exists.", {
          statusCode: HttpStatus.CONFLICT,
          code: "DUPLICATE_NAME",
        });
      }
      throw e;
    }
  }

  async listSavedLists(userId: number, role: string) {
    const adminView = isAdminRole(role);
    return db.dataBase.crmNotificationSavedListModel.findMany({
      where: adminView ? { isActive: true } : { createdById: userId, isActive: true },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { members: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /** Internal helper — verifies ownership (or admin bypass) and returns the list. */
  private async assertListAccess(userId: number, role: string, id: number) {
    const adminView = isAdminRole(role);
    const list = await db.dataBase.crmNotificationSavedListModel.findFirst({
      where: adminView ? { id } : { id, createdById: userId },
    });
    if (!list) {
      throw new AppError("Saved list not found.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "NOT_FOUND",
      });
    }
    return list;
  }

  async getSavedList(userId: number, id: number) {
    const list = await db.dataBase.crmNotificationSavedListModel.findFirst({
      where: { id, createdById: userId },
      include: {
        members: {
          select: { customerProfileId: true, addedAt: true },
        },
      },
    });
    if (!list) {
      throw new AppError("Saved list not found.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "NOT_FOUND",
      });
    }
    return list;
  }

  async patchSavedList(
    userId: number,
    id: number,
    patch: { name?: string; isActive?: boolean }
  ) {
    await this.getSavedList(userId, id);
    return db.dataBase.crmNotificationSavedListModel.update({
      where: { id },
      data: patch,
    });
  }

  async softDeleteSavedList(userId: number, role: string, id: number) {
    await this.assertListAccess(userId, role, id);
    return db.dataBase.crmNotificationSavedListModel.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSavedListMembers(userId: number, role: string, listId: number) {
    await this.assertListAccess(userId, role, listId);
    return db.dataBase.crmNotificationSavedListMemberModel.findMany({
      where: { savedListId: listId },
      include: {
        customerProfile: {
          select: {
            id: true,
            userName: true,
            firstName: true,
            lastName: true,
            phoneNo: true,
            emailAddress: true,
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });
  }

  async removeSavedListMember(
    userId: number,
    role: string,
    listId: number,
    customerProfileId: number
  ) {
    await this.assertListAccess(userId, role, listId);
    await db.dataBase.crmNotificationSavedListMemberModel.delete({
      where: {
        savedListId_customerProfileId: { savedListId: listId, customerProfileId },
      },
    });
    // return updated member count
    return db.dataBase.crmNotificationSavedListModel.findUniqueOrThrow({
      where: { id: listId },
      include: { _count: { select: { members: true } } },
    });
  }

  getSmsTemplatesFromConfig(): Array<{ templateId: string; label: string }> {
    const raw = env.MSG91_DLT_TEMPLATES_JSON;
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (x): x is { templateId: string; label: string } =>
            x !== null &&
            typeof x === "object" &&
            "templateId" in x &&
            typeof (x as { templateId: unknown }).templateId === "string" &&
            "label" in x &&
            typeof (x as { label: unknown }).label === "string"
        )
        .map((x) => ({ templateId: x.templateId, label: x.label }));
    } catch {
      return [];
    }
  }

  async sendNotification(
    userId: number,
    role: string,
    input: {
      savedListId: number;
      medium: NotificationMedium;
      dltTemplateId: string;
      templateVariables: Record<string, string>;
    }
  ) {
    if (input.medium === NotificationMedium.WHATSAPP) {
      throw new AppError("WhatsApp notifications are not enabled yet.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "MEDIUM_NOT_SUPPORTED",
      });
    }

    // Use role-aware access check so ADMIN/SUPER_ADMIN can send to any list
    await this.assertListAccess(userId, role, input.savedListId);

    const list = await db.dataBase.crmNotificationSavedListModel.findFirst({
      where: { id: input.savedListId, isActive: true },
      include: {
        members: {
          select: { customerProfileId: true },
        },
      },
    });

    if (!list) {
      throw new AppError("Saved list not found.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "NOT_FOUND",
      });
    }

    const customerIds = list.members.map((m) => m.customerProfileId);
    const customers = await db.dataBase.customerProfileDataModel.findMany({
      where: { id: { in: customerIds }, isDeleted: false },
      select: { id: true, phoneNo: true },
    });

    const byId = new Map(customers.map((c) => [c.id, c]));

    const header = await db.dataBase.notificationLogModel.create({
      data: {
        savedListId: list.id,
        medium: input.medium,
        dltTemplateId: input.dltTemplateId,
        templateVariables: input.templateVariables as Prisma.InputJsonValue,
        sentById: userId,
        deliveryStatus: NotificationBatchDeliveryStatus.PROCESSING,
        meta: {
          total: customerIds.length,
          pendingPhones: customerIds.length,
        } as Prisma.InputJsonValue,
      },
    });

    let invalid = 0;
    let sent = 0;
    let failed = 0;

    for (const cid of customerIds) {
      const c = byId.get(cid);
      const phone = c?.phoneNo?.trim() ?? "";
      const valid = phone.length > 0 && isValidIndianMobile(phone);

      await db.dataBase.notificationRecipientLogModel.create({
        data: {
          notificationLogId: header.id,
          customerProfileId: cid,
          phone: valid ? phone : phone || "",
          deliveryStatus: valid
            ? NotificationRecipientDeliveryStatus.PENDING
            : NotificationRecipientDeliveryStatus.INVALID_NUMBER,
        },
      });

      if (!valid) {
        invalid++;
      }
    }

    const recipients = await db.dataBase.notificationRecipientLogModel.findMany({
      where: {
        notificationLogId: header.id,
        deliveryStatus: NotificationRecipientDeliveryStatus.PENDING,
      },
    });

    // Resolve template record for message preview and RCS metadata
    const tplRecord = await db.dataBase.notificationTemplateModel.findFirst({
      where: { templateId: input.dltTemplateId, medium: input.medium, isActive: true },
      select: { message: true, rcsProjectId: true, rcsNamespace: true, rcsVariables: true },
    });

    let messagePreview: string | null = null;
    if (tplRecord?.message) {
      const resolved = tplRecord.message.replace(
        /##(\w+)##/g,
        (_, key) => input.templateVariables[key] ?? `##${key}##`
      );
      messagePreview = resolved.length > 500 ? `${resolved.slice(0, 497)}...` : resolved;
    } else {
      const fallback = Object.entries(input.templateVariables)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");
      messagePreview = fallback || null;
    }

    await db.dataBase.notificationLogModel.update({
      where: { id: header.id },
      data: { messagePreview },
    });

    if (input.medium === NotificationMedium.RCS) {
      // ── RCS: one bulk API call for all valid recipients ──────────────
      const validRecipients = recipients.filter((r) => r.phone.length > 0);
      const phones = validRecipients.map((r) => r.phone.replace(/^\+/, ""));

      // Build ordered variables array from templateVariables + rcsVariables definition
      const rcsVarNames = Array.isArray(tplRecord?.rcsVariables)
        ? (tplRecord.rcsVariables as string[])
        : [];
      const variablesArray = rcsVarNames.map((v) => input.templateVariables[v] ?? "");

      const projectId = tplRecord?.rcsProjectId ?? "";
      const namespace = tplRecord?.rcsNamespace ?? input.dltTemplateId;

      if (!projectId) {
        // Mark all as failed — template missing RCS config
        for (const r of validRecipients) {
          await db.dataBase.notificationRecipientLogModel.update({
            where: { id: r.id },
            data: {
              deliveryStatus: NotificationRecipientDeliveryStatus.FAILED,
              errorMessage: "RCS project ID not configured on template.",
            },
          });
          failed++;
        }
      } else {
        try {
          const out = await sms.sendBulkRcs(
            phones,
            input.dltTemplateId,
            namespace,
            projectId,
            variablesArray
          );
          const batchRef = out.request_id ?? null;
          for (const r of validRecipients) {
            await db.dataBase.notificationRecipientLogModel.update({
              where: { id: r.id },
              data: {
                deliveryStatus: NotificationRecipientDeliveryStatus.SENT,
                providerMessageId: batchRef,
              },
            });
            sent++;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          for (const r of validRecipients) {
            await db.dataBase.notificationRecipientLogModel.update({
              where: { id: r.id },
              data: {
                deliveryStatus: NotificationRecipientDeliveryStatus.FAILED,
                errorMessage: msg.slice(0, 2000),
              },
            });
            failed++;
          }
        }
      }
    } else {
      // ── SMS: per-recipient loop ───────────────────────────────────────
      for (const r of recipients) {
        try {
          const cleanPhone = r.phone.replace(/^\+/, "");
          const out = await sms.sendBulkSmsDlt(
            cleanPhone,
            input.dltTemplateId,
            input.templateVariables
          );
          await db.dataBase.notificationRecipientLogModel.update({
            where: { id: r.id },
            data: {
              deliveryStatus: NotificationRecipientDeliveryStatus.SENT,
              providerMessageId: out.request_id ?? null,
            },
          });
          sent++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          await db.dataBase.notificationRecipientLogModel.update({
            where: { id: r.id },
            data: {
              deliveryStatus: NotificationRecipientDeliveryStatus.FAILED,
              errorMessage: msg.slice(0, 2000),
            },
          });
          failed++;
        }
      }
    }

    let batch: NotificationBatchDeliveryStatus =
      NotificationBatchDeliveryStatus.COMPLETED;
    if (invalid === customerIds.length && sent === 0 && failed === 0) {
      batch = NotificationBatchDeliveryStatus.FAILED;
    } else if (failed > 0 && sent > 0) {
      batch = NotificationBatchDeliveryStatus.PARTIAL_FAILURE;
    } else if (failed > 0 && sent === 0) {
      batch = NotificationBatchDeliveryStatus.FAILED;
    }

    await db.dataBase.notificationLogModel.update({
      where: { id: header.id },
      data: {
        deliveryStatus: batch,
        meta: {
          total: customerIds.length,
          sent,
          failed,
          invalid,
        } as Prisma.InputJsonValue,
      },
    });

    return db.dataBase.notificationLogModel.findUniqueOrThrow({
      where: { id: header.id },
      include: {
        _count: { select: { recipients: true } },
      },
    });
  }

  async listNotificationLogs(query: {
    page: number;
    pageSize: number;
    medium?: NotificationMedium;
    deliveryStatus?: NotificationBatchDeliveryStatus;
    from?: string;
    to?: string;
  }) {
    const where: Prisma.NotificationLogModelWhereInput = {};
    if (query.medium) {
      where.medium = query.medium;
    }
    if (query.deliveryStatus) {
      where.deliveryStatus = query.deliveryStatus;
    }
    if (query.from || query.to) {
      where.sentAt = {};
      if (query.from) {
        where.sentAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.sentAt.lte = new Date(query.to);
      }
    }

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      db.dataBase.notificationLogModel.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip,
        take: query.pageSize,
        include: {
          sentBy: { select: { id: true, name: true, email: true } },
          savedList: { select: { id: true, name: true } },
        },
      }),
      db.dataBase.notificationLogModel.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize) || 1,
      },
    };
  }

  /* ─── DLT Template CRUD ──────────────────────────────────── */

  private readonly TEMPLATE_SELECT = {
    id: true,
    name: true,
    templateId: true,
    medium: true,
    message: true,
    rcsProjectId: true,
    rcsNamespace: true,
    rcsVariables: true,
    createdAt: true,
    createdBy: { select: { id: true, name: true } },
  } as const;

  async listTemplates(medium?: NotificationMedium) {
    return db.dataBase.notificationTemplateModel.findMany({
      where: { isActive: true, ...(medium ? { medium } : {}) },
      orderBy: { name: "asc" },
      select: this.TEMPLATE_SELECT,
    });
  }

  async createTemplate(
    userId: number,
    data: {
      name: string;
      templateId: string;
      medium: NotificationMedium;
      message?: string | null;
      rcsProjectId?: string;
      rcsNamespace?: string;
      rcsVariables?: string[];
    }
  ) {
    return db.dataBase.notificationTemplateModel.create({
      data: {
        ...data,
        rcsVariables: data.rcsVariables ?? undefined,
        createdById: userId,
      },
      select: this.TEMPLATE_SELECT,
    });
  }

  async updateTemplate(
    id: number,
    data: {
      name?: string;
      templateId?: string;
      medium?: NotificationMedium;
      message?: string | null;
      rcsProjectId?: string | null;
      rcsNamespace?: string | null;
      rcsVariables?: string[] | null;
    }
  ) {
    const existing = await db.dataBase.notificationTemplateModel.findFirst({
      where: { id, isActive: true },
    });
    if (!existing) {
      throw new AppError("Template not found.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "NOT_FOUND",
      });
    }
    return db.dataBase.notificationTemplateModel.update({
      where: { id },
      data: {
        ...data,
        rcsVariables: data.rcsVariables ?? undefined,
      },
      select: this.TEMPLATE_SELECT,
    });
  }

  async deleteTemplate(id: number) {
    const existing = await db.dataBase.notificationTemplateModel.findFirst({
      where: { id, isActive: true },
    });
    if (!existing) {
      throw new AppError("Template not found.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "NOT_FOUND",
      });
    }
    return db.dataBase.notificationTemplateModel.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getLogRecipients(logId: number) {
    return db.dataBase.notificationRecipientLogModel.findMany({
      where: { notificationLogId: logId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        phone: true,
        deliveryStatus: true,
        providerMessageId: true,
        errorMessage: true,
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            userName: true,
            emailAddress: true,
          },
        },
      },
    });
  }

  /* ─── Customer notification logs ─────────────────────────── */

  async listCustomerNotificationLogs(customerProfileId: number) {
    return db.dataBase.notificationRecipientLogModel.findMany({
      where: { customerProfileId },
      orderBy: { notificationLog: { sentAt: "desc" } },
      take: 100,
      include: {
        notificationLog: {
          select: {
            id: true,
            medium: true,
            dltTemplateId: true,
            templateVariables: true,
            messagePreview: true,
            deliveryStatus: true,
            sentAt: true,
          },
        },
      },
    });
  }
}
