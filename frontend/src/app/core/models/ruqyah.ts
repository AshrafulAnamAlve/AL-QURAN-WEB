export type RuqyahCategory = 'all' | 'shifa' | 'nazar' | 'sihr' | 'anxiety' | 'daily';

export interface RuqyahCategoryMeta {
  readonly id: RuqyahCategory;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly icon: string;
  readonly descriptionBn: string;
}

export interface RuqyahItem {
  readonly id: string;
  readonly category: RuqyahCategory;
  readonly titleBn: string;
  readonly titleEn: string;
  readonly arabic: string;
  readonly pronunciationBn: string;
  readonly translationBn: string;
  readonly translationEn: string;
  readonly reference: string;
  readonly targetCount: number;
  readonly instructionsBn: string;
}

export interface RuqyahAudioTrack {
  readonly id: string;
  readonly reciterBn: string;
  readonly reciterEn: string;
  readonly titleBn: string;
  readonly titleEn: string;
  readonly duration: string;
  readonly audioUrl: string;
  readonly descriptionBn: string;
}

export interface RuqyahGuideRule {
  readonly titleBn: string;
  readonly titleEn: string;
  readonly contentBn: string;
  readonly bulletPointsBn: readonly string[];
}

export const RUQYAH_CATEGORIES: readonly RuqyahCategoryMeta[] = [
  {
    id: 'all',
    nameBn: 'সব রুকইয়াহ',
    nameEn: 'All Ruqyah',
    icon: '🛡️',
    descriptionBn: 'পবিত্র কুরআন ও সহিহ হাদিসের সকল আয়াত ও দু’আ',
  },
  {
    id: 'shifa',
    nameBn: 'শারীরিক শিফা ও রোগমুক্তি',
    nameEn: 'Physical Healing',
    icon: '🤲',
    descriptionBn: 'শারীরিক অসুস্থতা, জ্বর ও ব্যথা থেকে আরোগ্যের দু’আ',
  },
  {
    id: 'nazar',
    nameBn: 'বদনজর ও হিংসা থেকে মুক্তি',
    nameEn: 'Evil Eye & Envy',
    icon: '👁️',
    descriptionBn: 'মানুষের কুদৃষ্টি (আইন) ও হিংসার অনিষ্ট কাটানোর আমল',
  },
  {
    id: 'sihr',
    nameBn: 'যাদু ও শয়তানের অনিষ্ট',
    nameEn: 'Protection & Sihr',
    icon: '⚡',
    descriptionBn: 'সিহর, কালো যাদু ও জিন-শয়তানের কুপ্রভাব বিনাশের আয়াত',
  },
  {
    id: 'anxiety',
    nameBn: 'মানসিক অশান্তি ও অনিদ্রা',
    nameEn: 'Anxiety & Sleep',
    icon: '🕊️',
    descriptionBn: 'হতাশা, বিষণ্ণতা, ভয় ও ঘুমের সমস্যা দূর করার যিকির',
  },
  {
    id: 'daily',
    nameBn: 'দৈনিক সকাল-সন্ধ্যার আমল',
    nameEn: 'Daily Protection',
    icon: '🌅',
    descriptionBn: 'প্রতিদিন ও ঘুমানোর আগে সার্বক্ষণিক সুরক্ষার মাসনূন আমল',
  },
];

