import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  TilopayLoginRequest,
  TilopayLoginResponse,
  TilopayPaymentRequest,
  TilopayPaymentResponse,
} from './tilopay.types';

@Injectable()
export class TilopayService {
  private baseUrl: string;
  private apiKey: string;
  private apiUser: string;
  private apiPassword: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('TILOPAY_BASE_URL') || '';
    this.apiKey = this.configService.get<string>('TILOPAY_API_KEY') || '';
    this.apiUser = this.configService.get<string>('TILOPAY_API_USER') || '';
    this.apiPassword = this.configService.get<string>('TILOPAY_API_PASSWORD') || '';
  }

  async getAuthToken(): Promise<string> {
    try {
      const loginData: TilopayLoginRequest = {
        apiuser: this.apiUser,
        password: this.apiPassword,
      };

      const response: AxiosResponse<TilopayLoginResponse> = await firstValueFrom(
        this.httpService.post<TilopayLoginResponse>(
          `${this.baseUrl}/login`,
          loginData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.access_token;
    } catch (error) {
      throw new HttpException(
        'Error obteniendo token de Tilopay',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async processPayment(paymentData: TilopayPaymentRequest): Promise<TilopayPaymentResponse> {
    try {
      const token = await this.getAuthToken();

      const response: AxiosResponse<TilopayPaymentResponse> = await firstValueFrom(
        this.httpService.post<TilopayPaymentResponse>(
          `${this.baseUrl}/processPayment`,
          {
            ...paymentData,
            key: this.apiKey,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error procesando pago con Tilopay',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
