import { db } from "@core/database/database";
import type { DataBaseSchema } from "@core/database/database";

export class ServiceRequestRepo {
  findActiveReasons(type: DataBaseSchema.ServiceRequestType) {
    return db.dataBase.userServiceRequestReasonModel.findMany({
      where: { type, status: "ACTIVE" },
      orderBy: { id: "asc" },
    });
  }

  findReasonById(reasonId: number) {
    return db.dataBase.userServiceRequestReasonModel.findUnique({
      where: { id: reasonId },
    });
  }

  findPendingByUserAndType(userId: number, type: DataBaseSchema.ServiceRequestType) {
    return db.dataBase.userServiceRequestModel.findFirst({
      where: { userId, type, status: "PENDING" },
    });
  }

  createRequest(data: DataBaseSchema.UserServiceRequestModelCreateArgs) {
    return db.dataBase.userServiceRequestModel.create(data);
  }

  findByUserId(userId: number, type?: DataBaseSchema.ServiceRequestType) {
    return db.dataBase.userServiceRequestModel.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      include: { reason: { select: { id: true, text: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: number) {
    return db.dataBase.userServiceRequestModel.findUnique({
      where: { id },
      include: {
        reason: { select: { id: true, text: true } },
        customerProfileDataModel: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            emailAddress: true,
            phoneNo: true,
            utility: { select: { accountStatus: true, tokenVersion: true } },
          },
        },
      },
    });
  }

  count(where: DataBaseSchema.UserServiceRequestModelWhereInput) {
    return db.dataBase.userServiceRequestModel.count({ where });
  }

  findMany(args: DataBaseSchema.UserServiceRequestModelFindManyArgs) {
    return db.dataBase.userServiceRequestModel.findMany(args);
  }

  update(args: DataBaseSchema.UserServiceRequestModelUpdateArgs) {
    return db.dataBase.userServiceRequestModel.update(args);
  }
}
