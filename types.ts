
export interface Participant {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  created_at?: string;
}

export interface AppSettings {
  id?: string;
  goal: number;
  contribution_value: number;
}
