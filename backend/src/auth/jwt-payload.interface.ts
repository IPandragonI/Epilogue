import { UserRole } from '../modules/users/entities/userRole.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}
