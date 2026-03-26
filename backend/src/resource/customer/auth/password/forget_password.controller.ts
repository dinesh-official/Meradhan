import type { Request, Response } from "express";
import { ForgetPasswordService } from "./forget_password.service";
import { HttpStatus } from "@utils/error/AppError";
import { appSchema } from "@root/schema";

export class ForgetPasswordController {
  private forgotPasswordService = new ForgetPasswordService();

  async sendForgetPassword(request: Request, response: Response) {
    const data = appSchema.customer.sendForgetPasswordSchema.parse(
      request.body
    );
    await this.forgotPasswordService.sendForgetPassword(data);
    response.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        message: "Reset password link sent successfully",
      },
    });
  }

  async resetPassword(request: Request, response: Response) {
    const data = appSchema.customer.resetPasswordSchema.parse(request.body);
    await this.forgotPasswordService.resetPassword(data);
    response.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        message: "Password reset successfully",
      },
    });
  }
}
