export interface TeamJwtPayload {
  teamId: string;
  name: string;
  type: 'team';
}

export interface AdminJwtPayload {
  adminId: string;
  name: string;
  email: string;
  tier: number;
  type: 'admin';
}
