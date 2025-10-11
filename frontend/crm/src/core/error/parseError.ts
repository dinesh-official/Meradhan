export const parseError = <T = Error>(error: any): T  => {
    if (error) {
        return error as T;
    }
   return error;
}