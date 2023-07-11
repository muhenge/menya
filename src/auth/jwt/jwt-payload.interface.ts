export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  sub: string;
  jti: string;
}
