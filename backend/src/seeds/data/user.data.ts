import { UserRole } from '../../modules/users/entities/userRole.enum';

export const userData = (passwordHash: string) => [
  {
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@example.com',
    password: passwordHash,
    role: UserRole.ADMIN,
    cloudSpace: { notionToken: 'notion-token-admin' },
  },
  {
    firstname: 'John',
    lastname: 'Doe',
    email: 'user@example.com',
    password: passwordHash,
    role: UserRole.PUBLIC,
    cloudSpace: { notionToken: 'notion-token-user' },
  },
];
