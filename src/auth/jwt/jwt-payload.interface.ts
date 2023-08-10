export interface JwtPayload {
  id: string;
  slug: string;
  email: string;
  sub: string;
  jti: string;
}
