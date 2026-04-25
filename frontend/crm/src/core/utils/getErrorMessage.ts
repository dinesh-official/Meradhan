export function getErrorMessage(err: unknown, fallback: string) {
  if (!err) return fallback;

  // Axios/ApiError shape (apiGateway's ApiCallerClient wraps AxiosError)
  if (typeof err === "object") {
    const anyErr = err as any;
    const apiMessage = anyErr?.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage;

    const directMessage = anyErr?.message;
    if (typeof directMessage === "string" && directMessage.trim()) return directMessage;
  }

  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

