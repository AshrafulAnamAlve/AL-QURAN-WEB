export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isOffTopic?: boolean;
  error?: boolean;
}

export interface ChatBanState {
  strikes: number; // 0..3
  isBanned: boolean;
  bannedUntil: number | null; // epoch ms
  banReason?: string;
}

export interface QuickPrompt {
  id: string;
  textEn: string;
  textBn: string;
  category: 'quran' | 'hadith' | 'dua' | 'lifestyle';
}

export const ISLAMIC_QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'p1',
    textBn: 'ধৈর্য ও সবর সম্পর্কে কুরআন ও হাদিসে কী বলা হয়েছে?',
    textEn: 'What do the Quran and Hadith say about patience (Sabr)?',
    category: 'quran',
  },
  {
    id: 'p2',
    textBn: 'পিতামাতার খেদমত ও সদ্ব্যবহারের মর্যাদা কী?',
    textEn: 'What is the virtue of honoring and caring for parents in Islam?',
    category: 'hadith',
  },
  {
    id: 'p3',
    textBn: 'রিজিক বৃদ্ধি ও বরকতের জন্য সুন্নাহ সম্মত দোয়া ও আমল কী?',
    textEn: 'What are the authentic Sunnah duas and deeds for sustenance (Rizq)?',
    category: 'dua',
  },
  {
    id: 'p4',
    textBn: 'দৈনিক ৫ ওয়াক্ত নামাজের ফজিলত ও গুরুত্ব সংক্ষেপে বলুন',
    textEn: 'Explain the importance and virtues of the 5 daily prayers.',
    category: 'lifestyle',
  },
  {
    id: 'p5',
    textBn: 'কঠিন পেরেশানি ও দুশ্চিন্তা মুক্তির দোয়া কী?',
    textEn: 'What is the Sunnah dua for relief from anxiety and distress?',
    category: 'dua',
  },
];