export const RUQYAH_AUDIO_TRACKS: readonly RuqyahAudioTrack[] = [
  {
    id: 'mishary-ruqyah',
    reciterBn: 'শায়খ মিশারি রাশিদ আল-আফাসি',
    reciterEn: 'Sheikh Mishary Rashid Alafasy',
    titleBn: 'পূর্ণাঙ্গ রুকইয়াহ আশ-শারইয়াহ',
    titleEn: 'Comprehensive Ruqyah Shariah',
    duration: '১ ঘণ্টা ১৩ মি.',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Mishary%20Rashid%20Al%20Fasy.mp3',
    descriptionBn: 'বিশ্বব্যাপী সর্বাধিক জনপ্রিয় ও সর্বজনীন বিশুদ্ধ রুকইয়াহ তিলাওয়াত।',
  },
  {
    id: 'ghamdi-ruqyah',
    reciterBn: 'শায়খ সা’দ আল-গামদি',
    reciterEn: 'Sheikh Saad Al-Ghamdi',
    titleBn: 'শক্তিশালী রুকইয়াহ তিলাওয়াত',
    titleEn: 'Powerful Ruqyah Recitation',
    duration: '১ ঘণ্টা ১ মি.',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Saad%20Al%20Ghamdi.mp3',
    descriptionBn: 'বদনজর ও যে কোনো অনিষ্ট দূরীকরণে অত্যন্ত প্রভাবশালী সুর ও তিলাওয়াত।',
  },
  {
    id: 'ajmy-ruqyah',
    reciterBn: 'শায়খ আহমদ আল-আজমি',
    reciterEn: 'Sheikh Ahmed Al-Ajmy',
    titleBn: 'সিহর ও কুপ্রভাব বিনাশক রুকইয়াহ',
    titleEn: 'Ruqyah against Sihr & Harm',
    duration: '১ ঘণ্টা ৫ মি.',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20by%20Sheikh%20Ahmed%20Bin%20Ali%20Al-Ajamy.mp3',
    descriptionBn: 'কালো যাদু ও শয়তানের অনিষ্ট থেকে পরিত্রাণে গভীর ও বলিষ্ঠ তিলাওয়াত।',
  },
  {
    id: 'abkar-ruqyah',
    reciterBn: 'শায়খ ইদ্রিস আবকার',
    reciterEn: 'Sheikh Idrees Abkar',
    titleBn: 'প্রশান্তিদায়ক ভাবগাম্ভীর্যপূর্ণ রুকইয়াহ',
    titleEn: 'Soul-soothing Deep Ruqyah',
    duration: '১ ঘণ্টা ১৭ মি.',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Idrees%20Abkar.mp3',
    descriptionBn: 'মানসিক উৎকণ্ঠা ও অন্তরের ভারী অবস্থা নিরাময়ে অত্যন্ত হৃদয়গ্রাহী তিলাওয়াত।',
  },
  {
    id: 'muaiqly-ruqyah',
    reciterBn: 'শায়খ মাহের আল-মুআইক্বলী',
    reciterEn: 'Sheikh Maher Al-Muaiqly',
    titleBn: 'সংক্ষিপ্ত প্রভাব বিস্তারকারী রুকইয়াহ',
    titleEn: 'Concise & Impactful Ruqyah',
    duration: '৩৮ মি.',
    audioUrl: 'https://archive.org/download/al-ruqyah/Al%20Ruqyah%20Al%20Shariah%20Full%20By%20Sheikh%20Maher%20Al%20Muaiqly.mp3',
    descriptionBn: 'মসজিদুল হারামের ইমামের কণ্ঠে সংক্ষিপ্ত ও প্রয়োজনীয় রুকইয়াহ আয়াতসমূহ।',
  },
  {
    id: 'live-radio-ruqyah',
    reciterBn: 'এমপি৩কুরআন সার্বক্ষণিক রেডিও',
    reciterEn: 'MP3Quran 24/7 Live Ruqyah',
    titleBn: '২৪/৭ লাইভ রুকইয়াহ স্ট্রিমিং',
    titleEn: '24/7 Continuous Live Ruqyah',
    duration: 'লাইভ',
    audioUrl: 'https://backup.qurango.net/radio/roqiah',
    descriptionBn: 'বাসায় বা শোয়ার ঘরে সার্বক্ষণিক রুকইয়াহ তিলাওয়াত চালু রাখার জন্য লাইভ রেডিও।',
  },
];

