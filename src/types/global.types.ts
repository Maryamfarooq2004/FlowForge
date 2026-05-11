export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ApiError {
  response?: {
    status: number;
    data: {
      success: boolean;
      code: string;
      message: string;
      errors?: Record<string, string>;
    };
  };
  message?: string;
}
