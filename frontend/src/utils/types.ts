import { ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  role: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subscription_plan: string;
    notes_count?: number;
    notes_limit?: number | null;
  };
}

export interface Note {
  author_email: ReactNode;
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
