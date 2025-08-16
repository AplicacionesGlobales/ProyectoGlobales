// backend\src\payment\payment-tilopay\tilopay.service.ts

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

      // Validar datos requeridos
      if (!paymentData.amount || !paymentData.currency || !paymentData.orderNumber) {
        throw new HttpException(
          'Datos de pago incompletos',
          HttpStatus.BAD_REQUEST
        );
      }

      const response: AxiosResponse<TilopayPaymentResponse> = await firstValueFrom(
        this.httpService.post<TilopayPaymentResponse>(
          `${this.baseUrl}/processPayment`,
          {
            ...paymentData,
            key: this.apiKey,
            platform: 'api',
            subscription: '0',
            capture: '1',
            hashVersion: 'V2'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 segundos de timeout
          },
        ),
      );

      if (!response.data.url) {
        throw new HttpException(
          'No se recibió URL de pago de Tilopay',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error procesando pago con Tilopay:', error);

      if (error.response?.data) {
        throw new HttpException(
          error.response.data.message || 'Error procesando pago con Tilopay',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      throw new HttpException(
        'Error de conexión con Tilopay',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
