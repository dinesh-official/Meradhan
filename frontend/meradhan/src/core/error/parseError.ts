export const parseError = <T = Error>(error: unknown): T => {
    if (error) {
        return error as T;
    }
    return error as T;
}