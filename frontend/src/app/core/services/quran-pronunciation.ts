import { Injectable } from '@angular/core';

/**
 * Verified canonical pronunciation (বাংলা উচ্চারণ) for short surahs, frequently
 * recited passages (Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Ayatul Kursi, etc.),
 * and prayer verses.
 */
const CANONICAL_PRONUNCIATIONS: Readonly<Record<string, string>> = {
  // Surah 1: Al-Fatiha
  '1:1': 'বিসমিল্লাহির রাহমানির রাহিম',
  '1:2': "আলহামদু লিল্লাহি রাব্বিল আ'লামীন",
  '1:3': 'আর-রাহমানির রাহিম',
  '1:4': 'মালিকি ইয়াওমিদ্দীন',
  '1:5': "ইয়্যাকা না'বুদু ওয়া ইয়্যাকা নাসতাঈন",
  '1:6': 'ইহদিনাস সিরাতাল মুসতাকীম',
  '1:7': "সিরাতাল্লাযীনা আন'আমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ্দাল্লীন",

  // Surah 2: Ayatul Kursi (2:255)
  '2:255':
    "আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল ক্বাইয়্যুম, লা তা'খুযুহু সিনাতুঁও ওয়ালা নাওম, লাহু মা ফিস সামাওয়াতি ওয়ামা ফিল আরদ্, মান যাল্লাযী ইয়্যাশফা'উ 'ইনদাহূ ইল্লা বিইযনিহ, ইয়া'লামু মা বাইনা আইদীহিম ওয়ামা খালফাহুম, ওয়ালা ইউহীতূনা বিশাইইম মিন 'ইলমিহী ইল্লা বিমা শা-আ, ওয়াসি'আ কুরসিইয়্যুহুস সামাওয়াতি ওয়াল আরদ্, ওয়ালা ইয়াউদুহু হিফযুহুমা, ওয়াহুওয়াল 'আলিয়্যুল 'আজীম",

  // Surah 97: Al-Qadr
  '97:1': 'ইন্না আনযালনাহু ফী লাইলাতিল কদর',
  '97:2': 'ওয়ামা আদরাকা মা লাইলাতুল কদর',
  '97:3': 'লাইলাতুল কাদরি খাইরুম মিন আলফি শাহর',
  '97:4': 'তানায্যালুল মালাইকাতু ওয়ার রূহু ফীহা বিইযনি রাব্বিহিম মিন কুল্লি আমর',
  '97:5': "সালামুন হিয়া হাত্তা মাতলা'ইল ফজর",

  // Surah 103: Al-Asr
  '103:1': "ওয়াল 'আসর",
  '103:2': 'ইন্নাল ইনসানা লাফী খুসর',
  '103:3':
    "ইল্লাল্লাযীনা আমানূ ওয়া 'আমিলুস সালিহাতি ওয়া তাওয়াসাও বিল হাক্কি ওয়া তাওয়াসাও বিস সাবর",

  // Surah 105: Al-Fil
  '105:1': 'আলাম তারা কাইফা ফা\'আলা রাব্বুকা বিআসহাবিল ফিল',
  '105:2': 'আলাম ইয়াজ\'আল কাইদাহুম ফী তাদলীল',
  '105:3': 'ওয়া আরসালা আলাইহিম তাইরান আবাবীল',
  '105:4': 'তারমীহিম বিহিজারাতীম মিন সিজ্জীল',
  '105:5': 'ফাজা\'আলাহুম কা\'আসফিম মা\'কূল',

  // Surah 106: Quraish
  '106:1': 'লিঈলাফি কুরাইশ',
  '106:2': 'ঈলাফিহিম রিহলাতাশ শিতা-ই ওয়াস সাইফ',
  '106:3': 'ফালইয়া\'বুদূ রাব্বা হাযাল বাইত',
  '106:4': 'আল্লাযী আত\'আমাহুম মিন জু\'ইঁও ওয়া আমানাহুম মিন খাওফ',

  // Surah 107: Al-Ma'un
  '107:1': 'আরাআইতাল্লাযী ইউকাযযিবু বিদ্দীন',
  '107:2': 'ফাযালিকাল্লাযী ইয়াদু\'উল ইয়াতীম',
  '107:3': 'ওয়ালা ইয়াহুদ্দু আলা তা\'আমিল মিসকীন',
  '107:4': 'ফাওয়াইলুল লিলমুসাল্লীন',
  '107:5': 'আল্লাযীনা হুম \'আন সালাতিহিম সাহূন',
  '107:6': 'আল্লাযীনা হুম ইউরা-ঊন',
  '107:7': 'ওয়া ইয়ামনা\'ঊনাল মা\'ঊন',

  // Surah 108: Al-Kawthar
  '108:1': "ইন্না আ'তাইনা-কাল কাওসার",
  '108:2': 'ফাসাল্লি লিরাব্বিকা ওয়ানহার',
  '108:3': 'ইন্না শানি\'আকা হুওয়াল আবতার',

  // Surah 109: Al-Kafirun
  '109:1': 'কুল ইয়া আইয়্যুহাল কাফিরূন',
  '109:2': "লা আ'বুদু মা তা'বুদূন",
  '109:3': "ওয়ালা আনতুম 'আবিদূনা মা আ'বুদ",
  '109:4': "ওয়ালা আনা 'আবিদুম মা 'আবাত্তুম",
  '109:5': "ওয়ালা আনতুম 'আবিদূনা মা আ'বুদ",
  '109:6': 'লাকুম দীনুকুম ওয়ালিয়া দীন',

  // Surah 110: An-Nasr
  '110:1': 'ইযা জা-আ নাসরুল্লাহি ওয়াল ফাতহ',
  '110:2': 'ওয়া রায়াইতান নাসা ইয়াদখুলূনা ফী দীনিল্লাহি আফওয়াজা',
  '110:3': 'ফাসাব্বিহ বিহামদি রাব্বিকা ওয়াসতাগফিরহু, ইন্নাহূ কানা তাউয়াবা',

  // Surah 111: Al-Masad
  '111:1': 'তাব্বাত ইয়াদা আবী লাহাবিঁও ওয়াতাব্ব',
  '111:2': 'মা আগনা আনহু মালুহু ওয়ামা কাসাব',
  '111:3': 'সাইয়াসলা নারান যাতা লাহাব',
  '111:4': 'ওয়ামরাআতুহু হাম্মা লাতাল হাতাব',
  '111:5': 'ফী জীদিহা হাবলুম মিম মাসাদ',

  // Surah 112: Al-Ikhlas
  '112:1': 'কুল হুওয়াল্লাহু আহাদ',
  '112:2': 'আল্লাহুস সামাদ',
  '112:3': 'লাম ইয়ালিদ ওয়া লাম ইউলাদ',
  '112:4': 'ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ',

  // Surah 113: Al-Falaq
  '113:1': 'কুল আউযু বিরাব্বিল ফালাক',
  '113:2': 'মিন শাররি মা খালাক',
  '113:3': 'ওয়া মিন শাররি গাসিকিন ইযা ওয়াকাব',
  '113:4': 'ওয়া মিন শাররিন নাফ্ফাছাতি ফিল উকাদ',
  '113:5': 'ওয়া মিন শাররি হাসিদিন ইযা হাসাদ',

  // Surah 114: An-Nas
  '114:1': 'কুল আউযু বিরাব্বিন নাস',
  '114:2': 'মালিকিন নাস',
  '114:3': 'ইলাহিন নাস',
  '114:4': 'মিন শাররিল ওয়াসওয়াসিল খান্নাস',
  '114:5': 'আল্লাযী ইউওয়াসউিসু ফী সুদূরিন নাস',
  '114:6': 'মিনাল জিন্নাতি ওয়ান নাস',
};

