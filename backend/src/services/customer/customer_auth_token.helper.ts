import { AppError, HttpStatus } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken_utils";

export function assertCustomerAccountCanAuthenticate(accountStatus: string) {
  if (accountStatus === "CLOSED") {
    throw new AppError(
      "Your account has been closed. Please contact us to open new account",
      {
        code: "ACCOUNT_CLOSED",
        statusCode: HttpStatus.FORBIDDEN,
      },
    );
  }
  if (accountStatus === "SUSPENDED") {
    throw new AppError("Your account has been suspended", {
      code: "ACCOUNT_SUSPENDED",
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}

type CustomerAuthUser = {
  id: number;
  emailAddress: string;
  phoneNo: string | null;
  utility: { tokenVersion: number };
};

export function issueCustomerAuthToken(user: CustomerAuthUser) {
  return tokenUtils.generateToken(
    {
      email: user.emailAddress,
      mobile: user.phoneNo,
      id: user.id,
      role: "USER",
      tv: user.utility.tokenVersion,
    },
    "1d",
  );
}

export type CustomerJwtPayload = {
  id: number;
  email: string;
  role: "USER";
  tv?: number;
};
