
import type { DataBaseSchema, UserDataModel } from "@core/database/database";
import type { Request, Response } from "express";

export interface IAuthRepoInterface {
    login(email: string): Promise<UserDataModel>; // returns JWT token
    signUp(data: DataBaseSchema.UserDataModelCreateInput): Promise<UserDataModel>; // returns JWT token
    getUser(id: number | string): Promise<UserDataModel>;
}

export interface IAuthServiceInterface {
    login(email: string, password: string): Promise<string>; // returns JWT token
    signUp(d: { email: string; password: string; name: string; }): Promise<string>; // returns JWT token
    session(id: number | string): Promise<UserDataModel>
}

export interface IAuthControllerInterface {
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    session(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
}

