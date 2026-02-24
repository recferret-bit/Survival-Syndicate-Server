export interface UserSession {
  id: string;
  email?: string;
  phone?: string;
  currencyCode: string;
  geo: string;
  createdAt: number;
  isTestUser?: boolean;
}
