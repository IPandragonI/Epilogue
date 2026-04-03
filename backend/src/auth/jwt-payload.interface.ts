import { UserRole } from '../modules/users/entities/userRole.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