/** Common Arabic Quranic phrases and vocabulary to authentic Bengali phonetics. */
const WORD_REPLACEMENTS: readonly [RegExp, string][] = [
  [/بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/g, 'বিসমিল্লাহির রাহমানির রাহিম'],
  [/ٱللَّهُ/g, 'আল্লাহু'],
  [/ٱللَّهِ/g, 'আল্লাহি'],
  [/ٱللَّهَ/g, 'আল্লা-হা'],
  [/لِلَّهِ/g, 'লিল্লাহি'],
  [/وَٱللَّهُ/g, 'ওয়াল্লাহু'],
  [/وَٱللَّهِ/g, 'ওয়াল্লাহি'],
  [/وَٱللَّهَ/g, 'ওয়াল্লা-হা'],
  [/فَٱللَّهُ/g, 'ফাল্লাহু'],
  [/بِٱللَّهِ/g, 'বিল্লাহি'],
  [/إِنَّ ٱللَّهَ/g, 'ইন্নাল্লা-হা'],
  [/رَسُولُ ٱللَّهِ/g, 'রাসূলুল্লাহ'],
  [/رَسُولِ ٱللَّهِ/g, 'রাসূলিল্লাহ'],
  [/رَبِّ ٱلْعَٰلَمِينَ/g, "রাব্বিল আ'লামীন"],
  [/ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/g, 'আর-রাহমানির রাহিম'],
  [/يَوْمِ ٱلدِّينِ/g, 'ইয়াওমিদ্দীন'],
  [/ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ/g, 'আস-সিরাতাল মুসতাকীম'],
  [/ٱلَّذِينَ/g, 'আল্লাযীনা'],
  [/ٱلَّذِى/g, 'আল্লাযী'],
  [/ٱلَّتِى/g, 'আল্লাতী'],
  [/أَنْعَمْتَ/g, "আন'আমতা"],
  [/عَلَيْهِمْ/g, 'আলাইহিম'],
  [/عَلَيْهِ/g, 'আলাইহি'],
  [/عَلَيْهَا/g, 'আলাইহা'],
  [/إِلَيْهِمْ/g, 'ইলাইহিম'],
  [/إِلَيْهِ/g, 'ইলাইহি'],
  [/مِنْ دُونِ ٱللَّهِ/g, 'মিন দূনিল্লাহ'],
  [/سُبْحَٰنَ ٱللَّهِ/g, 'সুবহানাল্লাহ'],
  [/الْحَمْدُ لِلَّهِ/g, 'আলহামদু লিল্লাহ'],
  [/ٱلْحَمْدُ لِلَّهِ/g, 'আলহামদু লিল্লাহ'],
  [/لَا إِلَٰهَ إِلَّا ٱللَّهُ/g, 'লা ইলাহা ইল্লাল্লাহ'],
  [/أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ/g, 'আশহাদু আল লা ইলাহা ইল্লাল্লাহ'],
  [/مُحَمَّدٌ رَسُولُ ٱللَّهِ/g, 'মুহাম্মাদুর রাসূলুল্লাহ'],
];

