export interface Person {
  id: number;
  name: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentType {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface Schedule {
  id: number;
  person: Person;
  contentType: ContentType;
  scheduledDate: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
