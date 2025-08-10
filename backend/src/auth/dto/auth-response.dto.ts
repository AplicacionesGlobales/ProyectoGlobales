export class AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  branch?: {
    id: number;
    name: string;
    businessName: string;
  };
  token: string;
}
