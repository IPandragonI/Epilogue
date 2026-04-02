export const jwtConstants: { secret: string; expiresIn: number } = {
  secret: process.env.JWT_SECRET || 'dev_jwt_secret',
  expiresIn: Number(process.env.JWT_EXPIRES) || 3600,
};
