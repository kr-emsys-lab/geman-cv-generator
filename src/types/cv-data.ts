export interface CVData {
  personal: {
    firstName: string;
    lastName: string;
    title: string;           // e.g. "Dr." or "Prof."
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    linkedin: string;
    xing: string;
    dateOfBirth: string;     // DD.MM.YYYY
    placeOfBirth: string;
    nationality: string;
    maritalStatus: string;
    photoDataUrl: string;    // base64 image or empty string
  };
  experience: WorkEntry[];
  education: EducationEntry[];
  skills: {
    languages: SkillItem[];
    it: SkillItem[];
    other: SkillItem[];
  };
  projects: ProjectEntry[];
  certificates: CertificateEntry[];
  hobbies: string;
  upload?: {
    fileName: string;
    text: string;
    parsedAt: string;
  };
  meta: {
    language: 'de' | 'en';
    designFormat: 'classic' | 'ats';
    signatureCity: string;
    signatureDate: string;   // DD.MM.YYYY
  };
}

export interface WorkEntry {
  id: string;
  startDate: string;         // MM/YYYY
  endDate: string;           // MM/YYYY or "heute"
  role: string;
  employer: string;
  city: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  startDate: string;
  endDate: string;
  degree: string;
  institution: string;
  city: string;
  grade: string;
  bullets: string[];
}

export interface SkillItem {
  id: string;
  name: string;
  level: string;             // e.g. "Muttersprache", "B2", "Grundkenntnisse"
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

// Default empty CV data
export const defaultCVData: CVData = {
  personal: {
    firstName: '',
    lastName: '',
    title: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    linkedin: '',
    xing: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    maritalStatus: '',
    photoDataUrl: ''
  },
  experience: [],
  education: [],
  skills: {
    languages: [],
    it: [],
    other: []
  },
  projects: [],
  certificates: [],
  hobbies: '',
  meta: {
    language: 'de',
    designFormat: 'classic',
    signatureCity: '',
    signatureDate: new Date().toLocaleDateString('de-DE')
  }
};