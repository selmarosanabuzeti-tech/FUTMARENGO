
export interface Participant {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  createdAt: number;
}

export interface AppSettings {
  goal: number;
  contributionValue: number;
}
