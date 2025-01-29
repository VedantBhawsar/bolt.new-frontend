export interface Step {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface File {
  name: string;
  type: 'file' | 'folder';
  children?: File[];
}