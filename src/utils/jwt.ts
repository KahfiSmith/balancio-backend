import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '@/config/config';
import { JWTPayload } from '@/types';

export const signAccessToken = (payload: JWTPayload) => {
  const options: SignOptions = { expiresIn: (config.JWT_EXPIRES_IN || '1h') as any };
  return jwt.sign(payload, config.JWT_SECRET, options);
};

export const signRefreshToken = (payload: JWTPayload) => {
  const options: SignOptions = { expiresIn: (config.JWT_REFRESH_EXPIRES_IN || '7d') as any };
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as JWTPayload;
};