export const RUQYAH_ITEMS: readonly RuqyahItem[] = [
  // --- SHIFA / PHYSICAL HEALING ---
  {
    id: 'fatihah-shifa',
    category: 'shifa',
    titleBn: 'সূরা আল-ফাতিহা (উম্মুল কিতাব ও আশ-শিফা)',
    titleEn: 'Surah Al-Fatihah (The Mother of Book & Healing)',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    pronunciationBn: 'বিসমিল্লাহির রহমানির রহীম। আলহামদু লিল্লাহি রব্বিল আলামীন। আর-রহমানির রহীম। মালিকি ইয়াওমিদ্দীন। ইয়্যাকা না’বুদু ওয়া ইয়্যাকা নাস্তাঈন। ইহদিনাস সিরাতাল মুস্তাক্বীম। সিরাতাল্লাযীনা আন’আমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ্দাল্লীন।',
    translationBn: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু। সমস্ত প্রশংসা আল্লাহর যিনি সৃষ্টিজগতের প্রতিপালক। যিনি পরম করুণাময় ও অতি দয়ালু। বিচার দিবসের মালিক। আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই সাহায্য প্রার্থনা করি। আমাদের সরল পথ প্রদর্শন করুন। তাদের পথ, যাদের আপনি অনুগ্রহ করেছেন; তাদের পথ নয় যারা ক্রোধের শিকার এবং পথভ্রষ্টও নয়।',
    translationEn: 'In the name of Allah, Most Gracious, Ever Merciful. All praise belongs to Allah, Lord of all the worlds. The Most Gracious, the Ever Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path. The path of those upon whom You have bestowed favors, not of those who have earned wrath, nor of those who go astray.',
    reference: 'সূরা আল-ফাতিহা (১-৭) | সহিহ বুখারী: ৫৭৩৬',
    targetCount: 7,
    instructionsBn: 'ব্যথার স্থানে ডান হাত রেখে অথবা পরিষ্কার পানির পাত্রে ৭ বার পাঠ করে মৃদু ফুঁ দিয়ে পান করুন।',
  },
  {
    id: 'prophetic-pain-relief',
    category: 'shifa',
    titleBn: 'শরীরের যে কোনো ব্যথার জন্য রাসূলুল্লাহ (ﷺ)-এর নির্দেশিত দু’আ',
    titleEn: 'Prophetic Supplication for Physical Pain',
    arabic: 'بِاسْمِ اللَّهِ (ثَلَاثًا)، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (سَبْعَ مَرَّاتٍ)',
    pronunciationBn: 'বিসমিল্লাহ (৩ বার)। আউযু বিল্লাহি ওয়া কুদরাতিহী মিন শাররি মা আজিদু ওয়া উহাযিরু (৭ বার)।',
    translationBn: 'আল্লাহর নামে (৩ বার)। আমি আল্লাহর কাছে এবং তাঁর কুদরতের আশ্রয় চাই, যা কিছু আমি অনুভব করছি এবং যে অনিষ্টের আশঙ্কা করছি তা থেকে (৭ বার)।',
    translationEn: 'In the Name of Allah (3 times). I seek refuge in Allah and in His power from the evil of what I find and of what I fear (7 times).',
    reference: 'সহিহ মুসলিম: ২২০২',
    targetCount: 7,
    instructionsBn: 'যে স্থানে ব্যথা অনুভব করছেন সেখানে ডান হাত রাখুন। প্রথমে তিনবার ‘বিসমিল্লাহ’ বলুন, তারপর সাতবার পুরো দু’আটি পড়ুন।',
  },
  {
    id: 'prophetic-shifa-dua',
    category: 'shifa',
    titleBn: 'রোগমুক্তির সর্বজনীন মাসনূন দু’আ (আযহিবিল বা’স)',
    titleEn: 'Prophetic Universal Dua for the Sick',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    pronunciationBn: 'আল্লাহুম্মা রব্বান-নাস, আযহিবিল বা’সা, ইশফি ওয়া আনতাশ-শাফী, লা শিফাআ ইল্লা শিফাউকা, শিফাআন লা ইয়ুগাদিরু সাক্বামা।',
    translationBn: 'হে আল্লাহ! মানবজাতির প্রতিপালক! কষ্ট দূর করে দিন, আরোগ্য দান করুন। আপনিই প্রকৃত শিফাদাতা, আপনার শিফা ব্যতীত কোনো শিফা নেই; এমন আরোগ্য দান করুন যা কোনো রোগ অবশিষ্ট রাখে না।',
    translationEn: 'O Allah, the Lord of mankind, remove the disorder and heal, for You are the Healer. There is no healing but by Your cure, a cure which leaves behind no disease.',
    reference: 'সহিহ বুখারী: ৫৭৪৩, সহিহ মুসলিম: ২১৯১',
    targetCount: 3,
    instructionsBn: 'রোগীর গায়ে ডান হাত বুলিয়ে অথবা নিজের বুকে হাত রেখে ৩ বার এই দু’আ পাঠ করুন।',
  },
  {
    id: 'severe-illness-dua',
    category: 'shifa',
    titleBn: 'কঠিন রোগ ও অসুস্থতায় আরোগ্যের দু’আ',
    titleEn: 'Supplication for Critical Illness (7 Times)',
    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    pronunciationBn: 'আসআলুল্লাহাল আযীম, রব্বাল আরশিল আযীম, আঁই ইয়াশফিয়াক।',
    translationBn: 'আমি মহান আরশের মালিক মহান আল্লাহর কাছে প্রার্থনা করছি যেন তিনি আপনাকে পূর্ণ সুস্থতা দান করেন।',
    translationEn: 'I ask Allah the Almighty, Lord of the Magnificent Throne, to cure you.',
    reference: 'সুনানে আবু দাউদ: ৩১০৬, তিরমিযী: ২০৮৩ (সহিহ)',
    targetCount: 7,
    instructionsBn: 'রাসূলুল্লাহ (ﷺ) বলেছেন: কোনো মুসলিম রোগীকে দেখতে গিয়ে এই দু’আ ৭ বার পড়লে আল্লাহ তাকে সুস্থতা দান করবেন। (নিজের ক্ষেত্রে ‘ইয়াশফিয়ানী’ বলা যায়)।',
  },

  // --- NAZAR / EVIL EYE ---
  {
    id: 'jibril-ruqyah',
    category: 'nazar',
    titleBn: 'জিবরাঈল (আঃ) কর্তৃক রাসূলুল্লাহ (ﷺ)-এর ওপর রুকইয়াহ',
    titleEn: 'Ruqyah of Angel Jibril for the Prophet',
    arabic: 'بِاسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِاسْمِ اللَّهِ أَرْقِيكَ',
    pronunciationBn: 'বিসমিল্লাহি আরক্বীক, মিন কুল্লি শাইয়িন ইউ’যীক, মিন শাররি কুল্লি নাফসিন আও ‘আইনি হাসিদিন, আল্লাহু ইয়াশফীক, বিসমিল্লাহি আরক্বীক।',
    translationBn: 'আল্লাহর নামে আমি আপনাকে রুকইয়াহ (ঝাড়ফুঁক) করছি এমন সব কিছু থেকে যা আপনাকে কষ্ট দেয়, আর প্রত্যেক হিংসুক আত্মার অথবা বদনজরের অনিষ্ট থেকে। আল্লাহ আপনাকে সুস্থতা দিন, আল্লাহর নামে আমি আপনাকে রুকইয়াহ করছি।',
    translationEn: 'In the name of Allah I perform Ruqyah for you, from everything that harms you, from the evil of every soul or envious eye. May Allah heal you. In the name of Allah I perform Ruqyah for you.',
    reference: 'সহিহ মুসলিম: ২১৮৬',
    targetCount: 3,
    instructionsBn: 'বদনজরে আক্রান্ত ব্যক্তির ওপর ৩ বার পাঠ করে মৃদু ফুঁ দিন (নিজের ওপর পড়লে ‘আরক্বী নাফসী’ পড়া যায়)।',
  },
  {
    id: 'nazar-kalimatillah',
    category: 'nazar',
    titleBn: 'বদনজর ও বিষাক্ত প্রাণীর ক্ষতি থেকে রক্ষার দু’আ',
    titleEn: 'Protection from Evil Eye & Harmful Creatures',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    pronunciationBn: 'আউযু বিকালিমা-তিল্লাহিত-তাম্মাতি মিন কুল্লি শায়তানিন ওয়া হাম্মাহ, ওয়া মিন কুল্লি আইনিন লাম্মাহ।',
    translationBn: 'আমি আল্লাহর পরিপূর্ণ বাণীসমূহের উসিলায় আশ্রয় প্রার্থনা করছি সকল শয়তান ও বিষাক্ত ক্ষতিকর প্রাণী থেকে এবং প্রত্যেক ক্ষতিকারক বদনজর থেকে।',
    translationEn: 'I seek refuge in the Perfect Words of Allah from every devil and poisonous reptile, and from every evil envious eye.',
    reference: 'সহিহ বুখারী: ৩৩৭১',
    targetCount: 3,
    instructionsBn: 'রাসূলুল্লাহ (ﷺ) হাসান ও হুসাইন (রাঃ)-কে এই দু’আ পড়ে ফুঁ দিতেন। শিশুদের ও পরিবারের জন্য ৩ বার পাঠ করুন।',
  },
  {
    id: 'surah-qalam-nazar',
    category: 'nazar',
    titleBn: 'সূরা আল-কলম (কুষ্টি ও বদনজর বিনাশক আয়াত)',
    titleEn: 'Surah Al-Qalam (Averting the Evil Eye)',
    arabic: 'وَإِنْ يَكَادُ الَّذِينَ كَفَرُوا لَيُزْلِقُونَكَ بِأَبْصَارِهِمْ لَمَّا سَمِعُوا الذِّكْرَ وَيَقُولُونَ إِنَّهُ لَمَجْنُونٌ ۝ وَمَا هُوَ إِلَّا ذِكْرٌ لِلْعَالَمِينَ',
    pronunciationBn: 'ওয়া ইঁইয়া-কাদুল্লাযীনা কাফারূ লাইউযলিকূনাকা বিআবসারীহিম লাম্মা সামিউয যিকরা ওয়া ইয়াকূলূনা ইন্নাহূ লামাজনূন। ওয়া মা হুওয়া ইল্লা যিকরুল লিল-আলামীন।',
    translationBn: 'আর কাফেররা যখন কুরআন শ্রবণ করে, তখন মনে হয় যেন তারা তাদের ক্রুদ্ধ দৃষ্টি দ্বারা আপনাকে আছড়ে ফেলে দেবে; আর তারা বলে: নিশ্চয় সে তো এক উন্মাদ। অথচ এ কুরআন তো বিশ্বজগতের জন্য এক মহান উপদেশ ছাড়া আর কিছুই নয়।',
    translationEn: 'And indeed, those who disbelieve would almost make you slip with their eyes when they hear the message, and they say: Indeed, he is mad. But it is not except a reminder to the worlds.',
    reference: 'সূরা আল-কলম (৬৮: ৫১-৫২)',
    targetCount: 3,
    instructionsBn: 'কারো অতিরিক্ত প্রশংসার পর শরীরে ক্লান্তি বা ভারী লাগলে ৩ বার এই আয়াত তিলাওয়াত করুন।',
  },

  // --- SIHR & PROTECTION ---
  {
    id: 'ayatul-kursi',
    category: 'sihr',
    titleBn: 'আয়াতুল কুরসী (সর্বশ্রেষ্ঠ আয়াত ও শয়তান প্রতিরোধী দুর্গ)',
    titleEn: 'Ayat al-Kursi (The Throne Verse - Ultimate Protection)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    pronunciationBn: 'আল্লাহু লা ইলাহা ইল্লা হুয়াল হাইয়্যুল ক্বাইয়্যূম। লা তা’খুযুহু সিনাতুঁও ওয়ালা নাওম। লাহূ মা ফিস সামাওয়াতি ওয়ামা ফিল আরদ। মান যাল্লাযী ইয়াশফা’উ ইনদাহূ ইল্লা বিইযনিহ। ইয়া’লামু মা বাইনা আইদীহিম ওয়ামা খালফাহুম, ওয়ালা ইউহীতূনা বিশাইয়িম মিন ইলমিহী ইল্লা বিমা শা-আ। ওয়াসিআ কুরসিয়্যুহুস সামাওয়াতি ওয়াল আরদ, ওয়ালা ইয়াউদুহু হিফজুহুমা, ওয়া হুয়াল আলিয়্যুল আযীম।',
    translationBn: 'আল্লাহ, তিনি ছাড়া কোনো সত্য ইলাহ নেই। তিনি চিরঞ্জীব, সর্বসত্তার ধারক। তাঁকে তন্দ্রাও স্পর্শ করে না, নিদ্রাও নয়। আসমানসমূহে যা কিছু রয়েছে এবং যমীনে যা কিছু রয়েছে সবই তাঁর। কে সেই ব্যক্তি যে তাঁর অনুমতি ছাড়া তাঁর নিকট সুপারিশ করবে? তাদের সম্মুখে ও পশ্চাতে যা কিছু আছে তিনি তা জানেন। তাঁর ইচ্ছার বাইরে তাঁর জ্ঞানের কিছুই তারা আয়ত্ত করতে পারে না। তাঁর কুরসী আসমানসমূহ ও যমীন পরিবেষ্টন করে আছে। এ দুটোর রক্ষণাবেক্ষণ তাঁকে বিন্দুমাত্র ক্লান্ত করে না। তিনি সুউচ্চ, সর্বশ্রেষ্ঠ।',
    translationEn: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
    reference: 'সূরা আল-বাক্বারাহ (২: ২৫৫) | সহিহ বুখারী: ২৩১১',
    targetCount: 1,
    instructionsBn: 'ঘুমানোর পূর্বে তিলাওয়াত করলে সারারাত আল্লাহর পক্ষ থেকে একজন নিরাপত্তাকারী ফেরেশতা নিয়োজিত থাকে এবং শয়তান কাছে ঘেঁষতে পারে না।',
  },
  {
    id: 'amanar-rasul',
    category: 'sihr',
    titleBn: 'সূরা আল-বাক্বারাহর শেষ দুই আয়াত (নিরাপত্তার জন্য যথেষ্ট)',
    titleEn: 'Last Two Verses of Surah Al-Baqarah',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    pronunciationBn: 'আ-মানার রাসূলু বিমা উনযিলা ইলাইহি মির রব্বিহী ওয়াল মু’মিনূন। কুল্লুন আমানা বিল্লাহি ওয়া মালাইকাতিহী ওয়া কুতুবিহী ওয়া রুসুলিহ, লা নুফাররিকু বাইনা আহাদিম মির রুসুলিহ। ওয়া কালূ সামি’না ওয়া আত্বা’না গুফরানাকা রব্বানা ওয়া ইলাইকাল মাছীর। লা ইউকাল্লিফুল্লাহু নাফসান ইল্লা উস’আহা, লাহা মা কাসাবাত ওয়া আলাইহা মাকতাসাবাত। রব্বানা লা তুআখিযনা ইন নাসীনা আও আখত্বা’না, রব্বানা ওয়ালা তাহমিল আলাইনা ইছরান কামা হামালতাহূ আলাল্লাযীনা মিন ক্বাবলিনা। রব্বানা ওয়ালা তুহাম্মিলনা মা লা ত্বাক্বাতা লানা বিহ, ওয়া’ফু আন্না ওয়াগফির লানা ওয়ারহামনা, আনতা মাওলানা ফানছুরনা আলাল ক্বাওমিল কাফিরীন।',
    translationBn: 'রাসূল তাঁর প্রতিপালকের পক্ষ থেকে যা অবতীর্ণ হয়েছে তার ওপর ঈমান এনেছেন এবং মুমিনগণও। তারা সকলেই ঈমান এনেছে আল্লাহর প্রতি, তাঁর ফেরেশতাগণের প্রতি, তাঁর কিতাবসমূহের প্রতি এবং তাঁর রাসূলগণের প্রতি। তারা বলে: আমরা তাঁর রাসূলগণের মধ্যে কারও মধ্যে কোনো পার্থক্য করি না। তারা আরও বলে: আমরা শুনেছি এবং আনুগত্য করেছি; হে আমাদের প্রতিপালক! আপনার ক্ষমা চাই এবং আপনার দিকেই প্রত্যাবর্তনস্থল। আল্লাহ কোনো ব্যক্তিকে তার সাধ্যের বাইরে দায়িত্ব দেন না। সে যা অর্জন করে তা তারই জন্য এবং সে যা অন্যায় করে তা তার ওপরই বর্তাবে। হে আমাদের প্রতিপালক! যদি আমরা ভুলে যাই কিংবা ভুল করি তবে আমাদের পাকড়াও করবেন না। হে আমাদের প্রতিপালক! আমাদের পূর্ববর্তীদের ওপর যেমন বোঝা চাপিয়ে দিয়েছিলেন আমাদের ওপর তেমন গুরুভার চাপাবেন না। হে আমাদের প্রতিপালক! যে ভার বহন করার শক্তি আমাদের নেই তা আমাদের ওপর চাপাবেন না। আমাদের ক্ষমা করুন, আমাদের মার্জনা করুন এবং আমাদের প্রতি দয়া করুন। আপনিই আমাদের অভিভাবক; সুতরাং কাফের সম্প্রদায়ের বিরুদ্ধে আমাদের সাহায্য করুন।',
    translationEn: 'The Messenger has believed in what was revealed to him from his Lord, and [so have] the believers... Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him.',
    reference: 'সূরা আল-বাক্বারাহ (২: ২৮৫-২৮৬) | সহিহ বুখারী: ৫০০৯',
    targetCount: 1,
    instructionsBn: 'রাসূলুল্লাহ (ﷺ) বলেছেন: যে ব্যক্তি রাতে এ আয়াত দুটি তিলাওয়াত করবে, তা-ই তার জন্য (সকল প্রকার অনিষ্ট থেকে রক্ষার জন্য) যথেষ্ট হবে।',
  },
  {
    id: 'sihr-yunus',
    category: 'sihr',
    titleBn: 'সূরা ইউনুস (যাদু ও সিহর বাতিল করার আয়াত)',
    titleEn: 'Surah Yunus (Nullifying Witchcraft & Magic)',
    arabic: 'فَلَمَّا أَلْقَوْا قَالَ مُوسَىٰ مَا جِئْتُمْ بِهِ السِّحْرُ ۖ إِنَّ اللَّهَ سَيُبْطِلُهُ ۖ إِنَّ اللَّهَ لَا يُصْلِحُ عَمَلَ الْمُفْسِدِينَ ۝ وَيُحِقُّ اللَّهُ الْحَقَّ بِكَلِمَاتِهِ وَلَوْ كَرِهَ الْمُجْرِمُونَ',
    pronunciationBn: 'ফালাম্মা আলকাও ক্বালা মূসা মা জি’তুম বিহিস সিহর, ইন্নাল্লাহা সাইউবত্বিলুহ, ইন্নাল্লাহা লা ইউসলিহু আমালাল মুফসিদীন। ওয়া ইউহিক্কুল্লাহুল হাক্কা বিকালিমাতিহী ওয়ালাও কারিহাল মুজরিমূন।',
    translationBn: 'অতঃপর যখন তারা নিক্ষেপ করল, মূসা বলল: তোমরা যা নিয়ে এসেছ তা তো যাদু। নিশ্চয় আল্লাহ অচিরেই তা বাতিল করে দেবেন। নিশ্চয় আল্লাহ ফাসাদ সৃষ্টিকারীদের কর্মকে সফল করেন না। আর আল্লাহ তাঁর বাণী দ্বারা সত্যকে প্রতিষ্ঠিত করেন, যদিও অপরাধীরা তা অপছন্দ করে।',
    translationEn: 'And when they had thrown, Moses said: What you have brought is magic. Indeed, Allah will expose its worthlessness. Indeed, Allah does not amend the work of corrupters. And Allah will establish the truth by His words, even if the criminals dislike it.',
    reference: 'সূরা ইউনুস (১০: ৮১-৮২)',
    targetCount: 7,
    instructionsBn: 'যাদু বা বান-টোনা নষ্ট করতে পানির পাত্রে ৭ বার তিলাওয়াত করে ফুঁ দিন এবং আক্রান্ত ব্যক্তি তা পান করবে ও গোসল করবে।',
  },

  // --- ANXIETY & SLEEP ---
  {
    id: 'yunus-anbiya-dua',
    category: 'anxiety',
    titleBn: 'হযরত ইউনুস (আঃ)-এর দোয়ায় মুক্তি (দোয়া ইউনুস)',
    titleEn: 'Dua of Prophet Yunus (Dhun-Noon) in Distress',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    pronunciationBn: 'লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নী কুনতু মিনায-যালিমীন।',
    translationBn: 'আপনি ব্যতীত কোনো সত্য ইলাহ নেই, আপনি পবিত্র ও মহান! নিশ্চয় আমি অপরাধীদের অন্তর্ভুক্ত ছিলাম।',
    translationEn: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    reference: 'সূরা আল-আম্বিয়া (২১: ৮৭) | জামে তিরমিযী: ৩৫০৫ (সহিহ)',
    targetCount: 3,
    instructionsBn: 'রাসূলুল্লাহ (ﷺ) বলেন: মাছের পেটে থাকা অবস্থায় ইউনুস (আঃ) যে দু’আ করেছিলেন, কোনো মুসলিম বিপদে পড়ে তা পাঠ করলে আল্লাহ অবশ্যই তার দু’আ কবুল করেন।',
  },
  {
    id: 'peace-heart-rad',
    category: 'anxiety',
    titleBn: 'সূরা আর-রা’দ (অন্তরের প্রশান্তি ও ভীতি দূরীকরণ)',
    titleEn: 'Surah Ar-Ra’d (Tranquility of the Heart)',
    arabic: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    pronunciationBn: 'আল্লাযীনা আমানূ ওয়া তাত্বমাইন্নু কুলূবুহুম বিযিকরিল্লাহ, আলা বিযিকরিল্লাহি তাত্বমাইন্নুল কুলূব।',
    translationBn: 'যারা ঈমান আনে এবং আল্লাহর স্মরণে যাদের অন্তর প্রশান্ত হয়; জেনে রেখো, কেবল আল্লাহর স্মরণের মাধ্যমেই অন্তরসমূহ পরম শান্তি ও তৃপ্তি লাভ করে।',
    translationEn: 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.',
    reference: 'সূরা আর-রা’দ (১৩: ২৮)',
    targetCount: 7,
    instructionsBn: 'বুকের বাঁ পাশে হাত রেখে গভীর শ্বাসের সাথে ৭ বার তিলাওয়াত করুন; ভয় ও বিষণ্ণতা কেটে মানসিক প্রশান্তি নেমে আসবে।',
  },
  {
    id: 'hasbiyallahu-la-ilaha',
    category: 'anxiety',
    titleBn: 'সকল দুশ্চিন্তা ও সংকটে যথেষ্ট হওয়ার মাসনূন দু’আ',
    titleEn: 'Sufficiency in Anxiety & Tribulation (7 Times)',
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    pronunciationBn: 'হাসবিয়াল্লাহু লা ইলাহা ইল্লা হুওয়া, আলাইহি তাওয়াক্কালতু, ওয়া হুয়া রব্বুল আরশিল আযীম।',
    translationBn: 'আল্লাহই আমার জন্য যথেষ্ট, তিনি ছাড়া কোনো সত্য উপাস্য নেই। আমি কেবল তাঁর ওপরই নির্ভর করেছি এবং তিনি মহান আরশের অধিপতি।',
    translationEn: 'Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.',
    reference: 'সূরা আত-তাওবাহ (৯: ১২৯) | সুনানে আবু দাউদ: ৫০৮১',
    targetCount: 7,
    instructionsBn: 'সকাল ও সন্ধ্যায় ৭ বার পাঠ করলে দুনিয়া ও আখেরাতের যাবতীয় চিন্তা ও উদ্বেগের জন্য আল্লাহই যথেষ্ট হয়ে যান।',
  },

  // --- DAILY PROTECTION ---
  {
    id: 'three-qul-protection',
    category: 'daily',
    titleBn: 'তিন কুল (সূরা আল-ইখলাস, আল-ফালাক, আন-নাস)',
    titleEn: 'The Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ\n\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    pronunciationBn: 'কুল হুওয়াল্লাহু আহাদ... কুল আউযু বি রব্বিল ফালাক... কুল আউযু বি রব্বিন নাস...',
    translationBn: 'বলুন: তিনিই আল্লাহ, একক ও অদ্বিতীয়... বলুন: আমি আশ্রয় প্রার্থনা করছি উষার প্রতিপালকের... বলুন: আমি আশ্রয় প্রার্থনা করছি মানবজাতির প্রতিপালকের...',
    translationEn: 'Say: He is Allah, [who is] One... Say: I seek refuge in the Lord of daybreak... Say: I seek refuge in the Lord of mankind...',
    reference: 'সূরা ইখলাস, ফালাক ও নাস | সহিহ বুখারী: ৫০১৭',
    targetCount: 3,
    instructionsBn: 'প্রতিদিন সকাল-সন্ধ্যায় ৩ বার এবং ঘুমানোর পূর্বে দুই হাত একত্র করে তাতে ফুঁ দিয়ে মাথা, মুখমণ্ডল ও শরীরের সামনের অংশে ৩ বার হাত বুলিয়ে নিন।',
  },
  {
    id: 'bismillahilladhi-la-yadurru',
    category: 'daily',
    titleBn: 'জমিন ও আসমানের কোনো কিছু ক্ষতি করতে না পারার দু’আ',
    titleEn: 'Protection from All Harm in Earth & Heavens',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    pronunciationBn: 'বিসমিল্লাহিল্লাযী লা ইয়াদুররু মা’আ ইসমিহী শাইয়ুন ফিল আরদ্বি ওয়ালা ফিস সামা-ই, ওয়া হুওয়াস সামী’উল আলীম।',
    translationBn: 'সেই আল্লাহর নামে যাঁর নামের বরকতে আসমান ও জমিনের কোনো কিছুই কোনো ক্ষতি করতে পারে না; আর তিনি সর্বশ্রোতা, সর্বজ্ঞাতা।',
    translationEn: 'In the name of Allah, with whose name nothing can cause harm on earth or in the heavens, and He is the All-Hearing, the All-Knowing.',
    reference: 'সুনানে আবু দাউদ: ৫০৮৮, জামে তিরমিযী: ৩৩৮৮ (সহিহ)',
    targetCount: 3,
    instructionsBn: 'সকালে ৩ বার এবং সন্ধ্যায় ৩ বার পাঠ করলে হঠাৎ কোনো বিপদ বা বিষাক্ত কীট-পতঙ্গ কোনো ক্ষতি করতে পারবে না।',
  },
  {
    id: 'audhu-bikalimatillah-tammati',
    category: 'daily',
    titleBn: 'আল্লাহর সৃষ্টির অনিষ্ট থেকে সার্বক্ষণিক সুরক্ষার দু’আ',
    titleEn: 'Seeking Refuge in Allah’s Perfect Words',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    pronunciationBn: 'আউযু বিকালিমা-তিল্লাহিত-তাম্মা-তি মিন শাররি মা খালাক্ব।',
    translationBn: 'আমি আল্লাহর পরিপূর্ণ বাণীসমূহের উসিলায় তাঁর সৃষ্টির সমস্ত অনিষ্ট থেকে আশ্রয় চাই।',
    translationEn: 'I seek refuge in the Perfect Words of Allah from the evil of what He has created.',
    reference: 'সহিহ মুসলিম: ২৭০৮',
    targetCount: 3,
    instructionsBn: 'সন্ধ্যায় অথবা নতুন কোনো জায়গায় অবস্থান করলে ৩ বার পাঠ করুন; সেখান থেকে প্রস্থান করা পর্যন্ত কোনো কিছু আপনার ক্ষতি করবে না।',
  },
];

