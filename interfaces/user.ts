export interface UserContextInterface {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  active_workspace: string;
  isLoading?: boolean;
}
