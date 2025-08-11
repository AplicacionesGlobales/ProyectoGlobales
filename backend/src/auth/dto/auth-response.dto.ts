export class AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  token: string;
}