export const RUQYAH_GUIDES: readonly RuqyahGuideRule[] = [
  {
    titleBn: '১. রুকইয়াহ আশ-শারইয়াহর ৩টি মূল শর্ত',
    titleEn: 'The 3 Golden Criteria of Authentic Ruqyah',
    contentBn: 'ইসলামী শরীয়াহ অনুযায়ী কোনো ঝাড়ফুঁক তখনই রুকইয়াহ আশ-শারইয়াহ হিসেবে বৈধ হয়, যখন তা নিম্নোক্ত ৩টি শর্ত পূর্ণ করে (ইমাম ইবনে হাজার আল-আসকালানী):',
    bulletPointsBn: [
      '১. তা অবশ্যই মহান আল্লাহর কালাম (পবিত্র কুরআন), তাঁর সুন্দর নামসমূহ অথবা রাসূলুল্লাহ (ﷺ) থেকে প্রমাণিত সহিহ হাদিসের দু’আ হতে হবে।',
      '২. তা স্পষ্ট আরবি ভাষায় অথবা বোধগম্য মাতৃভাষায় হতে হবে—অস্পষ্ট কোনো ভাষা, সাঙ্কেতিক বর্ণমালা বা দুর্বোধ্য কোনো মন্ত্র হওয়া যাবে না।',
      '৩. দৃঢ় বিশ্বাস রাখতে হবে যে, রুকইয়াহর নিজস্ব কোনো আরোগ্য দানের ক্ষমতা নেই; শিফা ও রোগমুক্তি দেওয়ার একক মালিক একমাত্র আল্লাহ তা’আলা।',
    ],
  },
  {
    titleBn: '২. রুকইয়াহ করার সুন্নাহ পদ্ধতি ও আদব',
    titleEn: 'Etiquettes & Step-by-Step Method',
    contentBn: 'নিজের ওপর নিজে রুকইয়াহ করা সুন্নাহ এবং সর্বোত্তম আমল:',
    bulletPointsBn: [
      'সর্বপ্রথমে অজু করে পবিত্র হওয়া এবং কিবলামুখী হয়ে বসা।',
      'একান্ত মনে তাওবাহ ও ইস্তিগফার করা এবং পূর্ণ তাওয়াক্কুল (আল্লাহর ওপর ভরসা) রাখা।',
      'ব্যথা বা কষ্টের স্থানে ডান হাত রাখা এবং স্পষ্ট আওয়াজে মনোযোগ সহকারে তিলাওয়াত করা।',
      'তিলাওয়াত শেষে নিজের বুকে ও শরীরে হালকা থুতুযুক্ত ফুঁ (নাফাস) দেওয়া।',
    ],
  },
  {
    titleBn: '৩. পানিতে ও অলিভ তেলে রুকইয়াহ করার নিয়ম',
    titleEn: 'Ruqyah on Water & Olive Oil',
    contentBn: 'সহিহ সুন্নাহ ও সালাফদের আমল দ্বারা পানিতে এবং তেলে ফুঁ দিয়ে ব্যবহার করা প্রমাণিত:',
    bulletPointsBn: [
      'একটি পরিষ্কার পানির পাত্র মুখের কাছে এনে সূরা আল-ফাতিহা, আয়াতুল কুরসী, তিন কুল তিলাওয়াত করে পানিতে ফুঁ দিন।',
      'সেই পানি প্রতিদিন ৩ বার পান করুন এবং অবশিষ্ট পানি দিয়ে গোসল করুন (গোসলের পানি নাপাক ড্রেনে না ফেলে গাছের গোড়ায় ফেলা উত্তম)।',
      'খাঁটি অলিভ অয়েল (যাইতুনের তেল)-এ একই আয়াত পড়ে ফুঁ দিয়ে রাতে ঘুমানোর আগে শরীরে মালিশ করা অত্যন্ত উপকারী।',
    ],
  },
  {
    titleBn: '৪. তাবিজ, সুতো ও কুসংস্কার থেকে কঠোর সতর্কতা',
    titleEn: 'Warning Against Amulets (Taweez) & Shirk',
    contentBn: 'ইসলামে তাবিজ, কড়া, সুতো বা কোনো নকশার ব্যবহার সম্পূর্ণভাবে নিষিদ্ধ:',
    bulletPointsBn: [
      'রাসূলুল্লাহ (ﷺ) স্পষ্টভাবে সতর্ক করেছেন: "যে ব্যক্তি তাবিজ ঝুলালো, সে নিশ্চয় শিরক করল।" (মুসনাদে আহমাদ: ১৭৪৫৮, সহিহ)।',
      'যে কোনো তাবিজ, কবচ, লোহার কড়া বা হাতে-গলায় বাঁধা সুতো অবিলম্বে খুলে ফেলতে হবে।',
      'কোনো কবিরাজ বা পীর যদি রোগীর মায়ের নাম জিজ্ঞেস করে, অস্পষ্ট নকশা দেয় বা নাপাক উপায়ে কিছু করতে বলে, তবে সে নির্দ্বিধায় গণক বা জাদুকর। তার কাছে যাওয়া সম্পূর্ণ হারাম।',
    ],
  },
];
