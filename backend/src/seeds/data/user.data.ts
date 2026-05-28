import { UserRole } from '../../modules/users/entities/userRole.enum';
import { Agency } from '../../modules/agency/entities/agency.entity';

export const userData = (passwordHash: string, agency: Agency) => [
  {
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@example.com',
    password: passwordHash,
    role: UserRole.ADMIN,
    agency: agency,
  },
  {
    firstname: 'John',
    lastname: 'Doe',
    email: 'user@example.com',
    password: passwordHash,
    role: UserRole.PUBLIC,
    agency: agency,
  },
];
