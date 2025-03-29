export interface UserContextInterface {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  active_workspace: string;
  isLoading?: boolean;
}
