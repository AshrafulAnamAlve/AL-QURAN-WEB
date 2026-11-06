/**
 * Data Model and Complete Dataset of the 25 Prophets in Islam (কাসাসুল আম্বিয়া)
 * All 25 Prophets explicitly mentioned in the Holy Quran with bilingual biographies,
 * authentic Quranic verses, and lessons.
 */

export interface ProphetStorySection {
  titleBn: string;
  titleEn: string;
  contentBn: string;
  contentEn: string;
}

export interface QuranReference {
  surahNameBn: string;
  surahNameEn: string;
  surahNumber: number;
  ayahRange: string;
  ayahArabic: string;
  translationBn: string;
  translationEn: string;
}

export interface Prophet {
  id: string;
  number: number;
  nameAr: string;
  nameBn: string;
  nameEn: string;
  titleBn: string;
  titleEn: string;
  eraBn: string;
  eraEn: string;
  locationBn: string;
  locationEn: string;
  quranMentionsCount: number;
  quranMentionsBn: string;
  quranMentionsEn: string;
  summaryBn: string;
  summaryEn: string;
  miraclesBn: string[];
  miraclesEn: string[];
  lessonsBn: string[];
  lessonsEn: string[];
  sections: ProphetStorySection[];
  quranReferences: QuranReference[];
}

