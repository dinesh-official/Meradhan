export interface ITokenUtils {
    generateToken<D, T>(data: D, expiresIn?: T): string;
    verifyToken<T>(token: string): T;
}
