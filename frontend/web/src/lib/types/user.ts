export interface User {
  uid: string;
  email: string;
  onboarding_complete: boolean;
  created_at: string;
}

export interface ActiveSession {
  session_id: string;
  device_info: string;
  ip_address: string;
  created_at: string;
  last_active: string;
  expires_at: string;
  is_current: boolean;
}
