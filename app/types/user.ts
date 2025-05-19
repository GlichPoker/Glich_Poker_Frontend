export interface User {
  id: string | null;
  birthDate: string | null;
  username: string | null;
  token: string | null;
  status: string | null;
  creationDate: string | null;
  userLobbyStatus?: 'IDLE' | 'IN_LOBBY';
  currentLobbyId?: number | null;
}