export const PROPHETS_DATA: Prophet[] = [
  {
    "id": "adam",
    "number": 1,
    "nameAr": "آدَم",
    "nameBn": "হযরত আদম (আ.)",
    "nameEn": "Prophet Adam (AS)",
    "titleBn": "মানবজাতির পিতা ও প্রথম নবী (সাফিউল্লাহ)",
    "titleEn": "Father of Humanity & The First Prophet (Safiyullah)",
    "eraBn": "সৃষ্টির সূচনা লগ্ন",
    "eraEn": "Beginning of Creation",
    "locationBn": "জান্নাত ও পৃথিবী",
    "locationEn": "Paradise & Earth",
    "quranMentionsCount": 25,
    "quranMentionsBn": "পবিত্র কুরআনে ২৫ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 25 times in the Quran",
    "summaryBn": "আল্লাহ তাআলা মাটি থেকে প্রথম মানব হযরত আদম (আ.)-কে সৃষ্টি করেন এবং তাঁকে সমস্ত বস্তুর নাম শিক্ষা দেন। ফেরেশতাদের সেজদা করার নির্দেশ দিলে ইবলিস অহংকারবশত অস্বীকার করে। পরবর্তীতে জান্নাত থেকে পৃথিবীতে মানবজাতির খলিফা হিসেবে তাঁর আগমন ঘটে।",
    "summaryEn": "Allah created the first human, Prophet Adam (AS), from clay and taught him the names of all things. When the angels were commanded to prostrate, Iblis refused out of pride. Adam and his wife Hawwa were placed on Earth as stewards (Khalifah).",
    "miraclesBn": [
      "সরাসরি আল্লাহর কুদরতে মাটি থেকে সৃষ্টি ও রূহ সঞ্চার",
      "আল্লাহর পক্ষ থেকে সরাসরি সমস্ত বস্তুর নাম ও জ্ঞানের শিক্ষা লাভ",
      "ফেরেশতাদের মাধ্যমে তাঁর প্রতি সম্মানজনক সেজদা অর্পণ"
    ],
    "miraclesEn": [
      "Created directly from clay by Allah and breathed with life",
      "Endowed with supreme innate knowledge of all names and sciences",
      "The angels were commanded to prostrate to him in reverence"
    ],
    "lessonsBn": [
      "ভুল হলে তৎক্ষণাৎ আন্তরিকভাবে তাওবা ও অনুশোচনা করা (রাব্বানা যালামনা আনফুসানা)",
      "অহংকার ও আত্মগর্ব ধ্বংসের মূল কারণ (ইবলিসের পরিণতি)",
      "জ্ঞান ও বিনয় মানুষকে শ্রেষ্ঠত্বের মর্যাদা দান করে"
    ],
    "lessonsEn": [
      "Immediate sincere repentance when a mistake occurs (Rabbana zalamna anfusana)",
      "Arrogance is the root of destruction, as seen in Iblis",
      "True superiority comes through divine knowledge, humility, and obedience"
    ],
    "sections": [
      {
        "titleBn": "সৃষ্টি ও ফেরেশতাদের সেজদা",
        "titleEn": "Creation and the Prostration of Angels",
        "contentBn": "আল্লাহ তাআলা পৃথিবীতে তাঁর খলিফা প্রেরণের ঘোষণা দিলে ফেরেশতারা বিনীত প্রশ্ন করেছিল। আল্লাহ মাটির বিভিন্ন উপাদান একত্র করে আদম (আ.)-এর দেহ গঠন করেন এবং তাতে রূহ ফুঁকে দেন। এরপর আল্লাহ আদমকে সব বস্তুর নাম শেখান এবং ফেরেশতাদের পরীক্ষা নেন। ফেরেশতারা স্বীকার করেন যে আল্লাহ যা শিখিয়েছেন তা ছাড়া তাঁদের কোনো জ্ঞান নেই। এরপর আল্লাহ সবাইকে আদমকে সেজদা করতে বললেন; সবাই সেজদা করলেও ইবলিস অহংকার করে কাফেরদের অন্তর্ভুক্ত হলো।",
        "contentEn": "When Allah announced the creation of a vicegerent on earth, the angels inquired with reverence. Allah formed Adam from clay and breathed His spirit into him. Allah taught Adam the names of all things, demonstrating his knowledge before the angels. All angels prostrated in obedience, but Iblis refused due to pride and arrogance."
      },
      {
        "titleBn": "জান্নাত, পরীক্ষা ও তাওবা",
        "titleEn": "Paradise, The Trial, and Repentance",
        "contentBn": "আদম ও তাঁর স্ত্রী হাওয়া জান্নাতে বসবাস শুরু করেন। তাঁদের একটি নির্দিষ্ট গাছের ফল খেতে নিষেধ করা হয়েছিল। কিন্তু ইবলিসের প্ররোচনায় তাঁরা সে গাছের ফল আস্বাদন করেন। তৎক্ষণাৎ তাঁদের ভূষণ খসে পড়ে এবং তাঁরা বুঝতে পারেন যে ভুল হয়েছে। তাঁরা আল্লাহর কাছে কেঁদে বলেন: \"হে আমাদের প্রতিপালক! আমরা নিজেদের প্রতি জুলুম করেছি; আপনি যদি ক্ষমা না করেন তবে আমরা ক্ষতিগ্রস্ত হব।\" আল্লাহ তাঁদের আন্তরিক তাওবা কবুল করলেন এবং পৃথিবীতে মানবজাতির বিস্তার ঘটানোর হুকুম দিলেন।",
        "contentEn": "Adam and Hawwa dwelt peacefully in Paradise with only one restriction: not to approach a forbidden tree. Iblis deceived them with false oaths. Recognizing their mistake, they immediately turned to Allah with the historic plea of repentance: \"Our Lord, we have wronged ourselves; if You forgive us not, we shall be among the losers.\" Allah accepted their repentance and sent them to Earth."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-বাকারা",
        "surahNameEn": "Surah Al-Baqarah",
        "surahNumber": 2,
        "ayahRange": "৩০-৩৮",
        "ayahArabic": "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
        "translationBn": "আর স্মরণ করো যখন তোমার রব ফেরেশতাদের বললেন, আমি পৃথিবীতে প্রতিনিধি সৃষ্টি করতে যাচ্ছি।",
        "translationEn": "And when your Lord said to the angels, \"Indeed, I will make upon the earth a successive authority.\""
      }
    ]
  },
  {
    "id": "idris",
    "number": 2,
    "nameAr": "إِدْرِيس",
    "nameBn": "হযরত ইদরিস (আ.)",
    "nameEn": "Prophet Idris (AS)",
    "titleBn": "সত্যবাদী নবী ও প্রথম কলম ব্যবহারকারী",
    "titleEn": "The Truthful Prophet & Pioneer of the Pen",
    "eraBn": "আদম (আ.)-এর পরবর্তী যুগ",
    "eraEn": "Generations following Adam (AS)",
    "locationBn": "ব্যাবিলন ও মিসর",
    "locationEn": "Babylon & Egypt",
    "quranMentionsCount": 2,
    "quranMentionsBn": "পবিত্র কুরআনে ২ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 2 times in the Quran",
    "summaryBn": "হযরত ইদরিস (আ.) ছিলেন চরম সত্যবাদী, ধৈর্যশীল ও আল্লাহভীরু নবী। তিনি মানবজাতির মধ্যে সর্বপ্রথম কলম দ্বারা লেখা, বস্ত্র সেলাই ও জ্যোতির্বিজ্ঞানের জ্ঞান চর্চা শুরু করেছিলেন। আল্লাহ তাঁকে উচ্চ মর্যাদায় উন্নীত করেছিলেন।",
    "summaryEn": "Prophet Idris (AS) was a man of truth, profound patience, and piety. Traditions hold that he was the first human to write with a pen, sew garments, and study astronomical sciences. Allah elevated him to a high, exalted station.",
    "miraclesBn": [
      "আল্লাহর পক্ষ থেকে মহিমান্বিত উচ্চ মর্যাদায় আরোহণ",
      "সর্বপ্রথম কলম দিয়ে লেখা এবং পরিধেয় বস্ত্র সেলাইয়ের সূচনা",
      "গভীর প্রজ্ঞা ও মহাজাগতিক জ্ঞানের অধিকারী হওয়া"
    ],
    "miraclesEn": [
      "Elevated by Allah to an exalted, high station in the heavens",
      "First to write with a pen and introduce tailored clothing",
      "Blessed with exceptional divine wisdom and cosmic understanding"
    ],
    "lessonsBn": [
      "সত্যনিষ্ঠতা ও অধ্যবসায় মানুষকে আল্লাহর নৈকট্য ও উচ্চ মর্যাদা দান করে",
      "জ্ঞানের চর্চা ও পরিশ্রম নবীদের সুন্নত",
      "সর্বদা আল্লাহর ইবাদতে মগ্ন থাকা"
    ],
    "lessonsEn": [
      "Truthfulness, steadfastness, and worship elevate a person before Allah",
      "Pursuing knowledge, writing, and skilled craft are noble prophetic sunnahs",
      "Constantly occupying one’s time with the remembrance of Allah"
    ],
    "sections": [
      {
        "titleBn": "সত্যনিষ্ঠা ও জ্ঞানের পথিকৃৎ",
        "titleEn": "A Beacon of Truth and Knowledge",
        "contentBn": "হযরত ইদরিস (আ.) তাঁর সম্প্রদায়কে এক আল্লাহর ইবাদত করার এবং অন্যায় ও অশ্লীলতা পরিহার করার আহ্বান জানিয়েছিলেন। তিনি ছিলেন সততার মূর্ত প্রতীক। কথিত আছে, তিনি সর্বপ্রথম মানবজাতিকে হিসাব-নিকাশ, সময় গণনা এবং কলমের মাধ্যমে বার্তা সংরক্ষণের শিক্ষা দেন।",
        "contentEn": "Prophet Idris (AS) tirelessly preached devotion to the One Creator and urged people to turn away from injustice and worldly distractions. He exemplified honesty in speech and deeds, pioneering written recording and measuring time."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা মারইয়াম",
        "surahNameEn": "Surah Maryam",
        "surahNumber": 19,
        "ayahRange": "৫৬-৫৭",
        "ayahArabic": "وَاذْكُرْ فِي الْكِتَابِ إِدْرِيسَ ۚ إِنَّهُ كَانَ صِدِّيقًا نَبِيًّا ۝ وَرَفَعْنَاهُ مَكَانًا عَلِيًّا",
        "translationBn": "আর কিতাবে ইদরিসের কথা স্মরণ করো; তিনি ছিলেন সত্যনিষ্ঠ এক নবী। এবং আমি তাকে উন্নীত করেছিলাম এক উচ্চ স্থানে।",
        "translationEn": "And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station."
      }
    ]
  },
  {
    "id": "nuh",
    "number": 3,
    "nameAr": "نُوح",
    "nameBn": "হযরত নূহ (আ.)",
    "nameEn": "Prophet Nuh (Noah) (AS)",
    "titleBn": "উলুল আজম নবী ও মানবজাতির দ্বিতীয় পিতা (নাজিউল্লাহ)",
    "titleEn": "Arch-Prophet & Second Father of Humanity (Najiyullah)",
    "eraBn": "মহাপ্লাবনের যুগ (খ্রিস্টপূর্ব ২৯০০ অব্দ)",
    "eraEn": "Era of the Great Deluge (~2900 BCE)",
    "locationBn": "মেসোপটেমিয়া (ইরাক) ও জুদি পর্বত",
    "locationEn": "Mesopotamia (Iraq) & Mount Judi",
    "quranMentionsCount": 43,
    "quranMentionsBn": "পবিত্র কুরআনে ৪৩ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 43 times in the Quran",
    "summaryBn": "হযরত নূহ (আ.) দীর্ঘ ৯৫০ বছর ধরে দিন-রাত তাঁর সম্প্রদায়কে মূর্তিপূজা ছেড়ে এক আল্লাহর পথে আহ্বান করেন। সীমাহীন অবাধ্যতার পর আল্লাহর নির্দেশে এক বিশাল কিশতী (নৌকা) নির্মাণ করেন এবং মহাপ্লাবনে মুমিন ও জীবজন্তুদের রক্ষা করেন।",
    "summaryEn": "Prophet Nuh (AS) called his idolatrous people to the worship of One Allah for 950 years with boundless patience. Following divine revelation, he constructed an enormous Ark that preserved the faithful and animal pairs through the Great Deluge.",
    "miraclesBn": [
      "শুষ্ক মরুভূমিতে আল্লাহর ওহী অনুযায়ী সুবিশাল কিশতী নির্মাণ",
      "আকাশ ও পৃথিবীর সমস্ত পানি একত্রিত হয়ে মহাপ্লাবনের সৃষ্টি",
      "জুদি পর্বতের শিখরে কিশতীর নিরাপদ অবতরণ"
    ],
    "miraclesEn": [
      "Construction of the monumental Ark in dry land by divine guidance",
      "The Great Deluge uniting subterranean springs and torrential skies",
      "Safe landing of the Ark upon Mount Judi after the waters receded"
    ],
    "lessonsBn": [
      "দাওয়াত ও সত্যের পথে অটল ধৈর্য (সবর) রাখা",
      "রক্তের সম্পর্কের চেয়ে ঈমানের সম্পর্ক বড় (পুত্রের অবাধ্যতার শিক্ষা)",
      "আল্লাহর সাহায্য অবশ্যই আসে যখন সব আশা শেষ বলে মনে হয়"
    ],
    "lessonsEn": [
      "Unshakable perseverance in calling to truth regardless of opposition",
      "Spiritual bonds of faith transcend physical biological ties (lesson of his son)",
      "Divine help arrives decisively when all worldly causes seem exhausted"
    ],
    "sections": [
      {
        "titleBn": "৯৫০ বছরের অবিশ্রান্ত দাওয়াত",
        "titleEn": "950 Years of Relentless Preaching",
        "contentBn": "হযরত নূহ (আ.) তাঁর জাতিকে প্রকাশ্য ও গোপনে, দিনে ও রাতে বোঝাতেন। তিনি বলতেন: \"তোমরা তোমাদের রবের কাছে ক্ষমা প্রার্থনা করো, নিশ্চয় তিনি অতি ক্ষমাশীল। তিনি তোমাদের জন্য আকাশ থেকে প্রচুর বৃষ্টি বর্ষণ করবেন এবং ধন-সম্পদ ও সন্তান-সন্ততিতে সমৃদ্ধি দেবেন।\" কিন্তু কাফেররা কানে আঙুল গুঁজে রাখত এবং উপহাস করত।",
        "contentEn": "Prophet Nuh preached day and night, openly and secretly. He told them: \"Ask forgiveness of your Lord, indeed He is ever a Perpetual Forgiver. He will send rain upon you in abundance and increase you in wealth and children.\" Yet the arrogant leaders mocked him and refused to listen."
      },
      {
        "titleBn": "কিশতী নির্মাণ ও মহাপ্লাবন",
        "titleEn": "Building the Ark & The Deluge",
        "contentBn": "আল্লাহর নির্দেশে নূহ (আ.) মরুভূমির মাঝে বিশাল নৌকা তৈরি শুরু করলেন। কাফেররা পাশ দিয়ে যাওয়ার সময় হাসাহাসি করত। অবশেষে যখন আল্লাহর ফয়সালা এলো, চুলার মধ্য থেকে পানি উথলে উঠল এবং আকাশ থেকে মুষলধারে বৃষ্টি নামল। নূহ (আ.) মুমিনদের ও প্রতি প্রজাতির একজোড়া প্রাণী নিয়ে নৌকায় উঠলেন। নূহের এক অবাধ্য পুত্র পাহাড়ে আশ্রয় নিতে গিয়ে প্লাবনে ডুবে গেল। সত্যের বিজয় হলো এবং নৌকা জুদি পাহাড়ে নিরাপদে নোঙর করল।",
        "contentEn": "Under divine inspiration, Nuh built the Ark far from any sea. The disbelievers ridiculed him. When the appointed hour came, springs burst forth from the earth and torrents rained from the heavens. Believers and pairs of every creature boarded safely. Nuh’s disobedient son perished in the flood. The Ark safely rested on Mount Judi."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা নূহ",
        "surahNameEn": "Surah Nuh",
        "surahNumber": 71,
        "ayahRange": "১-৪",
        "ayahArabic": "إِنَّا أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ أَنْ أَنذِرْ قَوْمَكَ مِن قَبْلِ أَن يَأْتِيَهُمْ عَذَابٌ أَلِيمٌ",
        "translationBn": "আমি নূহকে তার সম্প্রদায়ের প্রতি পাঠিয়েছিলাম এই নির্দেশ দিয়ে যে, তোমার জাতিকে সতর্ক করো তাদের ওপর মর্মান্তিক শাস্তি আসার আগে।",
        "translationEn": "Indeed, We sent Noah to his people, [saying], \"Warn your people before there comes to them a painful punishment.\""
      }
    ]
  },
  {
    "id": "hud",
    "number": 4,
    "nameAr": "هُود",
    "nameBn": "হযরত হূদ (আ.)",
    "nameEn": "Prophet Hud (AS)",
    "titleBn": "আদ জাতির প্রতি প্রেরিত নবী",
    "titleEn": "Prophet Sent to the Mighty People of Aad",
    "eraBn": "খ্রিস্টপূর্ব ২৪০০ অব্দ",
    "eraEn": "~2400 BCE",
    "locationBn": "ইয়েমেনের আহকাফ অঞ্চল",
    "locationEn": "Al-Ahqaf (Southern Arabia / Yemen)",
    "quranMentionsCount": 7,
    "quranMentionsBn": "পবিত্র কুরআনে ৭ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 7 times in the Quran",
    "summaryBn": "আদ জাতি ছিল পৃথিবীতে অত্যন্ত শক্তিশালী ও দীর্ঘকায় মানুষ, যারা সুরম্য অট্টালিকা নির্মাণে দক্ষ ছিল। কিন্তু তারা চরম অহংকারী ও মূর্তিপূজক হয়ে ওঠে। হযরত হূদ (আ.) তাদের সতর্ক করেন। অবশেষে এক বিধ্বংসী প্রচণ্ড শীতল ঝড়ো বাতাস তাদের ধ্বংস করে দেয়।",
    "summaryEn": "The people of Aad were giants endowed with immense physical strength and majestic architecture. Yet they grew tyrannical and worshiped idols. Prophet Hud (AS) called them to humility and monotheism, but they persisted in rebellion until destroyed by a raging, freezing windstorm.",
    "miraclesBn": [
      "চরম বৈরি ও শক্তিশালী জাতির বিরুদ্ধে একা দাঁড়িয়ে নির্ভীক সত্য প্রচার",
      "টানা সাত রাত ও আট দিনের ধ্বংসাত্মক প্রবল ঘূর্ণিঝড় থেকে মুমিনদের রক্ষা পাওয়া"
    ],
    "miraclesEn": [
      "Undaunted courage standing alone against the mightiest empire of his time",
      "Miraculous survival of Hud and believers through a devastating seven-night hurricane"
    ],
    "lessonsBn": [
      "শারীরিক শক্তি, প্রযুক্তি ও অট্টালিকা আল্লাহর গজব থেকে কাউকে বাঁচাতে পারে না",
      "অহংকার ও নিপীড়ন জাতির পতনের কারণ",
      "আল্লাহর নিয়ামতের জন্য শুকরিয়া আদায় করা উচিত"
    ],
    "lessonsEn": [
      "Material wealth, engineering prowess, and physical might cannot ward off divine justice",
      "Arrogance and oppression inevitably lead to civilizational ruin",
      "True strength lies in acknowledging blessings and living in humble servitude"
    ],
    "sections": [
      {
        "titleBn": "আদ জাতির দম্ভ ও হূদের আহ্বান",
        "titleEn": "The Hubris of Aad and Hud’s Call",
        "contentBn": "আদ জাতি বলত: \"আমাদের চেয়ে শক্তিশালী আর কে আছে?\" হূদ (আ.) তাদের স্মরণ করিয়ে দেন যে, আল্লাহই তাদের এই শক্তি দিয়েছেন। তিনি তাদের এক আল্লাহর ইবাদত করতে বলেন। কিন্তু তারা হূদকে মিথ্যাবাদী ও নির্বোধ বলে অপবাদ দেয়। অবশেষে তাদের আকাশে এক কালো মেঘ দেখা যায়, যা দেখে তারা ভেবেছিল বৃষ্টি আসবে; কিন্তু তা ছিল সর্বগ্রাসী ধ্বংসাত্মক ঝড়।",
        "contentEn": "The people of Aad arrogantly boasted: \"Who is greater than us in strength?\" Hud reminded them that Allah who created them was far superior. They accused him of madness. Soon a dark cloud gathered on the horizon; they thought it brought rain, but it carried a furious, freezing cyclone that wiped out their cities."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা হূদ",
        "surahNameEn": "Surah Hud",
        "surahNumber": 11,
        "ayahRange": "৫০",
        "ayahArabic": "وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا ۚ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ",
        "translationBn": "আর আদ জাতির প্রতি পাঠিয়েছিলাম তাদের ভাই হূদকে। সে বলেছিল, হে আমার সম্প্রদায়! তোমরা আল্লাহর ইবাদত করো, তিনি ছাড়া তোমাদের আর কোনো ইলাহ নেই।",
        "translationEn": "And to Aad [We sent] their brother Hud. He said, \"O my people, worship Allah; you have no deity other than Him.\""
      }
    ]
  },
  {
    "id": "salih",
    "number": 5,
    "nameAr": "صَالِح",
    "nameBn": "হযরত সালিহ (আ.)",
    "nameEn": "Prophet Salih (AS)",
    "titleBn": "সামুদ জাতির নবী ও অলৌকিক উষ্ট্রীর মুজিযাহ",
    "titleEn": "Prophet to Thamud and the Miraculous She-Camel",
    "eraBn": "খ্রিস্টপূর্ব ২০০০ অব্দ",
    "eraEn": "~2000 BCE",
    "locationBn": "আল-হিজর / মাদাইন সালিহ (সৌদি আরব)",
    "locationEn": "Al-Hijr / Mada’in Salih (Arabia)",
    "quranMentionsCount": 9,
    "quranMentionsBn": "পবিত্র কুরআনে ৯ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 9 times in the Quran",
    "summaryBn": "সামুদ জাতি পাহাড় কেটে সুরম্য বাড়ি তৈরি করতে পারত। তারা সালিহ (আ.)-এর কাছে প্রমাণ চাইলে আল্লাহ এক বিশাল শক্ত পাথর থেকে এক গর্ভবতী অলৌকিক উষ্ট্রী বের করে দেন। অবাধ্য কাফেররা উষ্ট্রীটিকে হত্যা করলে এক বিকট বজ্রনাদে তারা নিশ্চিহ্ন হয়ে যায়।",
    "summaryEn": "The Thamud carved magnificent homes directly into rocky mountains. When they demanded a miracle, Allah brought forth a giant pregnant She-Camel from a solid boulder. Despite warnings, the rebellious leaders hamstrung the camel, leading to their sudden destruction by a thunderous blast.",
    "miraclesBn": [
      "কঠিন পাহাড়ের পাথর ফেটে জীবন্ত গর্ভবতী অলৌকিক উষ্ট্রীর বহির্গমন",
      "উষ্ট্রীর পানিশূন্য না হওয়া এবং পুরো জাতির জন্য দুধ প্রদান",
      "নির্ধারিত তিন দিনের সতর্কবাণীর পর শত্রুদের ওপর বজ্রপাত"
    ],
    "miraclesEn": [
      "A living, pregnant She-Camel miraculously emerging from a solid boulder",
      "The She-Camel drinking from the well on alternate days and supplying milk to all",
      "Accurate prophecy of three days of warning before the cataclysmic soundblast"
    ],
    "lessonsBn": [
      "আল্লাহর সুস্পষ্ট নিদর্শনকে অবমূল্যায়ন ও আঘাত করার মারাত্মক পরিণতি",
      "কতিপয় দুষ্ট লোকের পাপে পুরো জাতি ধ্বংস হতে পারে যদি অন্যরা নীরব থাকে",
      "প্রাকৃতিক সম্পদ ও জীবের প্রতি সুবিচার করা"
    ],
    "lessonsEn": [
      "Disrespecting divine signs incurs immediate spiritual and worldly peril",
      "A society can perish due to the crimes of a few if the majority remains complicit",
      "Respecting animal life and fair distribution of water and shared resources"
    ],
    "sections": [
      {
        "titleBn": "পাথর থেকে উষ্ট্রী ও চূড়ান্ত ফয়সালা",
        "titleEn": "The She-Camel from the Rock and the Blast",
        "contentBn": "সামুদ জাতি সালিহ (আ.)-কে বলল: \"তুমি যদি সত্যবাদী হও, তবে এই পাথর থেকে এক বিশাল উষ্ট্রী বের করে দেখাও।\" সালিহ আল্লাহর কাছে দোয়া করলে পাথর ফেটে সুন্দর এক উষ্ট্রী বের হলো। সালিহ বললেন: \"এটি আল্লাহর উষ্ট্রী, একে জমিনে চরে খেতে দাও, কেউ যেন একে আঘাত না করে।\" কিন্তু অবাধ্য কুচক্রীরা উষ্ট্রীটিকে হত্যা করল। সালিহ বললেন: \"তোমরা তোমাদের ঘরে তিন দিন সময় নাও।\" তৃতীয় দিন ভোরে এক বিকট নিনাদ ও ভূমিকম্পে তারা নতজানু হয়ে মরে পড়ে রইল।",
        "contentEn": "Thamud challenged Salih to produce a she-camel from a rock. By Allah’s command, the rock split and a magnificent camel appeared. Salih warned them: \"Let her graze peacefully and do not harm her.\" Nine conspirators hamstrung and slaughtered the camel. Three days later, an earth-shattering blast struck them down in their carved stone homes."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আশ-শুআরা",
        "surahNameEn": "Surah Ash-Shuara",
        "surahNumber": 26,
        "ayahRange": "১৫৫-১৫৭",
        "ayahArabic": "قَالَ هَٰذِهِ نَاقَةٌ لَّهَا شِرْبٌ وَلَكُمْ شِرْبُ يَوْمٍ مَّعْلُومٍ",
        "translationBn": "তিনি বললেন, এই যে উষ্ট্রী; এর জন্য রয়েছে পানি পানের একটি দিন এবং তোমাদের জন্য একটি নির্দিষ্ট দিন।",
        "translationEn": "He said, \"This is a she-camel. For her is a time of drinking, and for you is a time of drinking, [each on] a known day.\""
      }
    ]
  },
  {
    "id": "ibrahim",
    "number": 6,
    "nameAr": "إِبْرَاهِيم",
    "nameBn": "হযরত ইবরাহীম (আ.)",
    "nameEn": "Prophet Ibrahim (Abraham) (AS)",
    "titleBn": "খলিলুল্লাহ ও মুসলিম জাতির পিতা (আব্বুল আম্বিয়া)",
    "titleEn": "The Intimate Friend of Allah & Father of the Prophets (Khalilullah)",
    "eraBn": "খ্রিস্টপূর্ব ১৯০০ অব্দ",
    "eraEn": "~1900 BCE",
    "locationBn": "ইরাক (উর), শাম (সিরিয়া), মিসর ও মক্কা",
    "locationEn": "Ur (Mesopotamia), Levant, Egypt & Makkah",
    "quranMentionsCount": 69,
    "quranMentionsBn": "পবিত্র কুরআনে ৬৯ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 69 times in the Quran",
    "summaryBn": "হযরত ইবরাহীম (আ.) মূর্তিপূজার বিরুদ্ধে একনিষ্ঠ তাওহিদের পতাকা তুলে ধরেন। নমরুদের প্রকাণ্ড অগ্নিকুণ্ড তাঁর জন্য শীতল ও শান্তিদায়ক বাগানে পরিণত হয়। তিনি পুত্র ইসমাইলকে নিয়ে পবিত্র কাবাঘর নির্মাণ করেন এবং কোরবানির চিরন্তন আদর্শ প্রতিষ্ঠা করেন।",
    "summaryEn": "Prophet Ibrahim (AS) championed pure monotheism against tyranny and idol worship. Thrown into a blazing inferno by Nimrod, the fire turned cool and peaceful for him by divine command. With his son Ismail, he built the Holy Kaaba and instituted the eternal tradition of Qurbani.",
    "miraclesBn": [
      "নমরুদের প্রজ্বলিত আগুনের কুণ্ডলী শীতল ও শান্তিদায়ক হওয়া",
      "চারটি পাখিকে জবাই করে পাহাড়ে রাখার পর ডাক দেওয়া মাত্র জীবিত ফিরে আসা",
      "পুত্র ইসমাইলকে কোরবানি দেওয়ার পরীক্ষায় সফল হয়ে দুম্বা দ্বারা প্রতিস্থাপিত হওয়া",
      "পবিত্র কাবাঘর নির্মাণ ও বিশ্ববাসীকে হজের আহ্বান পৌঁছানো"
    ],
    "miraclesEn": [
      "The roaring fire of Nimrod becoming cool, peaceful, and harmless",
      "Four slaughtered birds coming back to life and flying to him when called",
      "The test of sacrificing his beloved son Ismail fulfilled with a ram from Paradise",
      "Founding the Holy Kaaba and his call to Hajj echoing through all generations"
    ],
    "lessonsBn": [
      "তাওহিদের ওপর আপসহীন ঈমান ও যুক্তিবাদী সত্যসন্ধান",
      "আল্লাহর জন্য চরম প্রিয় বস্তু কোরবানির মানসিকতা",
      "একমাত্র আল্লাহর ওপর পরম ভরসা (হাসবুনাল্লাহু ওয়া নি’মাল ওয়াকিল)"
    ],
    "lessonsEn": [
      "Uncompromising commitment to Tawheed and reasoned reflection on creation",
      "Willingness to sacrifice our deepest attachments for the pleasure of Allah",
      "Supreme reliance on Allah alone (Hasbunallahu wa ni’mal wakeel)"
    ],
    "sections": [
      {
        "titleBn": "মূর্তি ভাঙা ও আগুনের পরীক্ষা",
        "titleEn": "Smashing the Idols and the Fire Trial",
        "contentBn": "ইবরাহীম (আ.) যৌবনেই অনুধাবন করেছিলেন যে নিজ হাতে গড়া মূর্তি কখনো খোদা হতে পারে না। তিনি সব ছোট মূর্তি ভেঙে বড় মূর্তির কাঁধে কুঠার ঝুলিয়ে দিলেন। নমরুদ ও তার পারিষদরা ক্ষিপ্ত হয়ে তাঁকে বিশাল অগ্নিকুণ্ডে নিক্ষেপ করল। কিন্তু আল্লাহ আগুনকে আদেশ করলেন: \"হে আগুন! তুমি ইবরাহীমের ওপর শীতল ও শান্তিদায়ক হয়ে যাও!\" আগুন ফুলের বাগানের মতো শীতল হয়ে গেল।",
        "contentEn": "As a young man, Ibrahim logically dismantled the idol worship of his people. He smashed the idols in the temple, leaving only the largest. When the furious tyrant Nimrod threw him into a gargantuan blaze, Allah commanded: \"O fire, be coolness and safety upon Ibrahim!\" The flames were neutralized into a peaceful garden."
      },
      {
        "titleBn": "কাবা নির্মাণ ও আত্মত্যাগের ইতিহাস",
        "titleEn": "Building the Kaaba and the Supreme Sacrifice",
        "contentBn": "আল্লাহর নির্দেশে ইবরাহীম তাঁর স্ত্রী হাজেরা ও শিশুপুত্র ইসমাইলকে মক্কার নির্জন উপত্যকায় রেখে আসেন। পরবর্তীতে পিতা ও পুত্র মিলে মানবজাতির প্রথম ইবাদতের ঘর \"কাবা\" পুনর্নির্মাণ করেন। স্বপ্নে আদিষ্ট হয়ে ইবরাহীম তাঁর কলিজার টুকরা পুত্রকে কোরবানির প্রস্তুতি নেন; আল্লাহ তাঁর একনিষ্ঠতায় সন্তুষ্ট হয়ে জান্নাত থেকে দুম্বা পাঠিয়ে দেন। এভাবেই তৈরি হয় হজের মহান নিদর্শন।",
        "contentEn": "Under divine guidance, Ibrahim left Hajar and baby Ismail in the barren desert of Makkah. Later, father and son rebuilt the foundations of the Holy Kaaba. Tested in a vision to offer his son, Ibrahim prepared for the sacrifice; Allah declared the trial won and ransomed Ismail with a ram from Paradise."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আম্বিয়া",
        "surahNameEn": "Surah Al-Anbiya",
        "surahNumber": 21,
        "ayahRange": "৬৯",
        "ayahArabic": "قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ",
        "translationBn": "আমি বললাম, হে আগুন! তুমি ইবরাহীমের ওপর শীতল ও শান্তিদায়ক হয়ে যাও।",
        "translationEn": "We said, \"O fire, be coolness and safety upon Abraham.\""
      }
    ]
  },
  {
    "id": "lut",
    "number": 7,
    "nameAr": "لُوط",
    "nameBn": "হযরত লূত (আ.)",
    "nameEn": "Prophet Lut (Lot) (AS)",
    "titleBn": "সাদুম জাতির সংস্কারক নবী",
    "titleEn": "Reformer to the Cities of Sodom and Gomorrah",
    "eraBn": "ইবরাহীম (আ.)-এর সমসাময়িক",
    "eraEn": "Contemporary of Ibrahim (AS) (~1900 BCE)",
    "locationBn": "সাদুম ও আমোরাহ (মৃত সাগর / জর্ডান)",
    "locationEn": "Sodom & Gomorrah (Dead Sea region)",
    "quranMentionsCount": 27,
    "quranMentionsBn": "পবিত্র কুরআনে ২৭ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 27 times in the Quran",
    "summaryBn": "হযরত লূত (আ.) ছিলেন ইবরাহীম (আ.)-এর ভ্রাতুষ্পুত্র। তিনি সাদুম ও আমোরাহ অঞ্চলের জাতিকে নিকৃষ্ট সমকামিতা, রাহাজানি ও অশ্লীলতা থেকে বিরত থাকার আহ্বান জানান। অবাধ্যতার চূড়ান্ত পর্যায়ে তাদের বসতি উল্টে দেওয়া হয় এবং পাথরের বৃষ্টি বর্ষণ করা হয়।",
    "summaryEn": "Prophet Lut (AS), nephew of Ibrahim (AS), was sent to Sodom to reform a community entrenched in homosexuality, robbery, and debauchery. Despite patient counsel, they attempted to violate angel guests, resulting in their city being overturned and pelted with marked stones.",
    "miraclesBn": [
      "ফেরেশতাদের মানববেশে আগমন ও পাপীদের অন্ধ করে দেওয়া",
      "লূত (আ.) ও তাঁর মুমিন পরিবারকে রাতের আঁধারে নিরাপদে বের করে আনা"
    ],
    "miraclesEn": [
      "Angelic messengers striking the rebellious mob with blindness at his door",
      "Safe night evacuation of Lut and his daughters before the cataclysm"
    ],
    "lessonsBn": [
      "প্রকৃতিবিরুদ্ধ অশ্লীলতা ও যৌনাচার সমাজের জন্য ধ্বংস ডেকে আনে",
      "অন্যায় কাজে সমর্থন দেওয়া স্বয়ং অপরাধে লিপ্ত হওয়ার সমান (লূতের স্ত্রীর পরিণতি)",
      "লজ্জাশীলতা ও পবিত্রতা রক্ষা করা ঈমানের দাবি"
    ],
    "lessonsEn": [
      "Deviance from the natural order brings societal rot and divine consequences",
      "Sympathizing with wrongdoing renders one culpable (the fate of Lut’s wife)",
      "Chastity, moral courage, and modest conduct are foundational to faith"
    ],
    "sections": [
      {
        "titleBn": "অশ্লীলতার বিরুদ্ধে প্রতিবাদ ও সাদুমের পতন",
        "titleEn": "Standing Against Corruption and the Fall of Sodom",
        "contentBn": "সাদুমের অধিবাসীরা মানব ইতিহাসের সবচেয়ে জঘন্য অশ্লীলতায় লিপ্ত ছিল। লূত (আ.) তাদের সতর্ক করে বললেন: \"তোমরা কি এমন অপকর্ম করছ যা তোমাদের পূর্বে বিশ্বে কেউ করেনি?\" তারা লূতকে হুমকি দিয়ে বলল: \"এদেরকে শহর থেকে বের করে দাও, এরা অতি পবিত্র হতে চায়!\" অবশেষে সুন্দর যুবকদের বেশে ফেরেশতারা এলেন। কাফেররা তাদের ক্ষতি করতে এলে অন্ধ হয়ে গেল। ভোরবেলায় পুরো জনপদ উল্টে দেওয়া হলো এবং গন্ধক মিশ্রিত পাথরের বৃষ্টি নামল।",
        "contentEn": "The people of Sodom practiced unprecedented wickedness. Lut warned them: \"Do you commit such immorality as no one has preceded you in the world?\" They threatened to expel him for desiring purity. Angels appeared as handsome youths, and when the mob attacked, the angels blinded them. At dawn, the city was turned upside down and rained upon with stones."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আরাফ",
        "surahNameEn": "Surah Al-Araf",
        "surahNumber": 7,
        "ayahRange": "৮০-৮১",
        "ayahArabic": "وَلُوطًا إِذْ قَالَ لِقَوْمِهِ أَتَأْتُونَ الْفَاحِشَةَ مَا سَبَقَكُم بِهَا مِنْ أَحَدٍ مِّنَ الْعَالَمِينَ",
        "translationBn": "আর লূতকে পাঠিয়েছিলাম; সে তার জাতিকে বলল, তোমরা কি এমন অশ্লীল কাজ করছ যা তোমাদের আগে সারা বিশ্বে কেউ করেনি?",
        "translationEn": "And [We had sent] Lot when he said to his people, \"Do you commit such immorality as no one has preceded you with from among the worlds?\""
      }
    ]
  },
  {
    "id": "ismail",
    "number": 8,
    "nameAr": "إِسْمَاعِيل",
    "nameBn": "হযরত ইসমাঈল (আ.)",
    "nameEn": "Prophet Ismail (Ishmael) (AS)",
    "titleBn": "যবীহুল্লাহ ও কাবা শরিফের সহযোগী নির্মাতা",
    "titleEn": "The Sacrificed for Allah & Builder of the Kaaba (Zabihullah)",
    "eraBn": "খ্রিস্টপূর্ব ১৯০০-১৮০০ অব্দ",
    "eraEn": "~1850 BCE",
    "locationBn": "মক্কা মুকাররমা",
    "locationEn": "Makkah, Arabia",
    "quranMentionsCount": 12,
    "quranMentionsBn": "পবিত্র কুরআনে ১২ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 12 times in the Quran",
    "summaryBn": "হযরত ইসমাঈল (আ.) ছিলেন হযরত ইবরাহীম (আ.)-এর জ্যেষ্ঠ পুত্র। তাঁর শিশুকালের পায়ের আঘাতে পবিত্র জমজম কূপের সৃষ্টি হয়। পিতার স্বপ্নের নির্দেশে তিনি নিজেকে হাসিমুখে কোরবানির জন্য সঁপে দিয়েছিলেন। তিনি ছিলেন সত্যবাদী ও প্রতিশ্রুতি রক্ষাকারী।",
    "summaryEn": "Prophet Ismail (AS) was the elder son of Ibrahim (AS). As an infant, the miraculous Zamzam spring gushed under his feet. When his father revealed the vision of sacrifice, young Ismail surrendered with complete trust and peace. From his lineage came the Final Prophet Muhammad (ﷺ).",
    "miraclesBn": [
      "মরুভূমির বুকে শিশুপায়ের আঘাতে বরকতময় জমজম কূপের উৎপত্তি",
      "কোরবানির ছুরির নিচে অলৌকিকভাবে অক্ষত থাকা ও জান্নাতী দুম্বা প্রতিস্থাপন",
      "পিতার সাথে মিলে আল্লাহর প্রথম ঘর কাবা শরিফ নির্মাণ"
    ],
    "miraclesEn": [
      "The miraculous gushing of the Zamzam spring in the parched desert",
      "Remaining completely unharmed under the knife of sacrifice through divine ransom",
      "Co-building the foundational walls of the Holy Kaaba with his father"
    ],
    "lessonsBn": [
      "পিতামাতার সৎ নির্দেশের প্রতি পরম আনুগত্য ও সম্মান প্রদর্শন",
      "ওয়াদা বা প্রতিশ্রুতি পালনে একনিষ্ঠ থাকা (কুরআনে তাঁকে ওয়াদা রক্ষাকারী বলা হয়েছে)",
      "পরিবারকে সালাত ও সৎকাজের আদেশ দেওয়া"
    ],
    "lessonsEn": [
      "Unsurpassed obedience, gentleness, and respect toward righteous parents",
      "Steadfast fulfillment of promises and agreements (honored in Quran as Sadiq al-Wa’d)",
      "Consistently enjoining prayer and charity upon one’s family"
    ],
    "sections": [
      {
        "titleBn": "জমজম কূপ ও অপূর্ব আত্মসমর্পণ",
        "titleEn": "The Zamzam Spring and the Supreme Surrender",
        "contentBn": "শিশু ইসমাঈল যখন তৃষ্ণায় ছটফট করছিলেন, মাতা হাজেরা সাফা ও মারওয়া পাহাড়ে দৌড়াদৌড়ি করেন। তখন জিবরাইল (আ.)-এর ডানার আঘাতে পবিত্র জমজমের পানির ফোয়ারা প্রকাশিত হয়। কৈশোরে পিতা যখন জানালেন: \"হে পুত্র! আমি স্বপ্নে দেখছি তোমাকে কোরবানি করছি\", ইসমাঈল দৃঢ়কণ্ঠে উত্তর দিলেন: \"হে আমার পিতা! আপনাকে যা আদেশ করা হয়েছে তা-ই করুন; ইনশাআল্লাহ আপনি আমাকে ধৈর্যশীলদের অন্তর্ভুক্ত পাবেন।\"",
        "contentEn": "As an infant crying of thirst, his mother Hajar ran between Safa and Marwah until angel Jibril struck the earth, bringing forth Zamzam. Years later, when Ibrahim shared his divine dream, youth Ismail replied with tranquility: \"O my father, do as you are commanded. You will find me, if Allah wills, among the steadfast.\""
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা মারইয়াম",
        "surahNameEn": "Surah Maryam",
        "surahNumber": 19,
        "ayahRange": "৫৪",
        "ayahArabic": "وَاذْكُرْ فِي الْكِتَابِ إِسْمَاعِيلَ ۚ إِنَّهُ كَانَ صَادِقَ الْوَعْدِ وَكَانَ رَسُولًا نَّبِيًّا",
        "translationBn": "আর কিতাবে ইসমাঈলের কথা স্মরণ করো; সে ছিল প্রতিশ্রুতি পালনে সত্যনিষ্ঠ এবং সে ছিল একজন রাসুল ও নবী।",
        "translationEn": "And mention in the Book, Ishmael. Indeed, he was true to his promise, and he was a messenger and a prophet."
      }
    ]
  },
  {
    "id": "ishaq",
    "number": 9,
    "nameAr": "إِسْحَاق",
    "nameBn": "হযরত ইসহাক (আ.)",
    "nameEn": "Prophet Ishaq (Isaac) (AS)",
    "titleBn": "সুসংবাদপ্রাপ্ত নবী ও বনী ইসরাঈলের পূর্বপুরুষ",
    "titleEn": "Prophet of Glad Tidings & Ancestor of the Israelites",
    "eraBn": "খ্রিস্টপূর্ব ১৮৫০ অব্দ",
    "eraEn": "~1850 BCE",
    "locationBn": "কনআন (ফিলিস্তিন / শাম)",
    "locationEn": "Canaan (Palestine)",
    "quranMentionsCount": 17,
    "quranMentionsBn": "পবিত্র কুরআনে ১৭ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 17 times in the Quran",
    "summaryBn": "হযরত ইসহাক (আ.) ছিলেন হযরত ইবরাহীম (আ.) ও সারাহ (রা.)-এর পুত্র। পিতা-মাতার চরম বার্ধক্যে ফেরেশতারা তাঁর জন্মের সুসংবাদ নিয়ে এসেছিলেন। তিনি ছিলেন সত্যনিষ্ঠ, প্রজ্ঞাবান ও পুণ্যবান নবী। তাঁর সন্তান থেকেই বনী ইসরাঈলের নবীগণের ধারা শুরু হয়।",
    "summaryEn": "Prophet Ishaq (AS) was the son of Ibrahim (AS) and Sarah, born when his parents were in advanced old age as announced by angel guests. He was a righteous, wise prophet whose lineage produced many of the great prophets of Bani Israel.",
    "miraclesBn": [
      "মাতার বন্ধ্যাত্ব ও পিতা-মাতার চরম বার্ধক্যে অলৌকিক জন্ম লাভ",
      "প্রচুর বংশধর ও নবীদের ধারাবাহিক ধারার আগমন"
    ],
    "miraclesEn": [
      "Miraculous birth to parents in their late elderly years through divine glad tidings",
      "Blessed lineage originating a continuous chain of righteous prophets"
    ],
    "lessonsBn": [
      "আল্লাহর রহমত থেকে কখনো নিরাশ হতে নেই, তিনি অসম্ভবকেও সম্ভব করেন",
      "পারিবারিক ধার্মিকতা ও পিতা-মাতার দোয়ার গভীর প্রভাব",
      "ধৈর্য ও শান্তিপ্রিয় জীবনযাপন"
    ],
    "lessonsEn": [
      "Never despair of Allah’s mercy; He makes the impossible possible at His decree",
      "The enduring blessings of a righteous lineage and parental prayers",
      "Cultivating peace, wisdom, and steadfast worship"
    ],
    "sections": [
      {
        "titleBn": "সুসংবাদ ও নবীগণের বংশধারা",
        "titleEn": "The Glad Tidings and the Lineage of Prophets",
        "contentBn": "বৃদ্ধ বয়সে যখন ফেরেশতারা অতিথি হয়ে ইবরাহীমের গৃহে আসেন, তাঁরা এক প্রজ্ঞাবান পুত্র ইসহাকের জন্মের সুসংবাদ দেন। সারাহ বিস্মিত হয়ে হেসে ফেলেছিলেন। ফেরেশতারা বললেন: \"আল্লাহর কুদরতে কি তোমরা বিস্মিত হচ্ছো?\" ইসহাক বড় হয়ে নবুওয়াত লাভ করেন এবং ফিলিস্তিনে আল্লাহর দ্বীন প্রচার করেন।",
        "contentEn": "When angels visited Ibrahim as traveling guests, they imparted the glad tidings of a knowledgeable son, Ishaq, and after him, Yaqub. Sarah marvelled at the news in her old age. The angels replied: \"Do you marvel at the decree of Allah?\" Ishaq grew to guide people in Canaan with profound piety."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা হূদ",
        "surahNameEn": "Surah Hud",
        "surahNumber": 11,
        "ayahRange": "৭১",
        "ayahArabic": "فَبَشَّرْنَاهَا بِإِسْحَاقَ وَمِن وَرَاءِ إِسْحَاقَ يَعْقُوبَ",
        "translationBn": "অতএব আমি তাকে সুসংবাদ দিলাম ইসহাকের এবং ইসহাকের পর ইয়াকুবের।",
        "translationEn": "So We gave her good tidings of Isaac and after Isaac, Jacob."
      }
    ]
  },
  {
    "id": "yaqub",
    "number": 10,
    "nameAr": "يَعْقُوب",
    "nameBn": "হযরত ইয়াকুব (আ.)",
    "nameEn": "Prophet Yaqub (Jacob) (AS)",
    "titleBn": "ইসরাঈল ও সুন্দর ধৈর্যের (সবরে জামিল) প্রতীক",
    "titleEn": "Israel & The Epitome of Beautiful Patience (Sabrun Jameel)",
    "eraBn": "খ্রিস্টপূর্ব ১৮০০ অব্দ",
    "eraEn": "~1800 BCE",
    "locationBn": "কনআন (ফিলিস্তিন) ও মিসর",
    "locationEn": "Canaan & Egypt",
    "quranMentionsCount": 16,
    "quranMentionsBn": "পবিত্র কুরআনে ১৬ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 16 times in the Quran",
    "summaryBn": "হযরত ইয়াকুব (আ.) ছিলেন ইসহাক (আ.)-এর পুত্র, যাঁকে আল্লাহ \"ইসরাঈল\" উপাধি দিয়েছিলেন। তাঁর প্রিয় পুত্র ইউসুফ (আ.) হারিয়ে যাওয়ার পর তিনি দীর্ঘ বছর ধরে যে অটল ধৈর্য দেখান, তা কুরআনে \"সবরে জামিল\" বা সুন্দর ধৈর্য নামে চিরস্মরণীয় হয়ে আছে।",
    "summaryEn": "Prophet Yaqub (AS) was the son of Ishaq (AS), also titled \"Israel\". When separated from his beloved son Yusuf for decades, he demonstrated legendary forbearance described in the Quran as Sabrun Jameel (beautiful patience), placing all sorrow solely before Allah.",
    "miraclesBn": [
      "পুত্র ইউসুফের সুরভিত জামার স্পর্শে অন্ধ চোখের দৃষ্টিশক্তি ফিরে পাওয়া",
      "স্বপ্নের তাৎপর্য ও ভবিষ্যত দর্শনের ইলহাম লাভ",
      "১২ পুত্রের মাধ্যমে বনী ইসরাঈলের ১২টি গোত্রের বিস্তার"
    ],
    "miraclesEn": [
      "Restoration of sight to his eyes clouded by weeping upon receiving Yusuf’s shirt",
      "Deep prophetic discernment and interpretation of dreams",
      "Fathering the 12 sons who became the 12 tribes of Bani Israel"
    ],
    "lessonsBn": [
      "বিপদ-আপদে কারও কাছে অভিযোগ না করে একমাত্র আল্লাহর কাছে দুঃখ প্রকাশ করা",
      "আল্লাহর রহমত থেকে কখনো নিরাশ না হওয়া",
      "মৃত্যুশয্যায় সন্তানদের তাওহিদের ওপর থাকার অসিয়ত করা"
    ],
    "lessonsEn": [
      "Directing all grief and suffering only to Allah without complaint to creation",
      "Never despairing of relief from Allah even after decades of hardship",
      "Ensuring children remain steadfast upon Tawheed up to the last breath"
    ],
    "sections": [
      {
        "titleBn": "সবরে জামিল ও চোখের দৃষ্টি ফিরে পাওয়া",
        "titleEn": "Beautiful Patience and the Restoration of Sight",
        "contentBn": "পুত্র ইউসুফকে কূপে ফেলে ভাইয়েরা যখন রক্তের জামা নিয়ে এসে বলল নেকড়ে খেয়েছে, ইয়াকুব (আ.) বললেন: \"তোমাদের মন একটি গল্প সাজিয়েছে, কাজেই সুন্দর ধৈর্যই (সবরে জামিল) আমার পথ।\" তিনি কাঁদতে কাঁদতে দৃষ্টিশক্তি হারান। কিন্তু তিনি বলতেন: \"আমি আমার দুঃখ ও অস্থিরতা কেবল আল্লাহর কাছেই নিবেদন করছি।\" পরবর্তীতে মিসর থেকে ইউসুফের জামা এনে চোখে ছোঁয়ানো মাত্রই তিনি দৃষ্টি ফিরে পান।",
        "contentEn": "When his sons brought Yusuf’s false bloodstained shirt claiming a wolf ate him, Yaqub said: \"Rather, your souls have enticed you to something, so patience is most fitting.\" Over years of weeping, his sight faded, yet he declared: \"I only complain of my suffering and my grief to Allah.\" When Yusuf’s shirt was cast over his face, his vision was miraculously restored."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা ইউসুফ",
        "surahNameEn": "Surah Yusuf",
        "surahNumber": 12,
        "ayahRange": "৮৬",
        "ayahArabic": "قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ وَأَعْلَمُ مِنَ اللَّهِ مَا لَا تَعْلَمُونَ",
        "translationBn": "তিনি বললেন, আমি আমার অসহনীয় বেদনা ও দুঃখের কথা কেবল আল্লাহর কাছেই নিবেদন করছি এবং আমি আল্লাহর পক্ষ থেকে এমন কিছু জানি যা তোমরা জানো না।",
        "translationEn": "He said, \"I only complain of my suffering and my grief to Allah, and I know from Allah that which you do not know.\""
      }
    ]
  },
  {
    "id": "yusuf",
    "number": 11,
    "nameAr": "يُوسُف",
    "nameBn": "হযরত ইউসুফ (আ.)",
    "nameEn": "Prophet Yusuf (Joseph) (AS)",
    "titleBn": "আহসানুল কাসাস (শ্রেষ্ঠ কাহিনীর নায়ক) ও সত্যবাদী সিদ্দীক",
    "titleEn": "The Noble Hero of the Best of Stories (As-Siddiq)",
    "eraBn": "খ্রিস্টপূর্ব ১৭৫০ অব্দ",
    "eraEn": "~1750 BCE",
    "locationBn": "কনআন ও মিসর",
    "locationEn": "Canaan & Egypt",
    "quranMentionsCount": 27,
    "quranMentionsBn": "পবিত্র কুরআনে ২৭ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 27 times in the Quran",
    "summaryBn": "হযরত ইউসুফ (আ.)-এর জীবন কাহিনীকে আল্লাহ কুরআনে \"আহসানুল কাসাস\" (সর্বশ্রেষ্ঠ কাহিনী) বলেছেন। ভাইদের হিংসায় অন্ধকূপে নিক্ষেপ, দাস হিসেবে বিক্রি, মিথ্যা অপবাদে দীর্ঘ কারাবাস এবং অবশেষে মিসরের অর্থ ও খাদ্যমন্ত্রী পদে অধিষ্ঠিত হয়ে ভাইদের ক্ষমা করার অমর ইতিহাস।",
    "summaryEn": "Prophet Yusuf (AS) is the protagonist of the Quran’s \"Best of Stories\". Thrown into a well by jealous brothers, sold into slavery in Egypt, falsely imprisoned for chastity, and ultimately elevated to Governor of Egypt, he exemplified forgiveness and divine justice.",
    "miraclesBn": [
      "স্বপ্নের নিখুঁত ও সত্য ব্যাখ্যা প্রদানের ঐশ্বরিক প্রজ্ঞা",
      "সাত বছরের মহাদুর্ভিক্ষ থেকে পুরো অঞ্চলকে খাদ্যে স্বয়ংসম্পূর্ণ রাখার পরিকল্পনা",
      "তাঁর পরিহিত জামা পিতার চোখে রাখা মাত্র দৃষ্টিশক্তি পুনরুদ্ধার"
    ],
    "miraclesEn": [
      "Divine gift of interpreting dreams and decoding future omens with accuracy",
      "Flawless economic planning saving Egypt and surrounding lands from a 7-year famine",
      "His tunic restoring sight to his blind father upon touching his eyes"
    ],
    "lessonsBn": [
      "প্রলোভন ও পাপের সুযোগ থাকা সত্ত্বেও আল্লাহর ভয়ে চরিত্র অটুট রাখা",
      "ক্ষমতা হাতে পাওয়ার পর শত্রুকে নিঃশর্ত ক্ষমা করে দেওয়ার মহত্ত্ব",
      "অন্ধকার কূপ বা কারাগারও আল্লাহর ফয়সালায় রাজপ্রাসাদে পরিণত হতে পারে"
    ],
    "lessonsEn": [
      "Unyielding chastity and consciousness of Allah in the face of temptation",
      "Magnificent forgiveness without reproach when holding absolute power over foes",
      "Trusting that dark wells and prison cells can become divine stepping stones to greatness"
    ],
    "sections": [
      {
        "titleBn": "কূপ থেকে রাজপ্রাসাদ ও পবিত্রতার জয়",
        "titleEn": "From the Well to the Palace: Victory of Purity",
        "contentBn": "১১টি নক্ষত্র, সূর্য ও চন্দ্রের সেজদা করার স্বপ্ন দেখে ইউসুফ জীবনে ভাইদের হিংসার শিকার হন। তাঁকে গভীর কূপে ফেলে দেওয়া হয়। সেখান থেকে এক কাফেলা তাঁকে উদ্ধার করে মিসরের এক মন্ত্রীর কাছে বিক্রি করে। সেখানে আজিজের স্ত্রীর কুপ্রস্তাব প্রত্যাখ্যান করে তিনি স্বেচ্ছায় কারাগার বেছে নেন এবং বলেন: \"হে আমার রব! এরা আমাকে যে অপরাধের দিকে ডাকছে তার চেয়ে কারাগার আমার কাছে অধিক প্রিয়!\"",
        "contentEn": "After dreaming of eleven stars, the sun, and moon prostrating to him, Yusuf was cast into a well by jealous brothers. Rescued by a caravan, he was sold into the house of the Aziz in Egypt. When tempted by the Aziz’s wife, he chose prison over sin, declaring: \"My Lord, prison is more to my liking than that to which they invite me.\""
      },
      {
        "titleBn": "মিসরের খাদ্যমন্ত্রী ও মহান ক্ষমা",
        "titleEn": "Governor of Egypt and the Unconditional Forgiveness",
        "contentBn": "বাদশাহর অদ্ভুত স্বপ্নের সঠিক ব্যাখ্যা দিয়ে ইউসুফ কারামুক্ত হন এবং মিসরের কোষাগার ও খাদ্যের দায়িত্ব পান। সাত বছরের সমৃদ্ধির সময় খাদ্য সঞ্চয় করে দুর্ভিক্ষে কোটি মানুষের জীবন বাঁচান। ক্ষুধার্থ ভাইয়েরা যখন খাদ্য নিতে মিসর আসে, ইউসুফ নিজের পরিচয় দেন। ভাইয়েরা লজ্জিত হয়ে ক্ষমা চাইলে ইউসুফ বললেন: \"আজ তোমাদের বিরুদ্ধে কোনো অভিযোগ নেই; আল্লাহ তোমাদের ক্ষমা করুন।\"",
        "contentEn": "By accurately interpreting the King’s dream of seven fat cows eaten by seven lean ones, Yusuf was freed and appointed Minister of Finance. He successfully stockpiled grain to feed millions. When his brothers arrived in need, he revealed his identity and famously declared: \"No blame will there be upon you today. May Allah forgive you; and He is the most merciful.\""
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা ইউসুফ",
        "surahNameEn": "Surah Yusuf",
        "surahNumber": 12,
        "ayahRange": "৯২",
        "ayahArabic": "قَالَ لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ",
        "translationBn": "তিনি বললেন, আজ তোমাদের বিরুদ্ধে কোনো অভিযোগ নেই; আল্লাহ তোমাদের ক্ষমা করুন, আর তিনি শ্রেষ্ঠ দয়ালু।",
        "translationEn": "He said, \"No blame will there be upon you today. May Allah forgive you; and He is the most merciful of the merciful.\""
      }
    ]
  },
  {
    "id": "ayyub",
    "number": 12,
    "nameAr": "أَيُّوب",
    "nameBn": "হযরত আইয়ুব (আ.)",
    "nameEn": "Prophet Ayyub (Job) (AS)",
    "titleBn": "চরম দুঃখ ও রোগযন্ত্রণায় অসীম ধৈর্যের প্রতীক",
    "titleEn": "The Pillar of Patience in Severe Affliction",
    "eraBn": "খ্রিস্টপূর্ব ১৬০০ অব্দ",
    "eraEn": "~1600 BCE",
    "locationBn": "হাওরান (সিরিয়া / জর্ডান সীমান্ত)",
    "locationEn": "Hauran (Syria/Jordan)",
    "quranMentionsCount": 4,
    "quranMentionsBn": "পবিত্র কুরআনে ৪ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 4 times in the Quran",
    "summaryBn": "হযরত আইয়ুব (আ.) ধন-সম্পদ, সন্তান ও সুস্বাস্থ্যের অধিকারী ছিলেন। আল্লাহ তাঁকে কঠিন পরীক্ষায় ফেলেন; তাঁর সব সম্পদ নষ্ট হয়, সন্তানরা মারা যায় এবং দীর্ঘ ১৮ বছর তিনি মারাত্মক দুরারোগ্য ব্যাধিতে ভোগেন। কখনো অভিযোগ না করে তিনি আল্লাহর শুকরিয়া আদায় করতেন।",
    "summaryEn": "Prophet Ayyub (AS) possessed immense wealth, children, and health before being tested with the loss of all property, death of his children, and an agonizing 18-year illness. He never uttered a word of despair, remaining devoted in worship and gratitude to Allah.",
    "miraclesBn": [
      "মাটিতে পা দিয়ে আঘাত করা মাত্র বরকতময় শীতল পানির ঝর্ণা প্রবাহিত হওয়া",
      "সেই ঝর্ণার পানিতে গোসল ও পান করার সাথে সাথে সমস্ত রোগ থেকে পূর্ণ মুক্তি",
      "আল্লাহর পক্ষ থেকে হারানো পরিবার ও সম্পদের দ্বিগুণ ফিরিয়ে দেওয়া"
    ],
    "miraclesEn": [
      "A cool healing spring bursting from the dry earth when striking his foot",
      "Instant complete cure from lifelong illness by bathing in and drinking the water",
      "Restoration of all his health, wealth, and children twofold by divine favor"
    ],
    "lessonsBn": [
      "কঠিনতম রোগ-শোক ও আর্থিক সংকটেও আল্লাহর প্রতি ভালোবাসা ও বিশ্বাস অটুট রাখা",
      "দোয়া করার আদব: নিজের কষ্ট বর্ণনা করে আল্লাহর দয়া কামনা করা, কোনো অনুযোগ না রাখা",
      "বিপদের পর সুদিন অবশ্যই আসে"
    ],
    "lessonsEn": [
      "Maintaining unconditional gratitude to Allah during the darkest trials of health or wealth",
      "Etiquette of supplication: presenting helplessness to Allah with humility rather than complaint",
      "Unwavering trust that ease follows hardship for the patient"
    ],
    "sections": [
      {
        "titleBn": "কঠিন পরীক্ষা ও ঐতিহাসিক দোয়া",
        "titleEn": "The Severe Trial and the Historic Dua",
        "contentBn": "আইয়ুব (আ.)-এর অসুস্থতা যখন চরমে পৌঁছাল এবং আত্মীয়স্বজন সবাই ছেড়ে গেল, তখনো তাঁর জবান আল্লাহর জিকিরে রত ছিল। তিনি বিনীতভাবে দোয়া করলেন: \"হে আমার রব! দুঃখ-কষ্ট আমাকে স্পর্শ করেছে, আর আপনি সর্বশ্রেষ্ঠ দয়ালু।\" আল্লাহ তাঁর দোয়া কবুল করে বললেন: \"তোমার পা দিয়ে মাটিতে আঘাত করো; এই যে শীতল গোসলের পানি ও পানীয়।\" পানিতে গোসল করতেই তিনি সম্পূর্ণ সুস্থ ও তরুণ রূপে ফিরে পেলেন।",
        "contentEn": "When his illness peaked and companions distanced themselves, only his faithful wife stayed by him. He beseeched: \"Indeed, adversity has touched me, and You are the Most Merciful of the merciful.\" Allah responded: \"Strike the ground with your foot; here is a cool spring for washing and drinking.\" He was instantly cured of all ailments."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আম্বিয়া",
        "surahNameEn": "Surah Al-Anbiya",
        "surahNumber": 21,
        "ayahRange": "৮৩-৮৪",
        "ayahArabic": "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ ۝ فَاسْتَجَبْنَا لَهُ فَكَشَفْنَا مَا بِهِ مِن ضُرٍّ",
        "translationBn": "আমি দুঃখ-কষ্টে পড়েছি, আর আপনি তো সর্বশ্রেষ্ঠ দয়ালু! তখন আমি তার ডাকে সাড়া দিলাম এবং তার কষ্ট দূর করে দিলাম।",
        "translationEn": "\"Indeed, adversity has touched me, and You are the most merciful of the merciful.\" So We responded to him and removed what afflicted him of adversity."
      }
    ]
  },
  {
    "id": "shuaib",
    "number": 13,
    "nameAr": "شُعَيْب",
    "nameBn": "হযরত শুআইব (আ.)",
    "nameEn": "Prophet Shu’aib (Jethro) (AS)",
    "titleBn": "খতিবুল আম্বিয়া (নবীদের শ্রেষ্ঠ বক্তা) ও মাদইয়ানের নবী",
    "titleEn": "Orator of the Prophets (Khatib al-Anbiya)",
    "eraBn": "খ্রিস্টপূর্ব ১৫৫০ অব্দ",
    "eraEn": "~1550 BCE",
    "locationBn": "মাদইয়ান ও আসহাবুল আইকাহ (উত্তর-পশ্চিম আরব)",
    "locationEn": "Madyan (Northwestern Arabia)",
    "quranMentionsCount": 11,
    "quranMentionsBn": "পবিত্র কুরআনে ১১ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 11 times in the Quran",
    "summaryBn": "হযরত শুআইব (আ.) অত্যন্ত সুমিষ্ট ও প্রাঞ্জল ভাষায় কথা বলতেন বলে তাঁকে \"খতিবুল আম্বিয়া\" বলা হয়। তিনি মাদইয়ানবাসীকে মূর্তিপূজা বর্জনের পাশাপাশি ব্যবসা-বাণিজ্যে মাপে কম দেওয়া, ওজনে কারচুপি ও দুর্নীতি থেকে বিরত থাকার জোর তাগিদ দিয়েছিলেন।",
    "summaryEn": "Prophet Shu’aib (AS), famed for his eloquence as \"Khatib al-Anbiya\", guided the merchant people of Madyan. He challenged economic fraud, demanding honesty in weights, measures, and fair trade alongside monotheism.",
    "miraclesBn": [
      "অত্যন্ত বাগ্মী ও প্রাঞ্জল উপস্থাপনায় সত্যের দাওয়াত প্রদান",
      "মেঘমালার ছায়া ও ভূমিকম্পের বিধ্বংসী শাস্তি থেকে মুমিনদের রক্ষা পাওয়া"
    ],
    "miraclesEn": [
      "Profound, moving eloquence and wisdom in public discourse and debate",
      "Survival from the scorching canopy of fire and tremor that struck Madyan"
    ],
    "lessonsBn": [
      "ব্যবসা-বাণিজ্যে সততা রক্ষা করা ও মাপে কম না দেওয়া ঈমানের অপরিহার্য অঙ্গ",
      "অর্থনৈতিক দুর্নীতি ও ভেজাল একটি জাতিকে ধ্বংস করে দেয়",
      "সাধ্যমতো সংস্কার করার চেষ্টা করা (ইন উরিদু ইল্লাল ইসলাহ)"
    ],
    "lessonsEn": [
      "Honesty in business, fair weights, and transparent transactions are core to Islamic worship",
      "Economic fraud and systemic corruption corrode societal foundations",
      "Commitment to continuous social reform according to one’s best ability"
    ],
    "sections": [
      {
        "titleBn": "ব্যবসা-বাণিজ্যে সততা ও ওজনের নির্দেশ",
        "titleEn": "Business Integrity and Just Measures",
        "contentBn": "মাদইয়ানবাসীরা ছিল ধনাঢ্য ব্যবসায়ী, কিন্তু তারা ওজনে কম দিত এবং ক্রেতাদের ঠকাত। শুআইব (আ.) বললেন: \"তোমরা মাপ ও ওজন পূর্ণ করো এবং মানুষের মালামালে কোনো ঘাটতি করো না; আর জমিনে বিশৃঙ্খলা সৃষ্টি করো না।\" তারা অহংকার করে বলল: \"হে শুআইব! তোমার নামাজ কি তোমাকে এই শিক্ষা দেয় যে আমরা আমাদের বাপ-দাদার ধর্ম ছেড়ে দেব?\" অবশেষে তীব্র ভূমিকম্প ও ছায়াযুক্ত মেঘের বজ্রপাতে তারা ধ্বংস হলো।",
        "contentEn": "Madyan was a prosperous trade hub where merchants routinely cheated customers with false balances. Shu’aib warned: \"Give full measure and weight with justice and do not deprive people of their due.\" They arrogantly mocked: \"Does your prayer command you that we leave what our fathers worshiped?\" Ultimately, an earthquake and fiery canopy cloud engulfed them."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা হূদ",
        "surahNameEn": "Surah Hud",
        "surahNumber": 11,
        "ayahRange": "৮৮",
        "ayahArabic": "إِنْ أُرِيدُ إِلَّا الْإِصْلَاحَ مَا اسْتَطَعْتُ ۚ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
        "translationBn": "আমি তো কেবল আমার সাধ্যমতো সংস্কার করতে চাই; আর আমার সাফল্য তো কেবল আল্লাহরই সাহায্যে।",
        "translationEn": "I only intend reform to the best of my power. And my success is not but through Allah."
      }
    ]
  },
  {
    "id": "musa",
    "number": 14,
    "nameAr": "مُوسَى",
    "nameBn": "হযরত মূসা (আ.)",
    "nameEn": "Prophet Musa (Moses) (AS)",
    "titleBn": "কালিমুল্লাহ (আল্লাহর সাথে সরাসরি বাক্যালাপকারী) ও উলুল আজম নবী",
    "titleEn": "Kalimullah (The One Who Spoke Directly to Allah)",
    "eraBn": "খ্রিস্টপূর্ব ১৫০০-১৪০০ অব্দ",
    "eraEn": "~1450 BCE",
    "locationBn": "মিসর, সিনাই পর্বত ও ফিলিস্তিন সীমান্ত",
    "locationEn": "Egypt, Mount Sinai & Wilderness",
    "quranMentionsCount": 136,
    "quranMentionsBn": "পবিত্র কুরআনে সর্বাধিক ১৩৬ বার উল্লেখিত",
    "quranMentionsEn": "Most mentioned in the Quran (136 times)",
    "summaryBn": "হযরত মূসা (আ.) অত্যাচারী ফেরাউনের রাজপ্রাসাদে লালিত-পালিত হয়ে নবুওয়াত লাভ করেন। তুর পাহাড়ে আল্লাহর সাথে সরাসরি কথা বলেন। বিখ্যাত ৯টি অলৌকিক নিদর্শন প্রদর্শন করেন এবং লোহিত সাগর দ্বিখণ্ডিত করে বনী ইসরাঈলকে ফেরাউনের দাসত্ব থেকে মুক্ত করেন।",
    "summaryEn": "Prophet Musa (AS) was raised in Pharaoh’s palace, spoke directly with Allah at Mount Sinai, and confronted tyranny armed with nine undeniable miracles. By striking the Red Sea with his staff, he parted the waters, liberating Bani Israel from bondage while Pharaoh drowned.",
    "miraclesBn": [
      "হাতের লাঠি নিক্ষেপ করামাত্র বিশাল অজগর সাপে পরিণত হওয়া",
      "বগলে হাত ঢুকিয়ে বের করলে শুভ্র উজ্জ্বল নূরের আলো বিকিরণ করা",
      "লাঠির আঘাতে লোহিত সাগরের পানি দ্বিখণ্ডিত হয়ে শুকনো রাস্তা তৈরি হওয়া",
      "পাথরে লাঠি মারতেই বনী ইসরাঈলের ১২টি গোত্রের জন্য ১২টি মিষ্টি পানির ঝর্ণা ফোটা",
      "সিনাই পর্বতে আল্লাহর পক্ষ থেকে তাওরাত কিতাবের তখতি লাভ"
    ],
    "miraclesEn": [
      "His wooden staff transforming into a living, devouring serpent",
      "His hand drawing forth from under his arm radiant with dazzling white light",
      "Parting the Red Sea into twelve towering walls of water upon striking it",
      "Striking a rock to gush twelve springs of sweet water for the twelve tribes",
      "Receiving the holy tablets of the Torah directly on Mount Sinai"
    ],
    "lessonsBn": [
      "অত্যাচারী শাসকের সামনে সত্য প্রকাশে অকুতোভয় সাহস",
      "চরম বিপদেও আল্লাহর ওপর নিখাদ তাওয়াক্কুল (\"কখনই নয়! আমার রব আমার সাথে আছেন, তিনি পথ দেখাবেন\")",
      "বনী ইসরাঈলের অকৃতজ্ঞতা থেকে শিক্ষা নিয়ে আল্লাহর নিয়ামতের শুকরিয়া আদায় করা"
    ],
    "lessonsEn": [
      "Fearless courage speaking truth to power in the presence of brutal tyrants",
      "Absolute conviction in Allah’s presence during entrapment (\"Nay, my Lord is with me; He will guide me\")",
      "The peril of ingratitude and disobedience despite witnessing undeniable miracles"
    ],
    "sections": [
      {
        "titleBn": "তুর পাহাড়ে ওহী ও ফেরাউনের দরবার",
        "titleEn": "Mount Sinai Revelation and Pharaoh’s Court",
        "contentBn": "সিনাইয়ের তুর পাহাড়ে আগুনের আলো দেখে মূসা (আ.) অগ্রসর হলে আল্লাহ তাঁকে ডেকে বললেন: \"হে মূসা! নিশ্চয় আমিই আল্লাহ, বিশ্বজগতের পালনকর্তা।\" আল্লাহ তাঁকে লাঠি ও শুভ্র হাতের মুজিযাহ দিয়ে অহংকারী ফেরাউনকে হেদায়েতের জন্য পাঠালেন। দরবারে ফেরাউনের জাদুকররা দড়ি ও লাঠি ফেলে সাপ বানানোর ভেল্কি দেখালে মূসার লাঠি একাই সব খেয়ে ফেলল। জাদুকররা তৎক্ষণাৎ সেজদায় লুটিয়ে পড়ে এক আল্লাহর ওপর ঈমান আনল।",
        "contentEn": "Drawn to a fire on Mount Sinai, Musa heard the majestic call of Allah: \"O Moses, indeed I am Allah, Lord of the worlds.\" Armed with his transforming staff and glowing hand, he challenged Pharaoh. When Pharaoh’s magicians cast optical illusions, Musa’s staff devoured their fabrications; the magicians fell in prostration, believing in the Lord of Moses."
      },
      {
        "titleBn": "লোহিত সাগর পার ও ফেরাউনের সলিল সমাধি",
        "titleEn": "Parting of the Red Sea and Pharaoh’s Drowning",
        "contentBn": "বনী ইসরাঈলকে নিয়ে রাতের বেলা বের হলে ফেরাউন তার বিশাল বাহিনী নিয়ে ধাওয়া করল। সামনে উত্তাল লোহিত সাগর, পেছনে দুর্ধর্ষ শত্রু। সঙ্গীরা ভয়ে চিৎকার করে বলল: \"আমরা তো ধরা পড়ে গেলাম!\" মূসা শান্তকণ্ঠে বললেন: \"কখনই নয়! আমার রব আমার সাথে আছেন, তিনি পথ দেখাবেন।\" মূসা সাগরে লাঠি মারতেই পানি দুভাগ হয়ে শুকনা রাস্তা হয়ে গেল। মুমিনরা পার হয়ে গেল এবং অহংকারী ফেরাউন পানিতে ডুবে ধ্বংস হলো।",
        "contentEn": "Cornered between the Red Sea and Pharaoh’s cavalry, the Israelites cried: \"Indeed, we are overtaken!\" Musa replied with iron faith: \"No! Indeed, with me is my Lord; He will guide me.\" Striking the sea, it parted into twelve crystal paths. The believers traversed safely, while the waves crashed down over Pharaoh and his legions."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আশ-শুআরা",
        "surahNameEn": "Surah Ash-Shuara",
        "surahNumber": 26,
        "ayahRange": "৬২-৬৩",
        "ayahArabic": "قَالَ كَلَّا ۖ إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ ۝ فَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنِ اضْرِب بِّعَصَاكَ الْبَحْرَ ۖ فَانفَلَقَ",
        "translationBn": "তিনি বললেন, কখনই নয়! নিশ্চয় আমার রব আমার সাথে আছেন, তিনি আমাকে পথ দেখাবেন। অতঃপর আমি মূসাকে ওহী করলাম, তোমার লাঠি দিয়ে সাগরে আঘাত করো। ফলে তা দ্বিখণ্ডিত হয়ে গেল।",
        "translationEn": "[Moses] said, \"No! Indeed, with me is my Lord; He will guide me.\" Then We inspired to Moses, \"Strike with your staff the sea,\" and it parted."
      }
    ]
  },
  {
    "id": "harun",
    "number": 15,
    "nameAr": "هَارُون",
    "nameBn": "হযরত হারূন (আ.)",
    "nameEn": "Prophet Harun (Aaron) (AS)",
    "titleBn": "মূসা (আ.)-এর ভ্রাতা, সহচর ও সুবক্তা নবী",
    "titleEn": "Brother and Eloquent Partner of Musa (AS)",
    "eraBn": "খ্রিস্টপূর্ব ১৫০০ অব্দ",
    "eraEn": "~1450 BCE",
    "locationBn": "মিসর ও সিনাই উপদ্বীপ",
    "locationEn": "Egypt & Sinai Peninsula",
    "quranMentionsCount": 20,
    "quranMentionsBn": "পবিত্র কুরআনে ২০ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 20 times in the Quran",
    "summaryBn": "হযরত হারূন (আ.) ছিলেন হযরত মূসা (আ.)-এর সহোদর বড় ভাই। মূসা (আ.)-এর দোয়ার বদৌলতে আল্লাহ তাঁকে নবুওয়াত দান করেন। তিনি ছিলেন অত্যন্ত বাগ্মী, প্রজ্ঞাবান ও কোমল হৃদয়ের মানুষ, যিনি ফেরাউনের সামনে ও সিনাই প্রান্তরে মূসা (আ.)-কে পূর্ণ সহযোগিতা করেছিলেন।",
    "summaryEn": "Prophet Harun (AS) was the elder brother and devoted confidant of Musa (AS), appointed as a prophet in response to Musa’s heartfelt prayer. Endowed with exceptional eloquence and gentle wisdom, he supported Musa before Pharaoh and guarded the Israelites.",
    "miraclesBn": [
      "মূসা (আ.)-এর দোয়ায় সরাসরি নবুওয়াতের মর্যাদা লাভ",
      "লোহিত সাগর অতিক্রমের অলৌকিক যাত্রায় মূসা (আ.)-এর সাথে অংশগ্রহণ"
    ],
    "miraclesEn": [
      "Elevated directly to Prophethood in response to brother Musa’s prayer",
      "Co-leading the historic exodus and miraculous crossing of the Red Sea"
    ],
    "lessonsBn": [
      "দ্বীনের কাজে পারস্পরিক ভ্রাতৃত্ব ও সহযোগিতার গুরুত্ব",
      "কঠিন পরিস্থিতিতে ধৈর্য ও প্রজ্ঞাপূর্ণ নেতৃত্ব দেওয়া",
      "নেতৃত্বের অনুপস্থিতিতে সমাজে একতা ধরে রাখার চেষ্টা করা"
    ],
    "lessonsEn": [
      "The power of brotherhood, shared responsibility, and teamwork in service to God",
      "Combining firm resolve with gentle persuasion in leadership",
      "Preserving community unity and preventing schism during times of crisis"
    ],
    "sections": [
      {
        "titleBn": "দোয়া ও যৌথ দাওয়াতের অভিযান",
        "titleEn": "Musa’s Supplication and the Joint Mission",
        "contentBn": "নবুওয়াত পাওয়ার পর মূসা (আ.) আল্লাহর কাছে দোয়া করেছিলেন: \"আমার পরিবার থেকে আমার ভাই হারূনকে আমার সাহায্যকারী বানিয়ে দিন; তার দ্বারা আমার শক্তি সুদৃঢ় করুন এবং তাকে আমার কাজে অংশীদার করুন।\" আল্লাহ দোয়া কবুল করলেন। হারূন ছিলেন সুন্দর বক্তা। তিনি মূসার পাশে থেকে ফেরাউনের অহংকার চূর্ণ করতে অটল ভূমিকা পালন করেন।",
        "contentEn": "Upon receiving his mission, Musa supplicated: \"Appoint for me a minister from my family, Aaron, my brother. Increase through him my strength and let him share my task.\" Allah granted this prayer. Harun’s eloquence and composure complemented Musa’s resolve in confronting Pharaoh."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা ত্বা-হা",
        "surahNameEn": "Surah Ta-Ha",
        "surahNumber": 20,
        "ayahRange": "২৯-৩২",
        "ayahArabic": "وَاجْعَل لِّي وَزِيرًا مِّنْ أَهْلِي ۝ هَارُونَ أَخِي ۝ اشْدُدْ بِهِ أَزْرِي ۝ وَأَشْرِكْهُ فِي أَمْرِي",
        "translationBn": "আর আমার জন্য আমার পরিবার থেকে একজন সাহায্যকারী বানিয়ে দিন—আমার ভাই হারূনকে। তার দ্বারা আমার শক্তি বৃদ্ধি করুন এবং তাকে আমার কাজে অংশীদার করুন।",
        "translationEn": "And appoint for me a minister from my family - Aaron, my brother. Increase through him my strength and let him share my task."
      }
    ]
  },
  {
    "id": "dhulkifl",
    "number": 16,
    "nameAr": "ذُو الكِفْل",
    "nameBn": "হযরত যুলকিফল (আ.)",
    "nameEn": "Prophet Dhul-Kifl (Ezekiel) (AS)",
    "titleBn": "প্রতিশ্রুতি পালনকারী ও ধৈর্যশীল পুণ্যবান নবী",
    "titleEn": "The Man of Supreme Pledges and Patience",
    "eraBn": "খ্রিস্টপূর্ব ১২০০ অব্দ",
    "eraEn": "~1200 BCE",
    "locationBn": "সিরিয়া ও ইরাক",
    "locationEn": "Syria & Iraq",
    "quranMentionsCount": 2,
    "quranMentionsBn": "পবিত্র কুরআনে ২ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 2 times in the Quran",
    "summaryBn": "হযরত যুলকিফল (আ.) ছিলেন চরম সহনশীল, সত্যবাদী ও প্রতিশ্রুতি রক্ষাকারী নবী। তিনি দিনের বেলায় রোজা রাখতেন, সারা রাত নামাজ পড়তেন এবং মানুষের মধ্যে ন্যায়বিচার প্রতিষ্ঠা করতেন। শয়তানের সব প্ররোচনা সত্ত্বেও তিনি কখনো ক্রুদ্ধ বা বিচ্যুত হননি।",
    "summaryEn": "Prophet Dhul-Kifl (AS) was renowned for his strict adherence to divine covenants and patient perseverance. He fasted during the day, spent nights in prayer, and judged disputes with perfect equity, never allowing anger to distract him from righteousness.",
    "miraclesBn": [
      "কুরআনে বিশেষ ধৈর্যশীল ও নেককারদের সারিতে প্রশংসিত হওয়া",
      "শয়তানের জটিলতম উসকানি ও বিভ্রান্তি সত্ত্বেও অটল ন্যায়বিচার বজায় রাখা"
    ],
    "miraclesEn": [
      "Honored in the Quran among the foremost icons of patience and divine mercy",
      "Maintaining infallible judicial fairness and calm despite cunning satanic provocations"
    ],
    "lessonsBn": [
      "প্রতিশ্রুতি দিলে তা যেকোনো মূল্যে পূরণ করা",
      "রাগ ও উত্তেজনা সংবরণ করে প্রজ্ঞা দিয়ে বিচার করা",
      "দিনের কর্মব্যস্ততার মাঝেও রাতের ইবাদতের অভ্যাস গড়ে তোলা"
    ],
    "lessonsEn": [
      "Upholding pledges and moral contracts with absolute fidelity",
      "Mastering anger and emotional stability when rendering fair judgments",
      "Balancing heavy worldly civic duties with profound nocturnal devotion"
    ],
    "sections": [
      {
        "titleBn": "প্রতিশ্রুতি ও ন্যায়বিচারের মহিমা",
        "titleEn": "The Weight of Covenants and Righteous Reign",
        "contentBn": "যুলকিফল শব্দের অর্থ \"যিনি দায়িত্ব পালন করেন\"। তিনি প্রতিশ্রুতি দিয়েছিলেন যে তিনি দিনে রোজা রাখবেন, রাতে সালাত আদায় করবেন এবং কখনো রাগান্বিত হবেন না। ইবলিস নানা ছদ্মবেশে এসে তাঁর সালাত ও ঘুমের সময় বিঘ্ন সৃষ্টি করে রাগানোর চেষ্টা করেছিল; কিন্তু যুলকিফল অসীম শান্তিতে সব মোকাবিলা করে দায়িত্ব পালন করেন।",
        "contentEn": "The name Dhul-Kifl signifies \"the one of the covenant\". He pledged to fast by day, pray by night, and govern without anger. Even when Iblis manifested as an annoying litigant specifically during his sleep hours to provoke rage, Dhul-Kifl remained serene and fulfilled his duty."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আম্বিয়া",
        "surahNameEn": "Surah Al-Anbiya",
        "surahNumber": 21,
        "ayahRange": "৮৫-৮৬",
        "ayahArabic": "وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ ۖ كُلٌّ مِّنَ الصَّابِرِينَ ۝ وَأَدْخَلْنَاهُمْ فِي رَحْمَتِنَا ۖ إِنَّهُم مِّنَ الصَّالِحِينَ",
        "translationBn": "আর স্মরণ করো ইসমাঈল, ইদরিস ও যুলকিফলের কথা; তাদের প্রত্যেকেই ছিল ধৈর্যশীল। আমি তাদের আমার রহমতের অন্তর্ভুক্ত করেছিলাম, তারা ছিল সৎকর্মশীল।",
        "translationEn": "And [mention] Ishmael and Idris and Dhul-Kifl; all were of the patient. And We admitted them into Our mercy. Indeed, they were of the righteous."
      }
    ]
  },
  {
    "id": "dawud",
    "number": 17,
    "nameAr": "دَاوُود",
    "nameBn": "হযরত দাঊদ (আ.)",
    "nameEn": "Prophet Dawud (David) (AS)",
    "titleBn": "যবুর কিতাবের প্রাপক, বিজয়ী বাদশাহ ও সুমিষ্ট সুরের নবী",
    "titleEn": "Recipient of the Zabur, Victorious King & Psalmist",
    "eraBn": "খ্রিস্টপূর্ব ১০৪০-৯৭০ অব্দ",
    "eraEn": "~1000 BCE",
    "locationBn": "জেরুজালেম / ফিলিস্তিন",
    "locationEn": "Jerusalem / Palestine",
    "quranMentionsCount": 16,
    "quranMentionsBn": "পবিত্র কুরআনে ১৬ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 16 times in the Quran",
    "summaryBn": "হযরত দাঊদ (আ.) জালুতকে বধ করে বনী ইসরাঈলের নেতৃত্ব লাভ করেন। আল্লাহ তাঁকে রাজত্ব ও নবুওয়াত দুটোই দান করেন এবং আসমানী কিতাব \"যবুর\" নাজিল করেন। তাঁর সুমিষ্ট কণ্ঠের সাথে পাহাড় ও পাখিরাও আল্লাহর তাসবিহ পড়ত এবং তাঁর হাতে লোহা মোমের মতো নরম হয়ে যেত।",
    "summaryEn": "Prophet Dawud (AS) slew the tyrant Goliath (Jalut) in his youth and was granted both kingship and prophethood by Allah. Blessed with the divine scripture Zabur (Psalms), mountains and birds echoed his praises of Allah, and iron became miraculously pliable in his bare hands.",
    "miraclesBn": [
      "তাঁর সুমিষ্ট তিলাওয়াত শুনে পাহাড় ও পাখিকূলের সমস্বরে আল্লাহর প্রশংসা করা",
      "কঠিন লোহা হাত দিয়ে স্পর্শ করামাত্র নরম মোমে পরিণত হওয়া (বর্ম তৈরি)",
      "এক ঢিলে জালুত নামক দানবীয় অত্যাচারী সেনাপতিকে পরাস্ত করা"
    ],
    "miraclesEn": [
      "Mountains and birds gathering to chant praises of Allah along with his melodious voice",
      "Solid iron softening like wax in his bare hands without fire to weave chainmail armor",
      "Defeating the giant Goliath with a single stone from his slingshot"
    ],
    "lessonsBn": [
      "শারীরিক বা বাহ্যিক দুর্বলতা আল্লাহর সাহায্যে বিশাল পরাশক্তিকে হারাতে পারে",
      "ক্ষমতা ও সাম্রাজ্য থাকার পরও নিজের শ্রমে জীবিকা নির্বাহ করা (দাঊদ নিজে বর্ম বানিয়ে খেতেন)",
      "দাঊদি রোজা: একদিন রোজা রাখা ও একদিন না রাখা আল্লাহর কাছে প্রিয়তম ইবাদত"
    ],
    "lessonsEn": [
      "Worldly odds mean nothing when divine aid is present; faith triumphs over tyranny",
      "Earning one’s own livelihood through honorable trade despite possessing kingship",
      "The Fast of Dawud: alternating fasting every other day as the most beloved voluntary fast"
    ],
    "sections": [
      {
        "titleBn": "জালুত বধ ও আল্লাহর প্রশংসায় পাহাড়-পাখির মেলা",
        "titleEn": "Defeating Goliath and Creation Chanting with Dawud",
        "contentBn": "জালুতের বিশাল বাহিনীর সামনে মুমিনরা যখন শংকিত, তখন তরুণ দাঊদ এগিয়ে এলেন এবং গুলতি দিয়ে পাথর নিক্ষেপ করে জালুতকে ধরাশায়ী করলেন। আল্লাহ তাঁকে সিংহাসন ও নবুওয়াত দিলেন। যখন দাঊদ (আ.) যবুর পাঠ করতেন, বনের পশু-পাখি ও সুবিশাল পর্বতমালা মুগ্ধ হয়ে তাঁর সাথে আল্লাহর গুণগান গাইত। তিনি রাজ্য পরিচালনা করতেন পরম সুবিচার দিয়ে।",
        "contentEn": "Confronting Goliath’s terrifying army, the young Dawud stepped forward armed only with a sling and deep trust in Allah. He felled Goliath with a single stone. Later crowned King and Prophet, whenever Dawud sang the Zabur, birds froze in the sky and mountains echoed his glorifications of God."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা সাবা",
        "surahNameEn": "Surah Saba",
        "surahNumber": 34,
        "ayahRange": "১০",
        "ayahArabic": "وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا ۖ يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ ۖ وَأَلَنَّا لَهُ الْحَدِيدَ",
        "translationBn": "আর আমি দাঊদকে আমার পক্ষ থেকে অনুগ্রহ দান করেছিলাম; হে পর্বতমালা! তোমরা তার সাথে সুর মেলাও এবং পাখিরাও। আর আমি তার জন্য লোহাকে নরম করে দিয়েছিলাম।",
        "translationEn": "And We certainly gave David from Us bounty. [We said], \"O mountains, repeat [Our] praises with him, and the birds [as well].\" And We made pliable for him iron."
      }
    ]
  },
  {
    "id": "sulaiman",
    "number": 18,
    "nameAr": "سُلَيْمَان",
    "nameBn": "হযরত সুলাইমান (আ.)",
    "nameEn": "Prophet Sulaiman (Solomon) (AS)",
    "titleBn": "জিন, বাতাস ও প্রাণিকূলের অধিপতি মহামান্বিত বাদশাহ",
    "titleEn": "Monarch over Wind, Jinn, and the Animal Kingdom",
    "eraBn": "খ্রিস্টপূর্ব ৯৭০-৯৩১ অব্দ",
    "eraEn": "~960 BCE",
    "locationBn": "জেরুজালেম ও শাম",
    "locationEn": "Jerusalem / Levant",
    "quranMentionsCount": 17,
    "quranMentionsBn": "পবিত্র কুরআনে ১৭ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 17 times in the Quran",
    "summaryBn": "হযরত সুলাইমান (আ.) ছিলেন দাঊদ (আ.)-এর পুত্র। আল্লাহ তাঁকে এমন এক অতুলনীয় সাম্রাজ্য দান করেছিলেন যা ইতিহাসে আর কাউকে দেওয়া হয়নি। তিনি বাতাসকে বশীভূত করেছিলেন, জিনদের নিয়ন্ত্রণ করতেন এবং পিঁপড়া ও পাখিদের ভাষা বুঝতে পারতেন। এত বিশাল ক্ষমতার মাঝেও তিনি ছিলেন পরম কৃতজ্ঞ।",
    "summaryEn": "Prophet Sulaiman (AS), son of Dawud (AS), ruled a peerless empire granted by Allah. The wind was subjugated to his travel, jinn served under his command, and he comprehended the languages of birds and ants, remaining perpetually humble and grateful before Allah.",
    "miraclesBn": [
      "বাতাসের নিয়ন্ত্রণ: সকালের এক মাসের পথ এবং সন্ধ্যার এক মাসের পথ অতিক্রম",
      "জিন ও শয়তানদের বশীভূত করে সুরম্য স্থাপত্য ও বায়তুল মুকাদ্দাস নির্মাণ",
      "পিঁপড়া, হুদহুদ পাখি ও সমস্ত জীবজন্তুর ভাষা বোঝার ক্ষমতা",
      "গলিত তামার ঝর্ণা প্রবাহিত হওয়া"
    ],
    "miraclesEn": [
      "Subjugated wind carrying his airborne armies a month’s journey in a morning",
      "Commanding the unseen jinn to construct grand monuments and Masjid al-Aqsa",
      "Understanding the complex speech and emotional states of birds, ants, and animals",
      "A miraculous spring of molten copper flowing forth for metal craftsmanship"
    ],
    "lessonsBn": [
      "অসীম ক্ষমতা ও ধনসম্পদ পেয়েও বিন্দুমাত্র অহংকার না করে আল্লাহর শুকরিয়া আদায় করা",
      "ক্ষুদ্রতম প্রাণীর জীবনের মূল্য উপলব্ধি করা (পিঁপড়ার কথার জবাবে মুচকি হাসি)",
      "প্রজ্ঞাপূর্ণ কূটনীতি ও হিকমতের মাধ্যমে দাওয়াত পৌঁছানো (রানি বিলকিসের ঘটনা)"
    ],
    "lessonsEn": [
      "Unsurpassed wealth and power channeled entirely into gratitude and service to Allah",
      "Compassion for the smallest creations (smiling at the warning of the tiny ant)",
      "Wise, dignified diplomacy leading sovereign rulers to Islam (Queen of Sheba)"
    ],
    "sections": [
      {
        "titleBn": "পিঁপড়ার উপত্যকা ও রানি বিলকিস",
        "titleEn": "Valley of the Ants and Queen Bilqis",
        "contentBn": "একবার সুলাইমান (আ.) বিশাল সৈন্যবাহিনী নিয়ে চলার সময় এক পিঁপড়া অন্য পিঁপড়াদের বলল: \"হে পিঁপড়েরা! গর্তে ঢোকো, নইলে সুলাইমানের বাহিনী না জেনে তোমাদের পিষে ফেলবে।\" সুলাইমান তার কথা শুনে মুচকি হাসলেন এবং আল্লাহর নিয়ামতের শুকরিয়া আদায় করলেন। পরবর্তীতে হুদহুদ পাখির মাধ্যমে খবর পেয়ে তিনি সাবার রানি বিলকিসকে চিঠি পাঠালেন: \"বিসমিল্লাহির রাহমানির রাহিম—তোমরা অহংকার না করে আত্মসমর্পণ করে আমার কাছে এসো।\" রানি সত্য উপলব্ধি করে মুসলমান হলেন।",
        "contentEn": "Marching through a valley, Sulaiman heard an ant warn its colony to take shelter lest Solomon’s unaware army crush them. Sulaiman smiled and prayed for gratitude. Informed by the hoopoe bird of the sun-worshiping kingdom of Saba, Sulaiman dispatched a letter beginning with Bismillah, guiding Queen Bilqis to embrace Islam peacefully."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আন-নামল",
        "surahNameEn": "Surah An-Naml",
        "surahNumber": 27,
        "ayahRange": "১৯",
        "ayahArabic": "فَتَبَسَّمَ ضَاحِكًا مِّن قَوْلِهَا وَقَالَ رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
        "translationBn": "তখন সে তার কথায় মুচকি হাসল এবং বলল, হে আমার রব! আমাকে সামর্থ্য দিন যাতে আমি আপনার সেই নিয়ামতের শুকরিয়া আদায় করতে পারি যা আপনি আমাকে ও আমার পিতা-মাতাকে দান করেছেন।",
        "translationEn": "So [Solomon] smiled, amused at her speech, and said, \"My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents.\""
      }
    ]
  },
  {
    "id": "ilyas",
    "number": 19,
    "nameAr": "إِلْيَاس",
    "nameBn": "হযরত ইলিয়াস (আ.)",
    "nameEn": "Prophet Ilyas (Elijah) (AS)",
    "titleBn": "বা’ল দেবতার পূজার বিরুদ্ধে সিংহহৃদয় নবী",
    "titleEn": "Unyielding Monotheist Against Baal Worship",
    "eraBn": "খ্রিস্টপূর্ব ৯০০ অব্দ",
    "eraEn": "~900 BCE",
    "locationBn": "বালবাক (লেবানন / শাম)",
    "locationEn": "Baalbek (Lebanon / Levant)",
    "quranMentionsCount": 2,
    "quranMentionsBn": "পবিত্র কুরআনে ২ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 2 times in the Quran",
    "summaryBn": "হযরত ইলিয়াস (আ.) বনী ইসরাঈলের এক পথভ্রষ্ট সম্প্রদায়ের কাছে প্রেরিত হন যারা \"বা’ল\" নামক স্বর্ণমূর্তির পূজা করত। তিনি তাদের এক আল্লাহর দিকে আহ্বান জানান এবং মূর্তিপূজার অসারতা তুলে ধরেন। আল্লাহ তাঁকে বিশেষ সম্মান ও উচ্চ মর্যাদা দান করেছিলেন।",
    "summaryEn": "Prophet Ilyas (AS) was sent to an errant branch of the Israelites in ancient Phoenicia who worshiped the golden idol Baal. He fearlessly condemned idolatry, preaching pure monotheism and leaving an enduring legacy of steadfastness.",
    "miraclesBn": [
      "তাঁর দোয়ায় দীর্ঘ অনাবৃষ্টির পর প্রচুর বৃষ্টিপাত হওয়া",
      "প্রকাণ্ড মূর্তিপূজকদের ষড়যন্ত্রের মাঝেও আল্লাহর বিশেষ নিরাপত্তায় বেঁচে থাকা"
    ],
    "miraclesEn": [
      "End of prolonged drought in response to his prayers for rain",
      "Miraculous divine protection while standing alone against idolatrous monarchs"
    ],
    "lessonsBn": [
      "সমাজ যতই মূর্তিপূজা বা শিরকে লিপ্ত হোক, এক আল্লাহর ওপর আস্থা রাখা",
      "সৃষ্টিকর্তা ছেড়ে কোনো সৃষ্টিকে অতিমূল্যায়িত না করা",
      "আল্লাহর দ্বীনের জন্য প্রতিকূল পরিবেশে অটল থাকা"
    ],
    "lessonsEn": [
      "Never bowing to cultural pressures when society normalizes spiritual falsehood",
      "Refusing to attribute divine qualities to any created object or idol",
      "Steadfast courage in calling people back to their true Creator"
    ],
    "sections": [
      {
        "titleBn": "বা’ল মূর্তির বিরোধিতা ও তাওহিদের ঘোষণা",
        "titleEn": "Condemning Baal and Calling to the True Creator",
        "contentBn": "হযরত ইলিয়াস (আ.) তাঁর সম্প্রদায়কে লক্ষ্য করে বললেন: \"তোমরা কি বা’ল দেবতার কাছে প্রার্থনা করছ এবং সর্বশ্রেষ্ঠ স্রষ্টা আল্লাহকে পরিত্যাগ করছ—যিনি তোমাদের প্রতিপালক এবং তোমাদের পূর্বপুরুষদের প্রতিপালক?\" তারা তাঁর কথায় কর্ণপাত করেনি এবং তাঁকে অস্বীকার করেছিল। আল্লাহ ইলিয়াস (আ.)-কে পরবর্তী প্রজন্মের কাছে স্মরণীয় ও প্রশংসিত করে রেখেছেন।",
        "contentEn": "Prophet Ilyas challenged his people: \"Do you call upon Baal and forsake the Best of creators - Allah, your Lord and the Lord of your first forefathers?\" The rulers rejected him, but Allah preserved his noble memory through the ages as one of the elite righteous servants."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আস-সাফফাত",
        "surahNameEn": "Surah As-Saffat",
        "surahNumber": 37,
        "ayahRange": "১২৪-১২৬",
        "ayahArabic": "إِذْ قَالَ لِقَوْمِهِ أَلَا تَتَّقُونَ ۝ أَتَدْعُونَ بَعْلًا وَتَذَرُونَ أَحْسَنَ الْخَالِقِينَ ۝ اللَّهَ رَبَّكُمْ وَرَبَّ آبَائِكُمُ الْأَوَّلِينَ",
        "translationBn": "যখন সে তার সম্প্রদায়কে বলল, তোমরা কি আল্লাহকে ভয় করবে না? তোমরা কি বা’ল দেবতার পূজা করছ এবং শ্রেষ্ঠ স্রষ্টাকে বর্জন করছ? আল্লাহ তো তোমাদের রব এবং তোমাদের পূর্বপুরুষদেরও রব।",
        "translationEn": "When he said to his people, \"Will you not fear Allah? Do you call upon Baal and leave the best of creators - Allah, your Lord and the Lord of your first forefathers?\""
      }
    ]
  },
  {
    "id": "alyasa",
    "number": 20,
    "nameAr": "الْيَسَع",
    "nameBn": "হযরত আল-ইয়াসা (আ.)",
    "nameEn": "Prophet Al-Yasa (Elisha) (AS)",
    "titleBn": "ধার্মিক পথপ্রদর্শক ও ইলিয়াস (আ.)-এর যোগ্য উত্তরসূরি",
    "titleEn": "Righteous Guide and Successor to Ilyas (AS)",
    "eraBn": "খ্রিস্টপূর্ব ৮৫০ অব্দ",
    "eraEn": "~850 BCE",
    "locationBn": "সিরিয়া ও ফিলিস্তিন",
    "locationEn": "Syria & Palestine",
    "quranMentionsCount": 2,
    "quranMentionsBn": "পবিত্র কুরআনে ২ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 2 times in the Quran",
    "summaryBn": "হযরত আল-ইয়াসা (আ.) ছিলেন হযরত ইলিয়াস (আ.)-এর সঙ্গী ও উত্তরসূরি নবী। তিনি সারা জীবন তাওরাত কিতাব ও তাওহিদের আলোকে বনী ইসরাঈলকে সঠিক পথের দিশা দিয়েছেন। আল্লাহ তাঁকে শ্রেষ্ঠ ও পুণ্যবানদের তালিকায় স্থান দিয়েছেন।",
    "summaryEn": "Prophet Al-Yasa (AS) was the steadfast companion and successor of Prophet Ilyas (AS). He carried forward the mantle of prophetic guidance, teaching the Torah, resolving disputes, and being honored by Allah among the chosen righteous.",
    "miraclesBn": [
      "কুরআনে বিশ্বের সর্বশ্রেষ্ঠ মর্যাদাবান নবীগণের কাতারে ঘোষিত হওয়া",
      "প্রচুর রোগী আরোগ্য ও আধ্যাত্মিক পথপ্রদর্শনের বারাকাত"
    ],
    "miraclesEn": [
      "Exalted in the Quran above the worlds alongside the foremost prophets",
      "Blessed with divine healings and spiritual guidance across the Levant"
    ],
    "lessonsBn": [
      "যোগ্য উত্তরসূরি তৈরি করা এবং দ্বীনের ধারা বজায় রাখা",
      "অহংকারমুক্ত পুণ্যময় জীবনযাপন",
      "আল্লাহর বিধানের প্রতি নিরবচ্ছিন্ন আনুগত্য"
    ],
    "lessonsEn": [
      "The importance of mentorship and carrying forward prophetic leadership",
      "Living a life of humble, consistent service away from vanity",
      "Unyielding dedication to divine law across generations"
    ],
    "sections": [
      {
        "titleBn": "পুণ্যবানদের অগ্রদূত",
        "titleEn": "Leader Among the Righteous Elect",
        "contentBn": "হযরত আল-ইয়াসা (আ.) সারাজীবন আল্লাহর দ্বীন প্রতিষ্ঠায় কাজ করে গেছেন। পবিত্র কুরআনে আল্লাহ তাঁকে বিশেষ সম্মান দিয়ে অন্যান্য মহান নবীদের সাথে এক কাতারে উল্লেখ করেছেন এবং ঘোষণা করেছেন যে তারা প্রত্যেকেই ছিল জগতের ওপর শ্রেষ্ঠ মর্যাদাবান।",
        "contentEn": "Prophet Al-Yasa dedicated his life to preserving monotheism and serving his people with profound compassion and wisdom. Allah specifically honored him in Surah Al-An’am and Sad as being among the chosen elite who were favored above all creation."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আনআম",
        "surahNameEn": "Surah Al-Anam",
        "surahNumber": 6,
        "ayahRange": "৮৬",
        "ayahArabic": "وَإِسْمَاعِيلَ وَالْيَسَعَ وَيُونُسَ وَلُوطًا ۚ وَكُلًّا فَضَّلْنَا عَلَى الْعَالَمِينَ",
        "translationBn": "এবং ইসমাঈল, আল-ইয়াসা, ইউনুস ও লূত—তাদের প্রত্যেককেই আমি সারা বিশ্বের ওপর শ্রেষ্ঠত্ব দান করেছিলাম।",
        "translationEn": "And Ishmael and Elisha and Jonah and Lot - and all [of them] We preferred over the worlds."
      }
    ]
  },
  {
    "id": "yunus",
    "number": 21,
    "nameAr": "يُونُس",
    "nameBn": "হযরত ইউনুস (আ.)",
    "nameEn": "Prophet Yunus (Jonah) (AS)",
    "titleBn": "যুন-নূন (মাছের পেটের যাত্রী) ও তওবার প্রতীক",
    "titleEn": "Dhun-Nun (Companion of the Whale) & Symbol of Tawbah",
    "eraBn": "খ্রিস্টপূর্ব ৮০০ অব্দ",
    "eraEn": "~800 BCE",
    "locationBn": "নিনাওয়া (মোসুল / ইরাক) ও ভূমধ্যসাগর",
    "locationEn": "Nineveh (Mosul, Iraq) & Mediterranean",
    "quranMentionsCount": 4,
    "quranMentionsBn": "পবিত্র কুরআনে ৪ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 4 times in the Quran",
    "summaryBn": "হযরত ইউনুস (আ.) নিনাওয়াবাসীর অবাধ্যতায় ক্ষুব্ধ হয়ে আল্লাহর অনুমতির আগেই জনপদ ত্যাগ করেন। সমুদ্রে জাহাজের লটারিতে হেরে গেলে এক বিশাল তিমি মাছ তাঁকে গিলে ফেলে। মাছের পেটের ঘোর অন্ধকারে তিনি ঐতিহাসিক তওবা করেন: \"লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নি কুন্তু মিনায যলিমীন।\" আল্লাহ তাঁকে উদ্ধার করেন এবং তাঁর পুরো জাতি তওবা করে ঈমান আনে।",
    "summaryEn": "Prophet Yunus (AS) left Nineveh prematurely when his people resisted truth. Cast into the raging sea after drawing lots, he was swallowed alive by a giant whale. From the triple darkness of the belly, ocean, and night, he cried: \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.\" Allah delivered him, and his entire nation turned to faith.",
    "miraclesBn": [
      "বিশাল তিমি মাছের পেটে অক্সিজেন ও খাদ্য ছাড়া অক্ষত অবস্থায় জীবিত থাকা",
      "মাছের পেট থেকে তীরে নিক্ষিপ্ত হওয়ার পর লাউ গাছ (ইয়াকতীন) গজিয়ে ছায়া ও খাদ্য প্রদান",
      "একটি সম্পূর্ণ জাতির (১ লাখেরও বেশি মানুষ) তওবা করে আল্লাহর গজব থেকে রক্ষা পাওয়া"
    ],
    "miraclesEn": [
      "Surviving unharmed within the stomach of a colossal whale in the deep ocean abyss",
      "A gourd plant miraculously springing up on the shore to provide shade and nourishment",
      "An entire city of over 100,000 citizens collectively repenting and averting divine punishment"
    ],
    "lessonsBn": [
      "যেকোনো চরম বিপদ, হতাশা বা সংকটে ইউনুস (আ.)-এর দোয়া (দোয়ায়ে ইউনুস) পাঠ করা",
      "আল্লাহর অনুমতি বা নির্দেশ ছাড়া কোনো দায়িত্ব থেকে সরে না যাওয়া",
      "নিজের ভুল বুঝতে পেরে আল্লাহর কাছে বিনম্র স্বীকৃতি দেওয়া"
    ],
    "lessonsEn": [
      "The supreme potency of the Dua of Yunus for relief from all forms of anxiety and distress",
      "Never abandoning duties of guidance without divine permission",
      "Immediate, humble acknowledgment of one’s shortcomings directly to Allah"
    ],
    "sections": [
      {
        "titleBn": "তিমি মাছের পেট ও অন্ধকারে অশ্রুভরা মুনাজাত",
        "titleEn": "In the Belly of the Whale: The Cry in the Dark",
        "contentBn": "ইউনুস (আ.) জাহাজে উঠলে ঝড় উঠল। যাত্রী কমানোর লটারিতে তিনবারই ইউনুসের নাম এলো। তিনি সাগরে ঝাঁপ দিলে এক বিশাল তিমি মাছ তাঁকে গিলে ফেলল। মাছের পেটের অন্ধকারের মাঝে তিনি বুঝতে পারলেন তাঁর ত্রুটি হয়েছে। তিনি কান্নাজড়িত কণ্ঠে নিবেদন করলেন: \"লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নি কুন্তু মিনায যলিমীন\" (আপনি ছাড়া কোনো ইলাহ নেই, আপনি পবিত্র, নিশ্চয় আমি অপরাধীদের অন্তর্ভুক্ত)। আল্লাহ তাঁর দোয়া শুনলেন এবং তিমিকে নির্দেশ দিলেন তাঁকে অক্ষত অবস্থায় তীরে উগলে দিতে।",
        "contentEn": "To save a storm-tossed vessel, lots were cast and Yunus was thrown overboard. A great whale swallowed him. Inside the threefold darkness of fish, deep ocean, and night, he recognized his impatience and called out: \"La ilaha illa anta, subhanaka inni kuntu minaz-zalimin.\" Allah accepted his repentance, commanded the whale to deposit him safely on shore, and revived him."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আম্বিয়া",
        "surahNameEn": "Surah Al-Anbiya",
        "surahNumber": 21,
        "ayahRange": "৮৭",
        "ayahArabic": "فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
        "translationBn": "অতঃপর সে অন্ধকারের মধ্যে ডেকে বলল, আপনি ছাড়া কোনো সত্য ইলাহ নেই, আপনি অতি পবিত্র! নিশ্চয় আমি জালিমদের অন্তর্ভুক্ত ছিলাম।",
        "translationEn": "And he called out within the darknesses, \"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.\""
      }
    ]
  },
  {
    "id": "zakariyya",
    "number": 22,
    "nameAr": "زَكَرِيَّا",
    "nameBn": "হযরত যাকারিয়া (আ.)",
    "nameEn": "Prophet Zakariyya (Zechariah) (AS)",
    "titleBn": "মারইয়ামের অভিভাবক ও দোয়ার বরকতে সন্তান লাভকারী নবী",
    "titleEn": "Guardian of Maryam and Prophet of Supplication",
    "eraBn": "খ্রিস্টপূর্ব ১০০ অব্দ",
    "eraEn": "~100 BCE",
    "locationBn": "জেরুজালেম (বায়তুল মুকাদ্দাস)",
    "locationEn": "Jerusalem (Bayt al-Maqdis)",
    "quranMentionsCount": 7,
    "quranMentionsBn": "পবিত্র কুরআনে ৭ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 7 times in the Quran",
    "summaryBn": "হযরত যাকারিয়া (আ.) ছিলেন বায়তুল মুকাদ্দাসের প্রধান খাদেম ও মারইয়াম (আ.)-এর অভিভাবক। চরম বার্ধক্যে মাথার চুল সাদা হয়ে যাওয়া এবং স্ত্রীর বন্ধ্যাত্ব সত্ত্বেও তিনি আল্লাহর কাছে একাগ্রচিত্তে এক যোগ্য উত্তরাধিকারীর দোয়া করেছিলেন। আল্লাহ তাঁকে মহিমান্বিত পুত্র ইয়াহইয়া (আ.)-এর সুসংবাদ দেন।",
    "summaryEn": "Prophet Zakariyya (AS) was the elder priest of Bayt al-Maqdis and guardian of Maryam (AS). Despite his extreme old age, fragile bones, and wife’s barrenness, he poured his heart out in secret supplication for a righteous heir. Allah answered with the birth of Prophet Yahya (AS).",
    "miraclesBn": [
      "মারইয়াম (আ.)-এর কক্ষে অসময়ের জান্নাতী ফল দেখতে পাওয়া",
      "চরম বৃদ্ধ বয়সে বন্ধ্যা স্ত্রীর গর্ভে পুত্র ইয়াহইয়া (আ.)-এর অলৌকিক জন্ম",
      "আল্লাহর নির্দেশে তিন দিন কেবল ইশারা ছাড়া সাধারণ কথা বন্ধ থাকা"
    ],
    "miraclesEn": [
      "Discovering miraculous out-of-season fruits provided directly to Maryam by Allah",
      "Conception of Yahya to elderly, biologically barren parents through divine command",
      "Being unable to speak to people for three days except by gestures as a sign"
    ],
    "lessonsBn": [
      "আল্লাহর কাছে একান্তে গোপনে ব্যাকুল হয়ে দোয়া করা (নিদাআন খাফিয়্যা)",
      "চিকিৎসা বিজ্ঞানের দৃষ্টিতে যা অসম্ভব, আল্লাহর হুকুমে তা মুহূর্তেই সম্ভব হতে পারে",
      "পরবর্তী প্রজন্মের দ্বীনি হেফাজতের জন্য নেককার সন্তানের কামনা করা"
    ],
    "lessonsEn": [
      "The profound beauty of private, heartfelt whisper supplications (Nida’an Khafiyya)",
      "Physical impossibilities vanish instantly before the supreme decree of Allah",
      "Supplicating for righteous offspring to carry forward faith and virtue"
    ],
    "sections": [
      {
        "titleBn": "গোপন মুনাজাত ও ইয়াহইয়ার সুসংবাদ",
        "titleEn": "The Secret Prayer and the Glad Tidings of Yahya",
        "contentBn": "মারইয়ামের কাছে আল্লাহর জান্নাতী রিজিক দেখে যাকারিয়া (আ.) অনুপ্রাণিত হয়ে মেহরাবে দাঁড়িয়ে দোয়া করলেন: \"হে আমার রব! আমার হাড়গুলো দুর্বল হয়ে গেছে, মাথায় শুভ্র বার্ধক্য ছড়িয়ে পড়েছে, কিন্তু আপনার কাছে চেয়ে আমি কখনো ব্যর্থ হইনি। আমাকে আপনার পক্ষ থেকে এক পবিত্র সন্তান দান করুন।\" ফেরেশতারা এসে সুসংবাদ দিলেন: \"আল্লাহ আপনাকে ইয়াহইয়ার সুসংবাদ দিচ্ছেন, যে আল্লাহর একটি বাণীর সত্যায়নকারী হবে।\"",
        "contentEn": "Witnessing miraculous provisions in Maryam’s sanctuary, Zakariyya was moved to pray: \"My Lord, my bones have grown frail and gray hair has covered my head, yet never have I been unblessed in my prayer to You. Grant me from Yourself a righteous heir.\" Angels called to him while he stood in prayer: \"Allah gives you glad tidings of John (Yahya).\""
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা মারইয়াম",
        "surahNameEn": "Surah Maryam",
        "surahNumber": 19,
        "ayahRange": "৪",
        "ayahArabic": "قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا وَلَمْ أَكُن بِدُعَائِكَ رَبِّ شَقِيًّا",
        "translationBn": "সে বলল, হে আমার রব! আমার অস্থিগুলো দুর্বল হয়ে গেছে এবং বার্ধক্যে মাথা সাদা হয়ে উঠেছে; আর হে আমার রব! আপনাকে ডেকে আমি কখনো বঞ্চিত হইনি।",
        "translationEn": "He said, \"My Lord, indeed my bones have grown weak, and gray hair has covered my head, and never have I been in my supplication to You, my Lord, unblessed.\""
      }
    ]
  },
  {
    "id": "yahya",
    "number": 23,
    "nameAr": "يَحْيَى",
    "nameBn": "হযরত ইয়াহইয়া (আ.)",
    "nameEn": "Prophet Yahya (John the Baptist) (AS)",
    "titleBn": "পবিত্র, কোমল হৃদয়ের শহীদ নবী (হাসুর)",
    "titleEn": "The Chaste, Compassionate Prophet & Martyr",
    "eraBn": "১ম শতক (খ্রিস্টপূর্ব ১ম শতক)",
    "eraEn": "~1st Century BCE / CE",
    "locationBn": "জেরুজালেম ও জর্ডান নদী উপত্যকা",
    "locationEn": "Jerusalem & Jordan River Valley",
    "quranMentionsCount": 5,
    "quranMentionsBn": "পবিত্র কুরআনে ৫ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 5 times in the Quran",
    "summaryBn": "হযরত ইয়াহইয়া (আ.) ছিলেন হযরত যাকারিয়া (আ.)-এর পুত্র। আল্লাহ স্বয়ং তাঁর নাম রেখেছিলেন যা আগে কারও ছিল না। তিনি শৈশবেই প্রজ্ঞা, কিতাবের জ্ঞান এবং জীবজগতের প্রতি অগাধ মমতা লাভ করেছিলেন। তিনি ঈসা (আ.)-এর নবুওয়াতের সত্যতা ঘোষণা করেন এবং সত্যের জন্য শাহাদাত বরণ করেন।",
    "summaryEn": "Prophet Yahya (AS), son of Zakariyya (AS), was uniquely named by Allah Himself. Endowed from early childhood with divine wisdom, mastery of scripture, and tenderness toward all living creatures, he bore witness to the word of Isa (AS) and gave his life as a righteous martyr for truth.",
    "miraclesBn": [
      "আল্লাহর পক্ষ থেকে সরাসরি তাঁর অনন্য নাম নির্ধারণ",
      "শৈশবকালেই ঐশ্বরিক প্রজ্ঞা ও তাওরাত কিতাবের পূর্ণ দখল লাভ",
      "পাপ ও অহংকার থেকে সম্পূর্ণ পবিত্র ও নিষ্পাপ চরিত্র"
    ],
    "miraclesEn": [
      "Named directly by Allah with a name never given to anyone before him",
      "Granted divine wisdom, scriptural mastery, and emotional purity while still a youth",
      "Extremely chaste, gentle, and obedient to parents, free from arrogance"
    ],
    "lessonsBn": [
      "শৈশব থেকেই দ্বীনি জ্ঞান ও চারিত্রিক পবিত্রতা অর্জন",
      "পিতামাতার প্রতি চরম অনুগত ও কোমল আচরণ করা",
      "বাতিলের সামনে কখনো মাথানত না করা"
    ],
    "lessonsEn": [
      "Pursuing spiritual knowledge, empathy, and moral discipline from youth",
      "Devotion and gentleness toward parents as an essential trait of righteousness",
      "Courageously upholding divine truth even in the face of political persecution"
    ],
    "sections": [
      {
        "titleBn": "শৈশবের প্রজ্ঞা ও চারিত্রিক পবিত্রতা",
        "titleEn": "Wisdom in Youth and Immaculate Chastity",
        "contentBn": "আল্লাহ ইয়াহইয়া (আ.) সম্পর্কে বলেছেন: \"হে ইয়াহইয়া! কিতাবটিকে দৃঢ়তার সাথে আঁকড়ে ধরো।\" আল্লাহ তাঁকে শৈশবেই প্রজ্ঞা, ভালোবাসা ও পবিত্রতা দান করেছিলেন। তিনি ছিলেন পিতা-মাতার প্রতি অত্যন্ত অনুগত এবং অবাধ্য বা উদ্ধত ছিলেন না। তাঁর জন্মদিনে, মৃত্যুর দিনে এবং যেদিন তিনি জীবিত হয়ে পুনরুত্থিত হবেন—সব দিনে তাঁর ওপর শান্তি বর্ষিত হয়েছে।",
        "contentEn": "Allah commanded: \"O John, take the Scripture with determination.\" He was endowed with wisdom while still a child, alongside deep affection and purity. Gentle and devoted to his parents, he was neither arrogant nor rebellious. Peace is upon him the day he was born, the day he died, and the day he will be raised alive."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা মারইয়াম",
        "surahNameEn": "Surah Maryam",
        "surahNumber": 19,
        "ayahRange": "১২-১৩",
        "ayahArabic": "يَا يَحْيَىٰ خُذِ الْكِتَابَ بِقُوَّةٍ ۖ وَآتَيْنَاهُ الْحُكْمَ صَبِيًّا ۝ وَحَنَانًا مِّن لَّدُنَّا وَزَكَاةً ۖ وَكَانَ تَقِيًّا",
        "translationBn": "হে ইয়াহইয়া! কিতাবকে দৃঢ়ভাবে ধারণ করো; আর আমি তাকে শৈশবেই প্রজ্ঞা দান করেছিলাম। এবং আমার পক্ষ থেকে স্নেহ ও পবিত্রতা; সে ছিল পরম পরহেজগার।",
        "translationEn": "[Allah said], \"O John, take the Scripture with determination.\" And We gave him judgement while yet a boy, and affection from Us and purity, and he was devout."
      }
    ]
  },
  {
    "id": "isa",
    "number": 24,
    "nameAr": "عِيسَى",
    "nameBn": "হযরত ঈসা (আ.)",
    "nameEn": "Prophet Isa (Jesus) (AS)",
    "titleBn": "রুহুল্লাহ, কালিমাতুল্লাহ ও মসীহ (উলুল আজম নবী)",
    "titleEn": "Spirit of Allah, Word of Allah & The Messiah (Ruhullah)",
    "eraBn": "১ম শতক (খ্রিস্টীয় অব্দের সূচনা)",
    "eraEn": "~1–33 CE",
    "locationBn": "জেরুজালেম, বেথলেহেম ও নাসিরাত (ফিলিস্তিন)",
    "locationEn": "Jerusalem, Bethlehem & Nazareth",
    "quranMentionsCount": 25,
    "quranMentionsBn": "পবিত্র কুরআনে ২৫ বার উল্লেখিত",
    "quranMentionsEn": "Mentioned 25 times in the Quran",
    "summaryBn": "হযরত ঈসা (আ.) কুমারী মারইয়াম (আ.)-এর গর্ভে পিতা ছাড়া আল্লাহর এক অলৌকিক বাণীতে জন্ম নেন। তিনি দোলনায় থাকা অবস্থায় কথা বলেন, অন্ধ ও কুষ্ঠরোগীদের সুস্থ করেন এবং আল্লাহর হুকুমে মৃতকে জীবিত করেন। ইহুদিরা তাঁকে হত্যার ষড়যন্ত্র করলে আল্লাহ তাঁকে আকাশে তুলে নেন। তিনি কিয়ামতের পূর্বে পুনরায় পৃথিবীতে আগমন করবেন।",
    "summaryEn": "Prophet Isa (AS) was born miraculously without a father to the virgin Maryam (AS) by the word of Allah. As an infant he spoke in defense of his mother, restored sight to the blind, healed lepers, and raised the dead by Allah’s leave. Saved from crucifixion, he was raised bodily to the heavens and will return before the Day of Judgment.",
    "miraclesBn": [
      "পিতা ছাড়া কুমারী মারইয়াম (আ.)-এর গর্ভে আল্লাহর বাণীতে জন্ম লাভ",
      "দোলনায় নবজাতক অবস্থায় স্পষ্ট ভাষায় কথা বলে মায়ের পবিত্রতার সাক্ষ্য দান",
      "মাটি দিয়ে পাখির অবয়ব বানিয়ে ফুঁ দিলে জীবন্ত পাখিতে পরিণত হওয়া",
      "জন্মান্ধ ও শ্বেতকুষ্ঠ রোগীকে আল্লাহর হুকুমে নিমিষে সুস্থ করা",
      "আল্লাহর হুকুমে মৃত মানুষকে কবর থেকে জীবিত করা",
      "ক্রুশারোহণ থেকে রক্ষা পেয়ে সশরীরে আসমানে উত্থিত হওয়া"
    ],
    "miraclesEn": [
      "Miraculous conception without a human father to the virgin Maryam",
      "Speaking eloquently as a newborn in the cradle defending his mother’s honor",
      "Fashioning clay birds and breathing into them to become living birds by Allah’s leave",
      "Curing those born blind and severe lepers with a touch by Allah’s leave",
      "Raising the dead back to life by Allah’s leave",
      "Rescued from crucifixion and bodily ascended alive into the heavens"
    ],
    "lessonsBn": [
      "আল্লাহর অপার কুদরত: আদমকে যেমন মাটি থেকে বানিয়েছেন, ঈসাকেও পিতা ছাড়া বানিয়েছেন",
      "জগতের মোহে অন্ধ না হয়ে আখেরাতমুখী জীবনযাপন",
      "নবী মুহাম্মদ (ﷺ)-এর আগমনের স্পষ্ট সুসংবাদ দিয়ে যাওয়া (আহমাদ নামে)"
    ],
    "lessonsEn": [
      "The omnipotence of Allah: creating Isa without a father just as Adam without parents",
      "Living a life of profound asceticism, detached from worldly vanity",
      "Explicitly prophesying the coming of the Final Messenger Ahmad / Muhammad (ﷺ)"
    ],
    "sections": [
      {
        "titleBn": "দোলনার অলৌকিক কথা ও মুজিযাহসমূহ",
        "titleEn": "The Miracle in the Cradle and Signs of Prophethood",
        "contentBn": "মারইয়াম যখন নবজাতক সন্তানকে নিয়ে বাড়ি ফিরলেন, লোকেরা অপবাদ দিতে শুরু করল। মারইয়াম শিশুর দিকে ইশারা করলেন। লোকেরা বলল: \"দোলনার শিশুর সাথে আমরা কীভাবে কথা বলব?\" তখন শিশু ঈসা বলে উঠলেন: \"নিশ্চয় আমি আল্লাহর বান্দা! তিনি আমাকে কিতাব দিয়েছেন এবং নবী করেছেন।\" বড় হয়ে ঈসা (আ.) ইঞ্জিল কিতাবের দাওয়াত দিলেন। তিনি মাটির পাখি বানিয়ে ফুঁ দিলে তা উড়ে যেত এবং আল্লাহর হুকুমে মৃত মানুষ জীবিত হতো।",
        "contentEn": "When Maryam returned carrying baby Isa, people cast insinuations. Maryam pointed to the infant. They asked: \"How can we speak to a baby in the cradle?\" The infant spoke: \"Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet.\" As an adult, he proclaimed the Injil, formed living birds from clay, cured the blind, and raised the dead by Allah’s leave."
      },
      {
        "titleBn": "ক্রুশবিদ্ধ করার অপচেষ্টা ও আকাশে উত্তোলন",
        "titleEn": "The Foiled Crucifixion and Ascension",
        "contentBn": "ইহুদি নেতারা রোমান শাসকদের প্ররোচিত করে ঈসা (আ.)-কে হত্যার ষড়যন্ত্র করল। কিন্তু আল্লাহ তাঁর নবীকে রক্ষা করলেন। কুরআন স্পষ্ট ভাষায় বলে: \"তারা তাকে হত্যা করেনি এবং তাকে ক্রুশবিদ্ধও করেনি, বরং তাদের জন্য বিষয়টি সাদৃশ্যপূর্ণ করা হয়েছিল। আল্লাহ তাকে নিজের কাছে তুলে নিয়েছেন।\" কিয়ামতের পূর্বে তিনি পৃথিবীতে অবতরণ করে দাজ্জালকে বধ করবেন এবং ন্যায়বিচার কায়েম করবেন।",
        "contentEn": "Hostile leaders conspired with Roman authorities to crucify Isa. Allah foiled their plot, as the Quran states: \"They killed him not, nor did they crucify him, but another was made to resemble him. Rather, Allah raised him to Himself.\" Before the end of time, Isa will descend to defeat the Dajjal and establish peace under Islamic truth."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-ইমরান",
        "surahNameEn": "Surah Ali Imran",
        "surahNumber": 3,
        "ayahRange": "৫৯",
        "ayahArabic": "إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ ۖ خَلَقَهُ مِن تُرَابٍ ثُمَّ قَالَ لَهُ كُن فَيَكُونُ",
        "translationBn": "নিশ্চয় আল্লাহর কাছে ঈসার দৃষ্টান্ত আদমের মতোই; তিনি তাকে মাটি থেকে সৃষ্টি করেছিলেন, অতঃপর তাকে বলেছিলেন, ‘হও’, ফলে সে হয়ে গেল।",
        "translationEn": "Indeed, the example of Jesus to Allah is like that of Adam. He created him from dust; then He said to him, \"Be,\" and he was."
      }
    ]
  },
  {
    "id": "muhammad",
    "number": 25,
    "nameAr": "مُحَمَّد",
    "nameBn": "হযরত মুহাম্মদ (ﷺ)",
    "nameEn": "Prophet Muhammad (SAW)",
    "titleBn": "খাতামুন নাবিয়্যীন (সর্বশ্রেষ্ঠ ও সর্বশেষ নবী) ও রহমাতুল্লিল আলামীন",
    "titleEn": "The Seal of the Prophets & Mercy to All Creation",
    "eraBn": "৫৭০ – ৬৩২ খ্রিস্টাব্দ",
    "eraEn": "570 – 632 CE",
    "locationBn": "মক্কা মুকাররমা ও মদিনা মুনাওয়ারা (হেজাজ)",
    "locationEn": "Makkah & Madinah (Arabia)",
    "quranMentionsCount": 4,
    "quranMentionsBn": "পবিত্র কুরআনে নাম ৪ বার এবং পদে পদে উল্লেখিত",
    "quranMentionsEn": "Directly named 4 times & addressed throughout the Quran",
    "summaryBn": "আল্লাহর সর্বশ্রেষ্ঠ ও সর্বশেষ রাসুল হযরত মুহাম্মদ (ﷺ)। ৪০ বছর বয়সে হেরা গুহায় ওহী লাভ করেন এবং পবিত্র কুরআন প্রাপ্ত হন। মক্কার ১৩ বছরের চরম নির্যাতন ও মদিনায় ১০ বছরের রাষ্ট্রনায়কোচিত প্রজ্ঞার মাধ্যমে তিনি গোটা বিশ্বকে জাহেলিয়াতের অন্ধকার থেকে মুক্ত করে মানবতার চিরন্তন মুক্তির পথ দেখিয়েছেন।",
    "summaryEn": "The Final Messenger of Allah and Seal of the Prophets, Muhammad (ﷺ) received the Holy Quran in Cave Hira at age 40. Through 13 years of steadfast endurance in Makkah and 10 years of transformative leadership in Madinah, he elevated humanity from ignorance to the light of divine truth, mercy, and justice.",
    "miraclesBn": [
      "চিরন্তন জীবন্ত মুজিযাহ: পবিত্র আল-কুরআনুল কারীম",
      "এক ইশারায় পূর্ণিমার চাঁদ দ্বিখণ্ডিত হওয়া (শাক্কুল কমার)",
      "ইসরা ও মিরাজ: এক রাতে ঊর্ধ্বাকাশে গমন ও আল্লাহর সান্নিধ্য লাভ",
      "আঙ্গুলসমূহের ফাঁক দিয়ে সুমিষ্ট পানির ঝর্ণা প্রবাহিত হয়ে সাহাবিদের পিপাসা মেটানো",
      "গাছ ও পাথরের সালাম প্রদান এবং তাঁর বিরহে খেজুর গাছের কান্নার আওয়াজ শোনা"
    ],
    "miraclesEn": [
      "The eternal, living miracle: The Holy Quran",
      "The miraculous splitting of the moon by pointing his finger (Shaqq al-Qamar)",
      "Al-Isra wal-Mi’raj: Night journey from Makkah to Jerusalem and ascension through the seven heavens",
      "Water gushing from between his blessed fingers quenching the thirst of thousands",
      "Trees greeting him and the palm trunk weeping aloud out of longing for him"
    ],
    "lessonsBn": [
      "অনুপম চরিত্র ও আখলাক: ক্ষমা, সত্যবাদিতা, আমানতদারি ও দয়ার জীবন্ত প্রতীক",
      "কুরআন ও সুন্নাহর আলোকে ব্যক্তি, পরিবার, সমাজ ও রাষ্ট্র পরিচালনার চিরন্তন দিশা",
      "জীবনের প্রতিটি ক্ষেত্রে মধ্যপন্থা ও মানবপ্রেম বজায় রাখা"
    ],
    "lessonsEn": [
      "The peak of moral perfection: mercy, honesty, trustworthiness, and boundless compassion",
      "Timeless blueprints for personal, family, and civic life guided by the Quran and Sunnah",
      "Moderation, peace, dignity, and sincere love for humanity in all affairs"
    ],
    "sections": [
      {
        "titleBn": "জন্ম, হেরা গুহা ও প্রথম ওহী",
        "titleEn": "Birth, Cave Hira, and the First Revelation",
        "contentBn": "৫৭০ খ্রিস্টাব্দে পিতা আবদুল্লাহ ও মাতা আমিনার কোলে এতিম হয়ে জন্মগ্রহণ করেন। সত্যবাদিতা ও আমানতদারির কারণে শৈশবেই মক্কাবাসী তাঁকে ‘আল-আমিন’ (বিশ্বস্ত) উপাধিতে ভূষিত করে। ৪০ বছর বয়সে জাবালে নূরের হেরা গুহায় ধ্যানমগ্ন অবস্থায় ফেরেশতা জিবরাইল (আ.) এসে বললেন: \"ইকরা—পড়ো তোমার রবের নামে যিনি সৃষ্টি করেছেন!\" এভাবে মানবজাতির মুক্তির বাণী মহাগ্রন্থ আল-কুরআন নাজিল শুরু হয়।",
        "contentEn": "Born an orphan in Makkah in 570 CE, Muhammad was revered for his integrity and known as Al-Amin (The Trustworthy). At age 40, meditating in Cave Hira on Mount Nur, angel Jibril arrived with the first divine words: \"Read in the name of your Lord who created!\" Thus began the revelation of the Holy Quran."
      },
      {
        "titleBn": "মক্কার ত্যাগ, মিরাজ ও মদিনা সনদ",
        "titleEn": "Makkah Trials, Isra & Mi’raj, and the Madinah Model",
        "contentBn": "মক্কার ১৩ বছর কুরাইশদের অসহনীয় নির্যাতন সহ্য করে তিনি সাহাবিদের সান্ত্বনা দেন। এই কঠিন সময়ে আল্লাহ তাঁকে সশরীরে মিরাজে নিয়ে যান এবং পাঁচ ওয়াক্ত নামাজের উপহার দেন। পরবর্তীতে আল্লাহর আদেশে মদিনায় হিজরত করেন। সেখানে তিনি মসজিদ-ই-নববী প্রতিষ্ঠা করেন, মুহাজির ও আনসারদের মাঝে অভূতপূর্ব ভ্রাতৃত্ব স্থাপন করেন এবং পৃথিবীর প্রথম লিখিত সংবিধান \"মদিনা সনদ\" প্রণয়ন করে সকল ধর্মের মানুষের জানমালের নিরাপত্তা নিশ্চিত করেন।",
        "contentEn": "During 13 painful years in Makkah, Muhammad weathered relentless boycotts and persecution. In the Year of Sorrow, Allah blessed him with Al-Isra wal-Mi’raj, gifting the five daily prayers. Migrating to Madinah (Hijrah), he built the Prophet’s Mosque, instituted brotherhood, and drafted the Constitution of Madinah, guaranteeing civil and religious rights to all citizens."
      },
      {
        "titleBn": "মক্কা বিজয় ও ঐতিহাসিক বিদায় হজ",
        "titleEn": "The Conquest of Makkah and the Farewell Pilgrimage",
        "contentBn": "হিজরি ৮ম সনে ১০ হাজার সাহাবি নিয়ে রক্তপাতহীনভাবে মক্কা বিজিত হয়। যে কুরাইশরা তাঁকে হত্যা করতে চেয়েছিল, কাবা চত্বরে তাদের সামনে তিনি ঐতিহাসিক ঘোষণা দেন: \"আজ তোমাদের বিরুদ্ধে কোনো প্রতিশোধ নেই, তোমরা সবাই মুক্ত!\" বিদায় হজের ভাষণে ১ লক্ষাধিক সাহাবির সামনে তিনি মানবাধিকারের ঐতিহাসিক দলিল পেশ করেন: \"কোনো আরবের ওপর অনারবের শ্রেষ্ঠত্ব নেই, শ্রেষ্ঠত্ব কেবল তাকওয়ার ভিত্তিতে।\" ৬৩২ খ্রিস্টাব্দে তিনি মহান রবের সান্নিধ্যে গমন করেন।",
        "contentEn": "In 8 AH, Muhammad entered Makkah victorious without shedding blood. Addressing the conquered chieftains who had tortured him for decades, he declared: \"No blame is upon you today. Go, for you are free.\" During the Farewell Pilgrimage before 120,000 companions, he proclaimed human equality: \"An Arab has no superiority over a non-Arab except by piety.\" He passed away in 632 CE."
      }
    ],
    "quranReferences": [
      {
        "surahNameBn": "সূরা আল-আম্বিয়া",
        "surahNameEn": "Surah Al-Anbiya",
        "surahNumber": 21,
        "ayahRange": "১০৭",
        "ayahArabic": "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ",
        "translationBn": "আর আমি আপনাকে সমগ্র বিশ্বজগতের জন্য রহমত ছাড়া আর কোনো উদ্দেশ্যে পাঠাইনি।",
        "translationEn": "And We have not sent you, [O Muhammad], except as a mercy to the worlds."
      },
      {
        "surahNameBn": "সূরা আল-আহযাব",
        "surahNameEn": "Surah Al-Ahzab",
        "surahNumber": 33,
        "ayahRange": "৪০",
        "ayahArabic": "مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ",
        "translationBn": "মুহাম্মদ তোমাদের কোনো পুরুষের পিতা নন; বরং তিনি আল্লাহর রাসুল এবং সর্বশেষ নবী।",
        "translationEn": "Muhammad is not the father of [any] one of your men, but [he is] the Messenger of Allah and last of the prophets."
      }
    ]
  }
];