/**
 * Phonetic mapping from Arabic letters and diacritics to Bengali script.
 */
@Injectable({ providedIn: 'root' })
export class QuranPronunciationService {
  /**
   * Returns authentic Bengali phonetic pronunciation (উচ্চারণ) for any ayah.
   * Uses verified canonical mappings where available, and deterministic Tajweed
   * phonetic transliteration for all other ayahs.
   */
  getPronunciation(surahNumber: number, ayahNumber: number, arabicText?: string): string {
    const key = `${surahNumber}:${ayahNumber}`;
    const canonical = CANONICAL_PRONUNCIATIONS[key];
    if (canonical) {
      return canonical;
    }

    if (!arabicText || !arabicText.trim()) {
      return '';
    }

    return this.transliterate(arabicText);
  }

  /**
   * Pronunciation of the Bismillah heading.
   */
  getBismillahPronunciation(): string {
    return 'বিসমিল্লাহির রাহমানির রাহিম';
  }

  /**
   * Checks whether a canonical verified pronunciation exists for the ayah.
   */
  hasCanonical(surahNumber: number, ayahNumber: number): boolean {
    return `${surahNumber}:${ayahNumber}` in CANONICAL_PRONUNCIATIONS;
  }

  /**
   * Converts vocalized Arabic Uthmani text with diacritics into natural Bengali phonetic spelling.
   */
  transliterate(arabicText: string): string {
    if (!arabicText) return '';

    // Step 1: Strip Quranic stop/sajda/pause markers (U+06D6 - U+06ED, U+0615 - U+061A, etc.)
    let text = arabicText
      .replace(/[\u0610-\u061A\u06D6-\u06ED\u06E9\u06E4\uFE70-\uFEFC]/g, '')
      .trim();

    // Step 2: Apply high-frequency whole-expression substitutions
    for (const [pattern, replacement] of WORD_REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }

    // If already fully Bengali, return directly
    if (/^[\u0980-\u09FF\s,.'!?-]+$/.test(text)) {
      return text;
    }

    // Step 3: Split into words and convert remaining Arabic tokens
    const words = text.split(/\s+/);
    const convertedWords = words.map((word) => this.transliterateWord(word));

    return convertedWords.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  private transliterateWord(word: string): string {
    // If the word has already been converted to Bengali, keep it
    if (/^[\u0980-\u09FF,.'!?-]+$/.test(word)) {
      return word;
    }

    // Solar letter assimilation for words starting with ٱل or ال
    // ت ث د ذ ر ز س ش ص ض ط ظ ل ن
    const solarMatch = word.match(/^[ٱا]ل([تثدذرserviceزسشصضطظلن])\u0651/);
    if (solarMatch) {
      const solarChar = solarMatch[1];
      const rest = word.slice(3); // skip ٱل + solar char
      const solarBn = this.mapConsonant(solarChar);
      return 'আ' + solarBn + '-' + this.transliterateToken(solarChar + rest);
    }

    // Lunar letter prefix ٱل
    if (word.startsWith('ٱلْ') || word.startsWith('الْ') || word.startsWith('ٱل') || word.startsWith('ال')) {
      const rest = word.replace(/^[ٱا]لْ?/, '');
      return 'আল-' + this.transliterateToken(rest);
    }

    return this.transliterateToken(word);
  }

  private transliterateToken(token: string): string {
    let result = '';
    const chars = Array.from(token);

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const next = chars[i + 1] || '';
      const next2 = chars[i + 2] || '';

      // Check Shaddah on current or next
      const hasShaddah = next === '\u0651' || next2 === '\u0651';

      // Check vowels attached
      let vowel = '';
      if (next === '\u064E' || next2 === '\u064E') vowel = 'a'; // Fatha
      else if (next === '\u0650' || next2 === '\u0650') vowel = 'i'; // Kasra
      else if (next === '\u064F' || next2 === '\u064F') vowel = 'u'; // Damma
      else if (next === '\u064B' || next2 === '\u064B') vowel = 'an'; // Fathatan
      else if (next === '\u064D' || next2 === '\u064D') vowel = 'in'; // Kasratan
      else if (next === '\u064C' || next2 === '\u064C') vowel = 'un'; // Dammatan
      else if (next === '\u0670' || next2 === '\u0670') vowel = 'aa'; // Dagger Alif
      else if (next === '\u0652' || next2 === '\u0652') vowel = 'sukun'; // Sukun

      // Skip diacritic marks as primary iterations
      if (this.isDiacritic(ch)) {
        continue;
      }

      // Map consonant
      const bnConsonant = this.mapConsonant(ch);
      if (!bnConsonant) {
        // Unknown or punctuation
        if (/[\u0980-\u09FFa-zA-Z,.'!?-]/.test(ch)) {
          result += ch;
        }
        continue;
      }

      // If shaddah is present, double the consonant
      const doubled = hasShaddah ? bnConsonant + bnConsonant : bnConsonant;

      // Attach Bengali vowel sign
      switch (vowel) {
        case 'a':
          result += (result.length === 0 && (ch === 'ا' || ch === 'أ' || ch === 'ٱ' || ch === 'ع')) ? 'আ' : doubled + 'া';
          break;
        case 'i':
          result += (result.length === 0 && (ch === 'ا' || ch === 'إ' || ch === 'ٱ' || ch === 'ع')) ? 'ই' : doubled + 'ি';
          break;
        case 'u':
          result += (result.length === 0 && (ch === 'ا' || ch === 'أ' || ch === 'ٱ' || ch === 'ع' || ch === 'ؤ')) ? 'উ' : doubled + 'ু';
          break;
        case 'an':
          result += doubled + 'ান';
          break;
        case 'in':
          result += doubled + 'িন';
          break;
        case 'un':
          result += doubled + 'ুন';
          break;
        case 'aa':
          result += doubled + 'া';
          break;
        case 'sukun':
          result += doubled + '্';
          break;
        default:
          // In Arabic without explicit vowel or end of word:
          // If followed by long vowel alif, waw, ya
          if (next === 'ا' || next === 'ى' || next === 'آ') {
            result += doubled + 'া';
            i++; // consume alif
          } else if (next === 'و' && !this.hasVowel(next2)) {
            result += doubled + 'ূ';
            i++;
          } else if (next === 'ي' && !this.hasVowel(next2)) {
            result += doubled + 'ী';
            i++;
          } else {
            result += doubled;
          }
          break;
      }
    }

    // Clean up trailing awkward hasantas or duplicate vowels
    return result
      .replace(/্$/, '')
      .replace(/াা+/g, 'া')
      .replace(/িী+/g, 'ী')
      .replace(/ুূ+/g, 'ূ');
  }

  private isDiacritic(ch: string): boolean {
    const code = ch.charCodeAt(0);
    return (code >= 0x064B && code <= 0x065F) || code === 0x0670;
  }

  private hasVowel(ch: string): boolean {
    if (!ch) return false;
    const code = ch.charCodeAt(0);
    return (code >= 0x064B && code <= 0x0652) || code === 0x0670;
  }

  private mapConsonant(ch: string): string {
    switch (ch) {
      case 'ء':
      case 'آ':
      case 'أ':
      case 'إ':
      case 'ئ':
      case 'ؤ':
      case 'ا':
      case 'ٱ':
      case 'ى':
        return 'আ';
      case 'ب':
        return 'ব';
      case 'ت':
      case 'ة':
        return 'ত';
      case 'ث':
        return 'ছ';
      case 'ج':
        return 'জ';
      case 'ح':
        return 'হ';
      case 'خ':
        return 'খ';
      case 'د':
        return 'দ';
      case 'ذ':
        return 'য';
      case 'ر':
        return 'র';
      case 'ز':
        return 'য';
      case 'س':
        return 'স';
      case 'ش':
        return 'শ';
      case 'ص':
        return 'ছ';
      case 'ض':
        return 'দ';
      case 'ط':
        return 'ত';
      case 'ظ':
        return 'য';
      case 'ع':
        return "আ";
      case 'غ':
        return 'গ';
      case 'ف':
        return 'ফ';
      case 'ق':
      case 'ك':
        return 'ক';
      case 'ل':
        return 'ল';
      case 'م':
        return 'ম';
      case 'ن':
        return 'ন';
      case 'ه':
        return 'হ';
      case 'و':
        return 'ওয়';
      case 'ي':
        return 'ইয়';
      default:
        return '';
    }
  }
}
