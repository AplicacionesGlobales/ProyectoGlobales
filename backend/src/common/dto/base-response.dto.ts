export class ErrorDetail {
  code: number;
  description?: string;
  field?: string;
  message?: string;
}

export class BaseResponseDto<T = any> {
  success: boolean;  // Changed from 'successful' to 'success'
  data?: T;
  errors?: ErrorDetail[];  // Changed from 'error' to 'errors'

  constructor(success: boolean, data?: T, errors?: ErrorDetail[]) {
    this.success = success;
    this.data = data;
    this.errors = errors;
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
