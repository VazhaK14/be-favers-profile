export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
  };
};

export function respondError(message: string): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    meta: { timestamp: new Date().toISOString() },
  };
}

export function respond<T>(data: T, message = "OK"): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
