export class ErrorDetail {
  code: number;
  description?: string;
  field?: string;
  message?: string;
}

export class BaseResponseDto<T = any> {
  successful: boolean;
  data?: T;
  error?: ErrorDetail[];

  constructor(successful: boolean, data?: T, error?: ErrorDetail[]) {
    this.successful = successful;
    this.data = data;
    this.error = error;
  }

  static success<T>(data?: T): BaseResponseDto<T> {
    return new BaseResponseDto(true, data);
  }

  static error(errors: ErrorDetail[]): BaseResponseDto {
    return new BaseResponseDto(false, undefined, errors);
  }

  static singleError(code: number, description: string): BaseResponseDto {
    return new BaseResponseDto(false, undefined, [{ code, description }]);
  }
}
