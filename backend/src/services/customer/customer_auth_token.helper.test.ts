import { describe, expect, it } from "bun:test";
import { assertCustomerAccountCanAuthenticate } from "./customer_auth_token.helper";
import { AppError } from "@utils/error/AppError";

describe("assertCustomerAccountCanAuthenticate", () => {
  it("allows ACTIVE accounts", () => {
    expect(() => assertCustomerAccountCanAuthenticate("ACTIVE")).not.toThrow();
  });

  it("blocks CLOSED accounts with ACCOUNT_CLOSED", () => {
    try {
      assertCustomerAccountCanAuthenticate("CLOSED");
      throw new Error("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.code).toBe("ACCOUNT_CLOSED");
      expect(appError.message).toBe(
        "Your account has been closed. Please contact us to open new account",
      );
      expect(appError.statusCode).toBe(403);
    }
  });

  it("blocks SUSPENDED accounts with ACCOUNT_SUSPENDED", () => {
    try {
      assertCustomerAccountCanAuthenticate("SUSPENDED");
      throw new Error("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.code).toBe("ACCOUNT_SUSPENDED");
      expect(appError.statusCode).toBe(403);
    }
  });
});
