export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  profile_img: string | null;
  created_at: string | null;
}