import { UserByIdResponse } from "@root/apiGateway";

export type UserProfile = UserByIdResponse["responseData"];

export interface ProfileCardProps {
  data?: UserProfile;
}