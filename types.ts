
export interface KBFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 or extracted text
}

export interface KBSection {
  id: string;
  title: string;
  content: string;
  files?: KBFile[];
}

export interface KnowledgeBase {
  companyName: string;
  appName: string;
  voiceName: string;
  dialect: string;
  sections: KBSection[];
}

export interface TranscriptionEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export enum AppMode {
  SETUP = 'SETUP',
  VOICE_INTERFACE = 'VOICE_INTERFACE'
}
