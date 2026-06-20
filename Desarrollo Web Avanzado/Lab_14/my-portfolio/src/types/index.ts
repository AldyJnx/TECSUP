export interface Project {
  id: string;
  number: string; // "01"
  title: string;
  year: string;
  category: string;
  description: string;
  stack: string[];
  image: string;
  liveUrl: string;
}

export interface Capability {
  code: string; // "A.01"
  title: string;
  description: string;
}

export interface Service {
  code: string; // "S.01"
  title: string;
  description: string;
  image?: string;
  tech?: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
