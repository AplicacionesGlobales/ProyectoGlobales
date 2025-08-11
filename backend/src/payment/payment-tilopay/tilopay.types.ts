export interface TilopayLoginRequest {
  apiuser: string;
  password: string;
}

export interface TilopayLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TilopayPaymentRequest {
  redirect: string;
  key?: string; // Opcional ya que se agrega en el servicio
  amount: string;
  currency: string;
  orderNumber: string;
  capture: string;
  billToFirstName: string;
  billToLastName: string;
  billToAddress: string;
  billToAddress2: string;
  billToCity: string;
  billToState: string;
  billToZipPostCode: string;
  billToCountry: string;
  billToTelephone: string;
  billToEmail: string;
  shipToFirstName?: string;
  shipToLastName?: string;
  shipToAddress?: string;
  shipToAddress2?: string;
  shipToCity?: string;
  shipToState?: string;
  shipToZipPostCode?: string;
  shipToCountry?: string;
  shipToTelephone?: string;
  subscription: string;
  platform: string;
  returnData?: string;
  hashVersion?: string;
}

export interface TilopayPaymentResponse {
  type: string;
  html: string;
  url: string;
}

export interface PaymentCallbackQuery {
  code: string;
  description: string;
  auth?: string;
  order?: string;
  tpt?: string;
  crd?: string;
  'tilopay-transaction'?: string;
  OrderHash?: string;
  returnData?: string;
  form_update?: string;
}
