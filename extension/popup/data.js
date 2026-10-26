/**
 * Al-Quran & Halal Web Shield — Static Canonical Islamic Dataset
 * Surahs (114), 30 Juz, 99 Names of Allah, Ruqyah Shariah, Hadith & Hijri Events
 */

const SURAHS_DATA = [
  {
    "number": 1,
    "nameBn": "আল-ফাতিহা",
    "meaningBn": "সূচনা",
    "nameEn": "Al-Fatihah",
    "ayahCount": 7,
    "revelationType": "মাক্কী"
  },
  {
    "number": 2,
    "nameBn": "আল-বাকারা",
    "meaningBn": "বকনা-বাছুর",
    "nameEn": "Al-Baqarah",
    "ayahCount": 286,
    "revelationType": "মাদানী"
  },
  {
    "number": 3,
    "nameBn": "আলে-ইমরান",
    "meaningBn": "ইমরানের পরিবার",
    "nameEn": "Ali 'Imran",
    "ayahCount": 200,
    "revelationType": "মাদানী"
  },
  {
    "number": 4,
    "nameBn": "আন-নিসা",
    "meaningBn": "নারী",
    "nameEn": "An-Nisa",
    "ayahCount": 176,
    "revelationType": "মাদানী"
  },
  {
    "number": 5,
    "nameBn": "আল-মায়িদা",
    "meaningBn": "খাদ্য পরিবেশিত টেবিল",
    "nameEn": "Al-Ma'idah",
    "ayahCount": 120,
    "revelationType": "মাদানী"
  },
  {
    "number": 6,
    "nameBn": "আল-আনআম",
    "meaningBn": "গৃহপালিত পশু",
    "nameEn": "Al-An'am",
    "ayahCount": 165,
    "revelationType": "মাক্কী"
  },
  {
    "number": 7,
    "nameBn": "আল-আরাফ",
    "meaningBn": "উচু স্থান",
    "nameEn": "Al-A'raf",
    "ayahCount": 206,
    "revelationType": "মাক্কী"
  },
  {
    "number": 8,
    "nameBn": "আল-আনফাল",
    "meaningBn": "যুদ্ধ-লব্ধ ধনসম্পদ",
    "nameEn": "Al-Anfal",
    "ayahCount": 75,
    "revelationType": "মাদানী"
  },
  {
    "number": 9,
    "nameBn": "আত-তাওবা",
    "meaningBn": "অনুশোচনা",
    "nameEn": "At-Tawbah",
    "ayahCount": 129,
    "revelationType": "মাদানী"
  },
  {
    "number": 10,
    "nameBn": "ইউনুস",
    "meaningBn": "নবী ইউনুস",
    "nameEn": "Yunus",
    "ayahCount": 109,
    "revelationType": "মাক্কী"
  },
  {
    "number": 11,
    "nameBn": "হুদ",
    "meaningBn": "নবী হুদ",
    "nameEn": "Hud",
    "ayahCount": 123,
    "revelationType": "মাক্কী"
  },
  {
    "number": 12,
    "nameBn": "ইউসুফ",
    "meaningBn": "নবী ইউসুফ",
    "nameEn": "Yusuf",
    "ayahCount": 111,
    "revelationType": "মাক্কী"
  },
  {
    "number": 13,
    "nameBn": "আর-রাদ",
    "meaningBn": "বজ্রপাত",
    "nameEn": "Ar-Ra'd",
    "ayahCount": 43,
    "revelationType": "মাদানী"
  },
  {
    "number": 14,
    "nameBn": "ইবরাহীম",
    "meaningBn": "নবী ইবরাহীম",
    "nameEn": "Ibrahim",
    "ayahCount": 52,
    "revelationType": "মাক্কী"
  },
  {
    "number": 15,
    "nameBn": "আল-হিজর",
    "meaningBn": "পাথুরে পাহাড়",
    "nameEn": "Al-Hijr",
    "ayahCount": 99,
    "revelationType": "মাক্কী"
  },
  {
    "number": 16,
    "nameBn": "আন-নাহল",
    "meaningBn": "মৌমাছি",
    "nameEn": "An-Nahl",
    "ayahCount": 128,
    "revelationType": "মাক্কী"
  },
  {
    "number": 17,
    "nameBn": "বনী ইসরাঈল",
    "meaningBn": "ইহুদি জাতি",
    "nameEn": "Al-Isra",
    "ayahCount": 111,
    "revelationType": "মাক্কী"
  },
  {
    "number": 18,
    "nameBn": "আল-কাহফ",
    "meaningBn": "গুহা",
    "nameEn": "Al-Kahf",
    "ayahCount": 110,
    "revelationType": "মাক্কী"
  },
  {
    "number": 19,
    "nameBn": "মারইয়াম",
    "meaningBn": "মারইয়াম (ঈসা নবীর মা)",
    "nameEn": "Maryam",
    "ayahCount": 98,
    "revelationType": "মাক্কী"
  },
  {
    "number": 20,
    "nameBn": "ত্বা-হা",
    "meaningBn": "ত়া হা",
    "nameEn": "Taha",
    "ayahCount": 135,
    "revelationType": "মাক্কী"
  },
  {
    "number": 21,
    "nameBn": "আল-আম্বিয়া",
    "meaningBn": "নবীগণ",
    "nameEn": "Al-Anbya",
    "ayahCount": 112,
    "revelationType": "মাক্কী"
  },
  {
    "number": 22,
    "nameBn": "আল-হাজ্জ",
    "meaningBn": "হ়াজ্জ",
    "nameEn": "Al-Hajj",
    "ayahCount": 78,
    "revelationType": "মাদানী"
  },
  {
    "number": 23,
    "nameBn": "আল-মুমিনুন",
    "meaningBn": "বিশ্বাসী",
    "nameEn": "Al-Mu'minun",
    "ayahCount": 118,
    "revelationType": "মাক্কী"
  },
  {
    "number": 24,
    "nameBn": "আন-নূর",
    "meaningBn": "আলো",
    "nameEn": "An-Nur",
    "ayahCount": 64,
    "revelationType": "মাদানী"
  },
  {
    "number": 25,
    "nameBn": "আল-ফুরকান",
    "meaningBn": "মানদণ্ড",
    "nameEn": "Al-Furqan",
    "ayahCount": 77,
    "revelationType": "মাক্কী"
  },
  {
    "number": 26,
    "nameBn": "আশ-শুআরা",
    "meaningBn": "কবি",
    "nameEn": "Ash-Shu'ara",
    "ayahCount": 227,
    "revelationType": "মাক্কী"
  },
  {
    "number": 27,
    "nameBn": "আন-নামল",
    "meaningBn": "পিঁপড়া",
    "nameEn": "An-Naml",
    "ayahCount": 93,
    "revelationType": "মাক্কী"
  },
  {
    "number": 28,
    "nameBn": "আল-কাসাস",
    "meaningBn": "কাহিনি",
    "nameEn": "Al-Qasas",
    "ayahCount": 88,
    "revelationType": "মাক্কী"
  },
  {
    "number": 29,
    "nameBn": "আল-আনকাবুত",
    "meaningBn": "মাকড়শা",
    "nameEn": "Al-'Ankabut",
    "ayahCount": 69,
    "revelationType": "মাক্কী"
  },
  {
    "number": 30,
    "nameBn": "আর-রূম",
    "meaningBn": "রোমান জাতি",
    "nameEn": "Ar-Rum",
    "ayahCount": 60,
    "revelationType": "মাক্কী"
  },
  {
    "number": 31,
    "nameBn": "লুকমান",
    "meaningBn": "এক জ্ঞানী ব্যাক্তি",
    "nameEn": "Luqman",
    "ayahCount": 34,
    "revelationType": "মাক্কী"
  },
  {
    "number": 32,
    "nameBn": "আস-সাজদা",
    "meaningBn": "সিজদা",
    "nameEn": "As-Sajdah",
    "ayahCount": 30,
    "revelationType": "মাক্কী"
  },
  {
    "number": 33,
    "nameBn": "আল-আহযাব",
    "meaningBn": "জোট",
    "nameEn": "Al-Ahzab",
    "ayahCount": 73,
    "revelationType": "মাদানী"
  },
  {
    "number": 34,
    "nameBn": "সাবা",
    "meaningBn": "রানী সাবা/শেবা",
    "nameEn": "Saba",
    "ayahCount": 54,
    "revelationType": "মাক্কী"
  },
  {
    "number": 35,
    "nameBn": "ফাতির",
    "meaningBn": "আদি স্রষ্টা",
    "nameEn": "Fatir",
    "ayahCount": 45,
    "revelationType": "মাক্কী"
  },
  {
    "number": 36,
    "nameBn": "ইয়াসীন",
    "meaningBn": "ইয়াসীন",
    "nameEn": "Ya-Sin",
    "ayahCount": 83,
    "revelationType": "মাক্কী"
  },
  {
    "number": 37,
    "nameBn": "আস-সাফফাত",
    "meaningBn": "সারিবদ্ধভাবে দাঁড়ানো",
    "nameEn": "As-Saffat",
    "ayahCount": 182,
    "revelationType": "মাক্কী"
  },
  {
    "number": 38,
    "nameBn": "সোয়াদ",
    "meaningBn": "আরবি বর্ণ সাদ",
    "nameEn": "Sad",
    "ayahCount": 88,
    "revelationType": "মাক্কী"
  },
  {
    "number": 39,
    "nameBn": "আয-যুমার",
    "meaningBn": "দলবদ্ধ জনতা",
    "nameEn": "Az-Zumar",
    "ayahCount": 75,
    "revelationType": "মাক্কী"
  },
  {
    "number": 40,
    "nameBn": "আল-মুমিন",
    "meaningBn": "ক্ষমাকারী",
    "nameEn": "Ghafir",
    "ayahCount": 85,
    "revelationType": "মাক্কী"
  },
  {
    "number": 41,
    "nameBn": "হা-মীম সাজদা",
    "meaningBn": "সুস্পষ্ট বিবরণ",
    "nameEn": "Fussilat",
    "ayahCount": 54,
    "revelationType": "মাক্কী"
  },
  {
    "number": 42,
    "nameBn": "আশ-শূরা",
    "meaningBn": "পরামর্শ",
    "nameEn": "Ash-Shuraa",
    "ayahCount": 53,
    "revelationType": "মাক্কী"
  },
  {
    "number": 43,
    "nameBn": "আয-যুখরুফ",
    "meaningBn": "সোনাদানা",
    "nameEn": "Az-Zukhruf",
    "ayahCount": 89,
    "revelationType": "মাক্কী"
  },
  {
    "number": 44,
    "nameBn": "আদ-দুখান",
    "meaningBn": "ধোঁয়া",
    "nameEn": "Ad-Dukhan",
    "ayahCount": 59,
    "revelationType": "মাক্কী"
  },
  {
    "number": 45,
    "nameBn": "আল-জাসিয়া",
    "meaningBn": "নতজানু",
    "nameEn": "Al-Jathiyah",
    "ayahCount": 37,
    "revelationType": "মাক্কী"
  },
  {
    "number": 46,
    "nameBn": "আল-আহকাফ",
    "meaningBn": "বালুর পাহাড়",
    "nameEn": "Al-Ahqaf",
    "ayahCount": 35,
    "revelationType": "মাক্কী"
  },
  {
    "number": 47,
    "nameBn": "মুহাম্মদ",
    "meaningBn": "নবী মুহাম্মদ",
    "nameEn": "Muhammad",
    "ayahCount": 38,
    "revelationType": "মাদানী"
  },
  {
    "number": 48,
    "nameBn": "আল-ফাতহ",
    "meaningBn": "বিজয়",
    "nameEn": "Al-Fath",
    "ayahCount": 29,
    "revelationType": "মাদানী"
  },
  {
    "number": 49,
    "nameBn": "আল-হুজুরাত",
    "meaningBn": "আবাস",
    "nameEn": "Al-Hujurat",
    "ayahCount": 18,
    "revelationType": "মাদানী"
  },
  {
    "number": 50,
    "nameBn": "ক্বাফ",
    "meaningBn": "কাফ",
    "nameEn": "Qaf",
    "ayahCount": 45,
    "revelationType": "মাক্কী"
  },
  {
    "number": 51,
    "nameBn": "আয-যারিয়াত",
    "meaningBn": "বিক্ষেপকারী বাতাস",
    "nameEn": "Adh-Dhariyat",
    "ayahCount": 60,
    "revelationType": "মাক্কী"
  },
  {
    "number": 52,
    "nameBn": "আত-তূর",
    "meaningBn": "পাহাড়",
    "nameEn": "At-Tur",
    "ayahCount": 49,
    "revelationType": "মাক্কী"
  },
  {
    "number": 53,
    "nameBn": "আন-নাজম",
    "meaningBn": "তারা",
    "nameEn": "An-Najm",
    "ayahCount": 62,
    "revelationType": "মাক্কী"
  },
  {
    "number": 54,
    "nameBn": "আল-কামার",
    "meaningBn": "চাঁদ",
    "nameEn": "Al-Qamar",
    "ayahCount": 55,
    "revelationType": "মাক্কী"
  },
  {
    "number": 55,
    "nameBn": "আর-রহমান",
    "meaningBn": "পরম করুণাময়",
    "nameEn": "Ar-Rahman",
    "ayahCount": 78,
    "revelationType": "মাদানী"
  },
  {
    "number": 56,
    "nameBn": "আল-ওয়াকিয়া",
    "meaningBn": "নিশ্চিত ঘটনা",
    "nameEn": "Al-Waqi'ah",
    "ayahCount": 96,
    "revelationType": "মাক্কী"
  },
  {
    "number": 57,
    "nameBn": "আল-হাদীদ",
    "meaningBn": "লোহা",
    "nameEn": "Al-Hadid",
    "ayahCount": 29,
    "revelationType": "মাদানী"
  },
  {
    "number": 58,
    "nameBn": "আল-মুজাদালা",
    "meaningBn": "অনুযোগকারিণী",
    "nameEn": "Al-Mujadila",
    "ayahCount": 22,
    "revelationType": "মাদানী"
  },
  {
    "number": 59,
    "nameBn": "আল-হাশর",
    "meaningBn": "সমাবেশ",
    "nameEn": "Al-Hashr",
    "ayahCount": 24,
    "revelationType": "মাদানী"
  },
  {
    "number": 60,
    "nameBn": "আল-মুমতাহিনা",
    "meaningBn": "নারী, যাকে পরীক্ষা করা হবে",
    "nameEn": "Al-Mumtahanah",
    "ayahCount": 13,
    "revelationType": "মাদানী"
  },
  {
    "number": 61,
    "nameBn": "আস-সাফ",
    "meaningBn": "সারিবদ্ধ সৈন্যদল",
    "nameEn": "As-Saf",
    "ayahCount": 14,
    "revelationType": "মাদানী"
  },
  {
    "number": 62,
    "nameBn": "আল-জুমুআ",
    "meaningBn": "সম্মেলন/শুক্রবার",
    "nameEn": "Al-Jumu'ah",
    "ayahCount": 11,
    "revelationType": "মাদানী"
  },
  {
    "number": 63,
    "nameBn": "আল-মুনাফিকুন",
    "meaningBn": "ভণ্ড বিশ্বাসী",
    "nameEn": "Al-Munafiqun",
    "ayahCount": 11,
    "revelationType": "মাদানী"
  },
  {
    "number": 64,
    "nameBn": "আত-তাগাবুন",
    "meaningBn": "মোহ অপসারণ",
    "nameEn": "At-Taghabun",
    "ayahCount": 18,
    "revelationType": "মাদানী"
  },
  {
    "number": 65,
    "nameBn": "আত-তালাক",
    "meaningBn": "তালাক",
    "nameEn": "At-Talaq",
    "ayahCount": 12,
    "revelationType": "মাদানী"
  },
  {
    "number": 66,
    "nameBn": "আত-তাহরীম",
    "meaningBn": "নিষিদ্ধকরণ",
    "nameEn": "At-Tahrim",
    "ayahCount": 12,
    "revelationType": "মাদানী"
  },
  {
    "number": 67,
    "nameBn": "আল-মুলক",
    "meaningBn": "সার্বভৌম কর্তৃত্ব",
    "nameEn": "Al-Mulk",
    "ayahCount": 30,
    "revelationType": "মাক্কী"
  },
  {
    "number": 68,
    "nameBn": "আল-কলম",
    "meaningBn": "কলম",
    "nameEn": "Al-Qalam",
    "ayahCount": 52,
    "revelationType": "মাক্কী"
  },
  {
    "number": 69,
    "nameBn": "আল-হাক্কাহ",
    "meaningBn": "নিশ্চিত সত্য",
    "nameEn": "Al-Haqqah",
    "ayahCount": 52,
    "revelationType": "মাক্কী"
  },
  {
    "number": 70,
    "nameBn": "আল-মাআরিজ",
    "meaningBn": "উন্নয়নের সোপান",
    "nameEn": "Al-Ma'arij",
    "ayahCount": 44,
    "revelationType": "মাক্কী"
  },
  {
    "number": 71,
    "nameBn": "নূহ",
    "meaningBn": "নবী নূহ",
    "nameEn": "Nuh",
    "ayahCount": 28,
    "revelationType": "মাক্কী"
  },
  {
    "number": 72,
    "nameBn": "আল-জিন",
    "meaningBn": "জিন সম্প্রদায়",
    "nameEn": "Al-Jinn",
    "ayahCount": 28,
    "revelationType": "মাক্কী"
  },
  {
    "number": 73,
    "nameBn": "আল-মুযযাম্মিল",
    "meaningBn": "বস্ত্রাচ্ছাদনকারী",
    "nameEn": "Al-Muzzammil",
    "ayahCount": 20,
    "revelationType": "মাক্কী"
  },
  {
    "number": 74,
    "nameBn": "আল-মুদ্দাসসির",
    "meaningBn": "পোশাক পরিহিত",
    "nameEn": "Al-Muddaththir",
    "ayahCount": 56,
    "revelationType": "মাক্কী"
  },
  {
    "number": 75,
    "nameBn": "আল-কিয়ামাহ",
    "meaningBn": "পুনরুত্থান",
    "nameEn": "Al-Qiyamah",
    "ayahCount": 40,
    "revelationType": "মাক্কী"
  },
  {
    "number": 76,
    "nameBn": "আল-ইনসান",
    "meaningBn": "মানবজাতি",
    "nameEn": "Al-Insan",
    "ayahCount": 31,
    "revelationType": "মাদানী"
  },
  {
    "number": 77,
    "nameBn": "আল-মুরসালাত",
    "meaningBn": "প্রেরিত পুরুষ",
    "nameEn": "Al-Mursalat",
    "ayahCount": 50,
    "revelationType": "মাক্কী"
  },
  {
    "number": 78,
    "nameBn": "আন-নাবা",
    "meaningBn": "মহাসংবাদ",
    "nameEn": "An-Naba",
    "ayahCount": 40,
    "revelationType": "মাক্কী"
  },
  {
    "number": 79,
    "nameBn": "আন-নাযিআত",
    "meaningBn": "প্রচেষ্টাকারী",
    "nameEn": "An-Nazi'at",
    "ayahCount": 46,
    "revelationType": "মাক্কী"
  },
  {
    "number": 80,
    "nameBn": "আবাসা",
    "meaningBn": "সে ভ্রু কুঁচকালো",
    "nameEn": "'Abasa",
    "ayahCount": 42,
    "revelationType": "মাক্কী"
  },
  {
    "number": 81,
    "nameBn": "আত-তাকভীর",
    "meaningBn": "অন্ধকারাচ্ছন্ন",
    "nameEn": "At-Takwir",
    "ayahCount": 29,
    "revelationType": "মাক্কী"
  },
  {
    "number": 82,
    "nameBn": "আল-ইনফিতার",
    "meaningBn": "বিদীর্ণ করা",
    "nameEn": "Al-Infitar",
    "ayahCount": 19,
    "revelationType": "মাক্কী"
  },
  {
    "number": 83,
    "nameBn": "আল-মুতাফফিফীন",
    "meaningBn": "প্রতারণা করা",
    "nameEn": "Al-Mutaffifin",
    "ayahCount": 36,
    "revelationType": "মাক্কী"
  },
  {
    "number": 84,
    "nameBn": "আল-ইনশিকাক",
    "meaningBn": "খণ্ড-বিখণ্ডকরণ",
    "nameEn": "Al-Inshiqaq",
    "ayahCount": 25,
    "revelationType": "মাক্কী"
  },
  {
    "number": 85,
    "nameBn": "আল-বুরূজ",
    "meaningBn": "নক্ষত্রপুঞ্জ",
    "nameEn": "Al-Buruj",
    "ayahCount": 22,
    "revelationType": "মাক্কী"
  },
  {
    "number": 86,
    "nameBn": "আত-তারিক",
    "meaningBn": "রাতের আগন্তুক",
    "nameEn": "At-Tariq",
    "ayahCount": 17,
    "revelationType": "মাক্কী"
  },
  {
    "number": 87,
    "nameBn": "আল-আলা",
    "meaningBn": "সর্বোন্নত",
    "nameEn": "Al-A'la",
    "ayahCount": 19,
    "revelationType": "মাক্কী"
  },
  {
    "number": 88,
    "nameBn": "আল-গাশিয়া",
    "meaningBn": "বিহ্বলকর ঘটনা",
    "nameEn": "Al-Ghashiyah",
    "ayahCount": 26,
    "revelationType": "মাক্কী"
  },
  {
    "number": 89,
    "nameBn": "আল-ফজর",
    "meaningBn": "ভোরবেলা",
    "nameEn": "Al-Fajr",
    "ayahCount": 30,
    "revelationType": "মাক্কী"
  },
  {
    "number": 90,
    "nameBn": "আল-বালাদ",
    "meaningBn": "নগর",
    "nameEn": "Al-Balad",
    "ayahCount": 20,
    "revelationType": "মাক্কী"
  },
  {
    "number": 91,
    "nameBn": "আশ-শামস",
    "meaningBn": "সূর্য",
    "nameEn": "Ash-Shams",
    "ayahCount": 15,
    "revelationType": "মাক্কী"
  },
  {
    "number": 92,
    "nameBn": "আল-লাইল",
    "meaningBn": "রাত",
    "nameEn": "Al-Layl",
    "ayahCount": 21,
    "revelationType": "মাক্কী"
  },
  {
    "number": 93,
    "nameBn": "আদ-দুহা",
    "meaningBn": "পূর্বাহ্নের সুর্যকিরণ",
    "nameEn": "Ad-Duhaa",
    "ayahCount": 11,
    "revelationType": "মাক্কী"
  },
  {
    "number": 94,
    "nameBn": "আশ-শারহ",
    "meaningBn": "বক্ষ প্রশস্তকরণ",
    "nameEn": "Ash-Sharh",
    "ayahCount": 8,
    "revelationType": "মাক্কী"
  },
  {
    "number": 95,
    "nameBn": "আত-তীন",
    "meaningBn": "ডুমুর",
    "nameEn": "At-Tin",
    "ayahCount": 8,
    "revelationType": "মাক্কী"
  },
  {
    "number": 96,
    "nameBn": "আল-আলাক",
    "meaningBn": "রক্তপিণ্ড",
    "nameEn": "Al-'Alaq",
    "ayahCount": 19,
    "revelationType": "মাক্কী"
  },
  {
    "number": 97,
    "nameBn": "আল-কদর",
    "meaningBn": "মহিমান্বিত",
    "nameEn": "Al-Qadr",
    "ayahCount": 5,
    "revelationType": "মাক্কী"
  },
  {
    "number": 98,
    "nameBn": "আল-বাইয়িনাহ",
    "meaningBn": "প্রমাণ",
    "nameEn": "Al-Bayyinah",
    "ayahCount": 8,
    "revelationType": "মাদানী"
  },
  {
    "number": 99,
    "nameBn": "আয-যিলযাল",
    "meaningBn": "ভূমিকম্প",
    "nameEn": "Az-Zalzalah",
    "ayahCount": 8,
    "revelationType": "মাদানী"
  },
  {
    "number": 100,
    "nameBn": "আল-আদিয়াত",
    "meaningBn": "অভিযানকারী",
    "nameEn": "Al-'Adiyat",
    "ayahCount": 11,
    "revelationType": "মাক্কী"
  },
  {
    "number": 101,
    "nameBn": "আল-কারিআ",
    "meaningBn": "মহাসংকট",
    "nameEn": "Al-Qari'ah",
    "ayahCount": 11,
    "revelationType": "মাক্কী"
  },
  {
    "number": 102,
    "nameBn": "আত-তাকাসুর",
    "meaningBn": "প্রাচুর্যের প্রতিযোগিতা",
    "nameEn": "At-Takathur",
    "ayahCount": 8,
    "revelationType": "মাক্কী"
  },
  {
    "number": 103,
    "nameBn": "আল-আসর",
    "meaningBn": "সময়",
    "nameEn": "Al-'Asr",
    "ayahCount": 3,
    "revelationType": "মাক্কী"
  },
  {
    "number": 104,
    "nameBn": "আল-হুমাযাহ",
    "meaningBn": "পরনিন্দাকারী",
    "nameEn": "Al-Humazah",
    "ayahCount": 9,
    "revelationType": "মাক্কী"
  },
  {
    "number": 105,
    "nameBn": "আল-ফীল",
    "meaningBn": "হাতি",
    "nameEn": "Al-Fil",
    "ayahCount": 5,
    "revelationType": "মাক্কী"
  },
  {
    "number": 106,
    "nameBn": "কুরাইশ",
    "meaningBn": "কুরাইশ গোত্র",
    "nameEn": "Quraysh",
    "ayahCount": 4,
    "revelationType": "মাক্কী"
  },
  {
    "number": 107,
    "nameBn": "আল-মাউন",
    "meaningBn": "সাহায্য সহায়তা",
    "nameEn": "Al-Ma'un",
    "ayahCount": 7,
    "revelationType": "মাক্কী"
  },
  {
    "number": 108,
    "nameBn": "আল-কাউসার",
    "meaningBn": "কাউসার/প্রাচুর্য",
    "nameEn": "Al-Kawthar",
    "ayahCount": 3,
    "revelationType": "মাক্কী"
  },
  {
    "number": 109,
    "nameBn": "আল-কাফিরুন",
    "meaningBn": "অবিশ্বাসী",
    "nameEn": "Al-Kafirun",
    "ayahCount": 6,
    "revelationType": "মাক্কী"
  },
  {
    "number": 110,
    "nameBn": "আন-নাসর",
    "meaningBn": "সাহায্য",
    "nameEn": "An-Nasr",
    "ayahCount": 3,
    "revelationType": "মাদানী"
  },
  {
    "number": 111,
    "nameBn": "আল-লাহাব",
    "meaningBn": "খেজুরের পাকানো (রশি)",
    "nameEn": "Al-Masad",
    "ayahCount": 5,
    "revelationType": "মাক্কী"
  },
  {
    "number": 112,
    "nameBn": "আল-ইখলাস",
    "meaningBn": "আন্তরিকতা",
    "nameEn": "Al-Ikhlas",
    "ayahCount": 4,
    "revelationType": "মাক্কী"
  },
  {
    "number": 113,
    "nameBn": "আল-ফালাক",
    "meaningBn": "নিশিভোর",
    "nameEn": "Al-Falaq",
    "ayahCount": 5,
    "revelationType": "মাক্কী"
  },
  {
    "number": 114,
    "nameBn": "আন-নাস",
    "meaningBn": "মানুষ জাতি",
    "nameEn": "An-Nas",
    "ayahCount": 6,
    "revelationType": "মাক্কী"
  }
];
const JUZ_DATA = [
  {
    "juz": 1,
    "nameAr": "الم",
    "nameBn": "আলিফ লাম মীম",
    "surahStart": "আল-ফাতিহা ১:১",
    "surahEnd": "আল-বাকারা ২:১৪১"
  },
  {
    "juz": 2,
    "nameAr": "سَيَقُولُ",
    "nameBn": "সায়াকুলু",
    "surahStart": "আল-বাকারা ২:১৪২",
    "surahEnd": "আল-বাকারা ২:২৫২"
  },
  {
    "juz": 3,
    "nameAr": "تِلْكَ الرُّسُلُ",
    "nameBn": "তিলকার রুসুল",
    "surahStart": "আল-বাকারা ২:২৫৩",
    "surahEnd": "আলে-ইমরান ৩:৯২"
  },
  {
    "juz": 4,
    "nameAr": "لَنْ تَنَالُوا",
    "nameBn": "লান তানালু",
    "surahStart": "আলে-ইমরান ৩:৯৩",
    "surahEnd": "আন-নিসা ৪:২৩"
  },
  {
    "juz": 5,
    "nameAr": "وَالْمُحْصَنَاتُ",
    "nameBn": "ওয়াল মুহসানাতু",
    "surahStart": "আন-নিসা ৪:২৪",
    "surahEnd": "আন-নিসা ৪:১৪৭"
  },
  {
    "juz": 6,
    "nameAr": "لَا يُحِبُّ اللَّهُ",
    "nameBn": "লা ইয়ুহিব্বুল্লাহ",
    "surahStart": "আন-নিসা ৪:১৪৮",
    "surahEnd": "আল-মায়িদা ৫:৮১"
  },
  {
    "juz": 7,
    "nameAr": "وَإِذَا سَمِعُوا",
    "nameBn": "ওয়া ইযা সামিউ",
    "surahStart": "আল-মায়িদা ৫:৮২",
    "surahEnd": "আল-আনআম ৬:১১০"
  },
  {
    "juz": 8,
    "nameAr": "وَلَوْ أَنَّنَا",
    "nameBn": "ওয়া লাও আন্নানা",
    "surahStart": "আল-আনআম ৬:১১১",
    "surahEnd": "আল-আরাফ ৭:৮৭"
  },
  {
    "juz": 9,
    "nameAr": "قَالَ الْمَلَأُ",
    "nameBn": "ক্বালা আল-মালাউ",
    "surahStart": "আল-আরাফ ৭:৮৮",
    "surahEnd": "আল-আনফাল ৮:৪০"
  },
  {
    "juz": 10,
    "nameAr": "وَاعْلَمُوا",
    "nameBn": "ওয়ালামু",
    "surahStart": "আল-আনফাল ৮:৪১",
    "surahEnd": "আত-তাওবা ৯:৯২"
  },
  {
    "juz": 11,
    "nameAr": "يَعْتَذِرُونَ",
    "nameBn": "ইয়াতাযিরুনা",
    "surahStart": "আত-তাওবা ৯:৯৩",
    "surahEnd": "হুদ ১১:৫"
  },
  {
    "juz": 12,
    "nameAr": "وَمَا مِنْ دَابَّةٍ",
    "nameBn": "ওয়ামা মিন দাব্বাতিন",
    "surahStart": "হুদ ১১:৬",
    "surahEnd": "ইউসুফ ১২:৫২"
  },
  {
    "juz": 13,
    "nameAr": "وَمَا أُبَرِّئُ",
    "nameBn": "ওয়ামা উবাররিউ",
    "surahStart": "ইউসুফ ১২:৫৩",
    "surahEnd": "ইবরাহীম ১৪:৫২"
  },
  {
    "juz": 14,
    "nameAr": "رُبَمَا",
    "nameBn": "রুবামা",
    "surahStart": "আল-হিজর ১৫:১",
    "surahEnd": "আন-নাহল ১৬:১২৮"
  },
  {
    "juz": 15,
    "nameAr": "سُبْحَانَ الَّذِي",
    "nameBn": "সুবহানাল্লাজি",
    "surahStart": "আল-ইসরা ১৭:১",
    "surahEnd": "আল-কাহফ ১৮:৭৪"
  },
  {
    "juz": 16,
    "nameAr": "قَالَ أَلَمْ",
    "nameBn": "ক্বালা আলাম",
    "surahStart": "আল-কাহফ ১৮:৭৫",
    "surahEnd": "ত্বা-হা ২০:১৩৫"
  },
  {
    "juz": 17,
    "nameAr": "اقْتَرَبَ",
    "nameBn": "ইক্বতারাাবা",
    "surahStart": "আল-আম্বিয়া ২১:১",
    "surahEnd": "আল-হজ্জ ২২:৭৮"
  },
  {
    "juz": 18,
    "nameAr": "قَدْ أَفْلَحَ",
    "nameBn": "ক্বাদ আফলাহা",
    "surahStart": "আল-মুমিনুন ২৩:১",
    "surahEnd": "আল-ফুরকান ২৫:২০"
  },
  {
    "juz": 19,
    "nameAr": "وَقَالَ الَّذِينَ",
    "nameBn": "ওয়া ক্বালাল্লাযিনা",
    "surahStart": "আল-ফুরকান ২৫:২১",
    "surahEnd": "আন-নামল ২৭:৫৫"
  },
  {
    "juz": 20,
    "nameAr": "أَمَّنْ خَلَقَ",
    "nameBn": "আম্মান খালাক্বা",
    "surahStart": "আন-নামল ২৭:৫৬",
    "surahEnd": "আল-আনকাবুত ২৯:৪৫"
  },
  {
    "juz": 21,
    "nameAr": "اتْلُ مَا أُوحِيَ",
    "nameBn": "উতলু মা উহিয়া",
    "surahStart": "আল-আনকাবুত ২৯:৪৬",
    "surahEnd": "আল-আহযাব ৩৩:৩০"
  },
  {
    "juz": 22,
    "nameAr": "وَمَنْ يَقْنُتْ",
    "nameBn": "ওয়া মান ইয়াকনুত",
    "surahStart": "আল-আহযাব ৩৩:৩১",
    "surahEnd": "ইয়াসীন ৩৬:২৭"
  },
  {
    "juz": 23,
    "nameAr": "وَمَا لِيَ",
    "nameBn": "ওয়ামা লিয়া",
    "surahStart": "ইয়াসীন ৩৬:২৮",
    "surahEnd": "আয-যুমার ৩৯:৩১"
  },
  {
    "juz": 24,
    "nameAr": "فَمَنْ أَظْلَمُ",
    "nameBn": "ফামান আযলামু",
    "surahStart": "আয-যুমার ৩৯:৩২",
    "surahEnd": "ফুসসিলাত ৪১:৪৬"
  },
  {
    "juz": 25,
    "nameAr": "إِلَيْهِ يُرَدُّ",
    "nameBn": "ইলাইহি ইউরাদ্দু",
    "surahStart": "ফুসসিলাত ৪১:৪৭",
    "surahEnd": "আল-জাসিয়া ৪৫:৩৭"
  },
  {
    "juz": 26,
    "nameAr": "حم",
    "nameBn": "হা-মীম",
    "surahStart": "আল-আহকাফ ৪৬:১",
    "surahEnd": "আয-যারিয়াত ৫১:৩০"
  },
  {
    "juz": 27,
    "nameAr": "قَالَ فَمَا خَطْبُكُمْ",
    "nameBn": "ক্বালা ফামা খাতবুকুম",
    "surahStart": "আয-যারিয়াত ৫১:৩১",
    "surahEnd": "আল-হাদীদ ৫৭:২৯"
  },
  {
    "juz": 28,
    "nameAr": "قَدْ سَمِعَ اللَّهُ",
    "nameBn": "ক্বাদ সামিআল্লাহু",
    "surahStart": "আল-মুজাদালাহ ৫৮:১",
    "surahEnd": "আত-তাহরীম ৬৬:১২"
  },
  {
    "juz": 29,
    "nameAr": "تَبَارَكَ الَّذِي",
    "nameBn": "তাবা-রাকাল্লাযী",
    "surahStart": "আল-মুলক ৬৭:১",
    "surahEnd": "আল-মুরসালাত ৭৭:৫০"
  },
  {
    "juz": 30,
    "nameAr": "عَمَّ يَتَسَاءَلُونَ",
    "nameBn": "আম্মা ইয়াতাসা-আলুন (আমপারা)",
    "surahStart": "আন-নাবা ৭৮:১",
    "surahEnd": "আন-নাস ১১৪:৬"
  }
];
const ASMA_UL_HUSNA_DATA = [
  {
    "number": 1,
    "arabic": "الرَّحْمَـٰنُ",
    "transliteration": "Ar-Rahman",
    "nameBn": "আর-রাহমান",
    "meaningEn": "The Most Gracious",
    "meaningBn": "পরম করুণাময়",
    "detailsEn": "The One who has plenty of mercy for the believers and the blasphemers in this world and especially for the believers in the hereafter.",
    "detailsBn": "আল্লাহ তা'আলার করুণা ও দয়া সকল সৃষ্টির উপর সর্বব্যাপী। ইহকালে তিনি মুমিন-কাফির নির্বিশেষে সবার প্রতি দয়াশীল।",
    "quranReference": "সূরা আল-ফাতিহা ১:১, সূরা আর-রহমান ৫৫:১-২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/rahman.mp3"
  },
  {
    "number": 2,
    "arabic": "الرَّحِيمُ",
    "transliteration": "Ar-Rahim",
    "nameBn": "আর-রাহীম",
    "meaningEn": "The Most Merciful",
    "meaningBn": "পরম দয়ালু",
    "detailsEn": "He who acts with extreme kindness and mercy towards the believers.",
    "detailsBn": "পরকালে তিনি বিশেষ করে মুমিন বান্দাদের প্রতি অফুরন্ত দয়া ও ক্ষমা প্রদর্শন করবেন।",
    "quranReference": "সূরা আল-ফাতিহা ১:৩, সূরা আল-আহযাব ৩৩:৪৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/rahim.mp3"
  },
  {
    "number": 3,
    "arabic": "الْمَلِكُ",
    "transliteration": "Al-Malik",
    "nameBn": "আল-মালিক",
    "meaningEn": "The Eternal Lord",
    "meaningBn": "সার্বভৌম মালিক ও প্রকৃত বাদশাহ",
    "detailsEn": "The Sovereign Lord, The One with the complete Dominion, the One Whose Dominion is clear from imperfection.",
    "detailsBn": "সমগ্র মহাবিশ্ব ও সকল সৃষ্টির একক সর্বময় প্রভু ও অধিপতি, যাঁর রাজত্ব চিরন্তন।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা আল-মুলক ৬৭:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/malik.mp3"
  },
  {
    "number": 4,
    "arabic": "الْقُدُّوسُ",
    "transliteration": "Al-Quddus",
    "nameBn": "আল-কুদ্দুস",
    "meaningEn": "The Most Sacred",
    "meaningBn": "মহাপবিত্র ও নিষ্কলুষ",
    "detailsEn": "The One who is pure from any imperfection and clear from children and adversaries.",
    "detailsBn": "সকল ত্রুটি-বিচ্যুতি, দুর্বলতা ও মানবীয় অপূর্ণতা থেকে যিনি সম্পূর্ণরূপে মুক্ত ও পবিত্র।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা আল-জুমুআহ ৬২:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/quddus.mp3"
  },
  {
    "number": 5,
    "arabic": "السَّلاَمُ",
    "transliteration": "As-Salam",
    "nameBn": "আস-সালাম",
    "meaningEn": "The Embodiment of Peace",
    "meaningBn": "শান্তিদাতা ও নিরাপত্তা বিধানকারী",
    "detailsEn": "The One who is free from every imperfection.",
    "detailsBn": "সকল শান্তি ও নিরাপত্তার মূল উৎস এবং সকল ধরনের ক্ষতি ও পরিবর্তন থেকে মুক্ত।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা আল-আনআম ৬:১২৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/salam.mp3"
  },
  {
    "number": 6,
    "arabic": "الْمُؤْمِنُ",
    "transliteration": "Al-Mu’min",
    "nameBn": "আল-মু'মিন",
    "meaningEn": "The Infuser of Faith",
    "meaningBn": "নিরাপত্তাদাতা ও ঈমান স্থাপনকারী",
    "detailsEn": "The One who witnessed for Himself that no one is God but Him. And He witnessed for His believers that they are truthful in their belief that no one is God but Him.",
    "detailsBn": "যিনি স্বীয় বান্দাদের ভয়ভীতি থেকে নিরাপত্তা দান করেন এবং অন্তরে সত্যের ঈমান সুদৃঢ় করেন।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা আল-বাক্বারাহ ২:২৫৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mumin.mp3"
  },
  {
    "number": 7,
    "arabic": "الْمُهَيْمِنُ",
    "transliteration": "Al-Muhaymin",
    "nameBn": "আল-মুহাইমিন",
    "meaningEn": "The Preserver of Safety",
    "meaningBn": "পরিপূর্ণ অভিভাবক ও প্রত্যক্ষদর্শী",
    "detailsEn": "The One who witnesses the saying and deeds of His creatures.",
    "detailsBn": "যিনি সমস্ত সৃষ্টির সর্বাবস্থা পর্যবেক্ষণ করেন, রক্ষণাবেক্ষণ করেন এবং সবকিছু সম্পর্কে অবগত।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা আল-মায়িদাহ ৫:৪৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muhaimin.mp3"
  },
  {
    "number": 8,
    "arabic": "الْعَزِيزُ",
    "transliteration": "Al-Aziz",
    "nameBn": "আল-আযীয",
    "meaningEn": "The Mighty One",
    "meaningBn": "মহাপরাক্রমশালী ও অপরাজিত",
    "detailsEn": "The Strong, The Defeater who is not defeated.",
    "detailsBn": "যাঁর প্রতাপ ও শক্তির সামনে কেউ দাঁড়াতে পারে না, যিনি সর্বদা অপরাজেয় ও বিজয়ী।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা ফাতির ৩৫:১০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/aziz.mp3"
  },
  {
    "number": 9,
    "arabic": "الْجَبَّارُ",
    "transliteration": "Al-Jabbar",
    "nameBn": "আল-জাব্বার",
    "meaningEn": "The Omnipotent One",
    "meaningBn": "পরম প্রতাপশালী ও সংস্কারক",
    "detailsEn": "The One that nothing happens in His Dominion except that which He willed.",
    "detailsBn": "যাঁর নির্দেশ প্রতিরোধহীন এবং যিনি ভগ্ন হৃদয় ও ক্ষতিগ্রস্তদের পুনঃপ্রতিষ্ঠা করেন।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩, সূরা আল-আনআম ৬:১৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/jabbar.mp3"
  },
  {
    "number": 10,
    "arabic": "الْمُتَكَبِّرُ",
    "transliteration": "Al-Mutakabbir",
    "nameBn": "আল-মুতাকাব্বির",
    "meaningEn": "The Dominant One",
    "meaningBn": "সর্বশ্রেষ্ঠ মর্যাদাপূর্ণ ও অহংকারের একক অধিকারী",
    "detailsEn": "The One who is clear from the attributes of the creatures and from resembling them.",
    "detailsBn": "প্রকৃত শ্রেষ্ঠত্ব ও গৌরব কেবল যাঁরই মানায়, যিনি সর্বপ্রকার হীনতা থেকে বহু ঊর্ধ্বে।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mutakabbir.mp3"
  },
  {
    "number": 11,
    "arabic": "الْخَالِقُ",
    "transliteration": "Al-Khaaliq",
    "nameBn": "আল-খালিক্ব",
    "meaningEn": "The Creator",
    "meaningBn": "একক সৃষ্টিকর্তা",
    "detailsEn": "The One who brings everything from non-existence to existence.",
    "detailsBn": "যিনি কোনো পূর্ব নমুনা বা উপাদান ছাড়াই সমগ্র সৃষ্টিজগতকে অনস্তিত্ব থেকে অস্তিত্বে আনয়ন করেছেন।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৪, সূরা আর-রাদ ১৩:১৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/khaliq.mp3"
  },
  {
    "number": 12,
    "arabic": "الْبَارِئُ",
    "transliteration": "Al-Baari",
    "nameBn": "আল-বারী",
    "meaningEn": "The Evolver",
    "meaningBn": "নিখুঁত উদ্ভাবক",
    "detailsEn": "The Maker, The Creator who has the Power to turn the entities.",
    "detailsBn": "যিনি প্রতিটি সৃষ্টিকে নিখুঁত ভারসাম্য ও অনুপাতে কোনো রকমের ত্রুটিহীনভাবে অস্তিত্ব দেন।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৪, সূরা আল-মুলক ৬৭:৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/bari.mp3"
  },
  {
    "number": 13,
    "arabic": "الْمُصَوِّرُ",
    "transliteration": "Al-Musawwir",
    "nameBn": "আল-মুসাওয়ির",
    "meaningEn": "The Flawless Shaper",
    "meaningBn": "আকৃতিদানকারী",
    "detailsEn": "The One who forms His creatures in different pictures.",
    "detailsBn": "যিনি প্রতিটি বস্তুকে তার নিজস্ব স্বতন্ত্র রূপ, বৈশিষ্ট্য ও সুন্দর অবয়বে সৃষ্টি করেন।",
    "quranReference": "সূরা আল-হাশর ৫৯:২৪, সূরা আলে ইমরান ৩:৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/musawwir.mp3"
  },
  {
    "number": 14,
    "arabic": "الْغَفَّارُ",
    "transliteration": "Al-Ghaffaar",
    "nameBn": "আল-গাফফার",
    "meaningEn": "The Great Forgiver",
    "meaningBn": "পরম ক্ষমাশীল",
    "detailsEn": "The Forgiver, The One who forgives the sins of His slaves time and time again.",
    "detailsBn": "যিনি বান্দার অগণিত পাপরাশি বারবার ক্ষমা করেন এবং দুনিয়া ও আখেরাতে তা ঢেকে রাখেন।",
    "quranReference": "সূরা সাদ ৩৮:৬৬, সূরা নূহ ৭১:১০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/ghaffar.mp3"
  },
  {
    "number": 15,
    "arabic": "الْقَهَّارُ",
    "transliteration": "Al-Qahhaar",
    "nameBn": "আল-ক্বাহহার",
    "meaningEn": "The All-Prevailing One",
    "meaningBn": "মহাপ্রভাবশালী ও দমনকারী",
    "detailsEn": "The Dominant, The One who has the perfect Power and is not unable over anything.",
    "detailsBn": "যাঁর পূর্ণ নিয়ন্ত্রণ ও কর্তৃত্বের অধীনে সমগ্র সৃষ্টি অবনত ও বাধ্য।",
    "quranReference": "সূরা ইউসুফ ১২:৩৯, সূরা আর-রাদ ১৩:১৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/qahhar.mp3"
  },
  {
    "number": 16,
    "arabic": "الْوَهَّابُ",
    "transliteration": "Al-Wahhab",
    "nameBn": "আল-ওয়াহহাব",
    "meaningEn": "The Supreme Bestower",
    "meaningBn": "পরম দাতা ও অবারিত অনুগ্রহকারী",
    "detailsEn": "The One who is Generous in giving plenty without any return.",
    "detailsBn": "যিনি প্রতিদান ব্যতিরেকে অফুরন্ত নেয়ামত, রহমত ও জ্ঞান অবিরাম দান করেন।",
    "quranReference": "সূরা আলে ইমরান ৩:৮, সূরা সাদ ৩৮:৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wahhab.mp3"
  },
  {
    "number": 17,
    "arabic": "الرَّزَّاقُ",
    "transliteration": "Ar-Razzaq",
    "nameBn": "আর-রাযযাক্ব",
    "meaningEn": "The Total Provider",
    "meaningBn": "একক রিজিকদাতা",
    "detailsEn": "The Sustainer, The Provider.",
    "detailsBn": "যিনি জল-স্থল, আকাশ-পাতালের প্রতিটি প্রাণের জীবন ধারণের জন্য প্রয়োজনীয় রিজিক সরবরাহ করেন।",
    "quranReference": "সূরা আয-যারিয়াত ৫১:৫৮, সূরা হূদ ১১:৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/razzaq.mp3"
  },
  {
    "number": 18,
    "arabic": "الْفَتَّاحُ",
    "transliteration": "Al-Fattah",
    "nameBn": "আল-ফাত্তাহ",
    "meaningEn": "The Supreme Solver",
    "meaningBn": "বিজয় ও উন্মোচনকারী",
    "detailsEn": "The Opener, The Reliever, The Judge, The One who opens for His slaves the closed worldly and religious matters.",
    "detailsBn": "যিনি যাবতীয় বন্ধ দ্বার উন্মুক্ত করেন, সত্য-মিথ্যার সমাধান করেন এবং বান্দাদের বিজয় দান করেন।",
    "quranReference": "সূরা সাবা ৩৪:২৬, সূরা আল-ফাতহ ৪৮:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/fattah.mp3"
  },
  {
    "number": 19,
    "arabic": "اَلْعَلِيْمُ",
    "transliteration": "Al-Alim",
    "nameBn": "আল-আলীম",
    "meaningEn": "The All-Knowing One",
    "meaningBn": "সর্বজ্ঞ",
    "detailsEn": "The Knowledgeable; The One nothing is absent from His knowledge.",
    "detailsBn": "যাঁর জ্ঞান অতীত, বর্তমান, ভবিষ্যৎ এবং প্রকাশ্য ও গোপন সকল বিষয়ে পরিপূর্ণ ও চিরন্তন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৯, সূরা আল-আনআম ৬:৫৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/alim.mp3"
  },
  {
    "number": 20,
    "arabic": "الْقَابِضُ",
    "transliteration": "Al-Qaabid",
    "nameBn": "আল-ক্বাবিদ্ব",
    "meaningEn": "The Restricting One",
    "meaningBn": "সংকোচনকারী ও নিয়ন্ত্রণকারী",
    "detailsEn": "The Constrictor, The Withholder, The One who constricts the sustenance by His wisdom and expands and widens it with His Generosity and Mercy.",
    "detailsBn": "যিনি স্বীয় প্রজ্ঞাবলে বান্দার রিজিক, জীবন কিংবা অবস্থাকে সংকুচিত বা সীমিত করেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৪৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/qabid.mp3"
  },
  {
    "number": 21,
    "arabic": "الْبَاسِطُ",
    "transliteration": "Al-Baasit",
    "nameBn": "আল-বাসিত",
    "meaningEn": "The Extender",
    "meaningBn": "প্রশস্তকারী",
    "detailsEn": "The Englarger, The One who constricts the sustenance by His wisdom and expands and widens it with His Generosity and Mercy.",
    "detailsBn": "যিনি স্বীয় অপার দয়ায় বান্দার রিজিক, অন্তর ও নেয়ামত অবারিতভাবে উন্মুক্ত ও প্রশস্ত করেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৪৫, সূরা আশ-শুরা ৪২:১২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/basit.mp3"
  },
  {
    "number": 22,
    "arabic": "الْخَافِضُ",
    "transliteration": "Al-Khaafid",
    "nameBn": "আল-খাফিদ",
    "meaningEn": "The Reducer",
    "meaningBn": "অবনমিতকারী",
    "detailsEn": "The Abaser, The One who lowers whoever He willed by His Destruction and raises whoever He willed by His Endowment.",
    "detailsBn": "যিনি অহংকারী, অত্যাচারী ও অবাধ্যদের অপমানিত ও হেয় প্রতিপন্ন করেন।",
    "quranReference": "সূরা আল-ওয়াক্বিআহ ৫৬:৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/khafid.mp3"
  },
  {
    "number": 23,
    "arabic": "الرَّافِعُ",
    "transliteration": "Ar-Rafi",
    "nameBn": "আর-রাফি",
    "meaningEn": "The Elevating One",
    "meaningBn": "উন্নীতকারী ও মর্যাদাদাতা",
    "detailsEn": "The Exalter, The Elevator, The One who lowers whoever He willed by His Destruction and raises whoever He willed by His Endowment.",
    "detailsBn": "যিনি ঈমানদার, সৎকর্মশীল ও বিনয়ী বান্দাদের মর্যাদা দুনিয়া ও আখেরাতে সমুন্নত করেন।",
    "quranReference": "সূরা আল-মুজাদালাহ ৫৮:১১, সূরা আল-আনআম ৬:১৬৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/rafi.mp3"
  },
  {
    "number": 24,
    "arabic": "الْمُعِزُّ",
    "transliteration": "Al-Mu’izz",
    "nameBn": "আল-মুইয্য",
    "meaningEn": "The Honourer-Bestower",
    "meaningBn": "সম্মানদাতা",
    "detailsEn": "He gives esteem to whoever He willed, hence there is no one to degrade Him; And He degrades whoever He willed, hence there is no one to give Him esteem.",
    "detailsBn": "যিনি যাকে ইচ্ছা সত্য পথ ও তাকওয়ার মাধ্যমে প্রকৃত সম্মান ও মর্যাদা দান করেন।",
    "quranReference": "সূরা আলে ইমরান ৩:২৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muizz.mp3"
  },
  {
    "number": 25,
    "arabic": "المُذِلُّ",
    "transliteration": "Al-Muzil",
    "nameBn": "আল-মুযিল্ল",
    "meaningEn": "The Abaser",
    "meaningBn": "অপমানকারী",
    "detailsEn": "The Dishonourer, The Humiliator, He gives esteem to whoever He willed, hence there is no one to degrade Him; And He degrades whoever He willed, hence there is no one to give Him esteem.",
    "detailsBn": "যিনি অহংকারী ও অবাধ্যদের লাঞ্ছনা ও দুর্ভাগ্যের মধ্যে নিমজ্জিত করেন।",
    "quranReference": "সূরা আলে ইমরান ৩:২৬, সূরা আল-হাজ্জ ২২:১৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mudhill.mp3"
  },
  {
    "number": 26,
    "arabic": "السَّمِيعُ",
    "transliteration": "As-Sami’",
    "nameBn": "আস-সামী",
    "meaningEn": "The All-Hearer",
    "meaningBn": "সর্বশ্রোতা",
    "detailsEn": "The Hearer, The One who Hears all things that are heard by His Eternal Hearing without an ear, instrument or organ.",
    "detailsBn": "যিনি সকল ধ্বনি, কথা, নীরব প্রার্থনা ও হৃদয়ের গুঞ্জরণ সুস্পষ্টভাবে শোনেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:১২৭, সূরা আশ-শুরা ৪২:১১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/sami.mp3"
  },
  {
    "number": 27,
    "arabic": "الْبَصِيرُ",
    "transliteration": "Al-Baseer",
    "nameBn": "আল-বাসীর",
    "meaningEn": "The All-Seeing",
    "meaningBn": "সর্বদ্রষ্টা",
    "detailsEn": "The All-Noticing, The One who Sees all things that are seen by His Eternal Seeing without a pupil or any other instrument.",
    "detailsBn": "যাঁর দৃষ্টির বাইরে মহাবিশ্বের কোনো কিছুই নেই; গভীর অন্ধকারের সূক্ষ্মতম গতিবিধিও তিনি দেখেন।",
    "quranReference": "সূরা আল-হুজুরাত ৪৯:১৮, সূরা আল-মুলক ৬৭:১৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/basir.mp3"
  },
  {
    "number": 28,
    "arabic": "الْحَكَمُ",
    "transliteration": "Al-Hakam",
    "nameBn": "আল-হাকাম",
    "meaningEn": "The Impartial Judge",
    "meaningBn": "চূড়ান্ত বিচারক",
    "detailsEn": "The Judge, He is the Ruler and His judgment is His Word.",
    "detailsBn": "যাঁর ফয়সালা অকাট্য, পরিপূর্ণ ন্যায়সঙ্গত এবং যাঁর সিদ্ধান্তের উপর কোনো আপিল চলে না।",
    "quranReference": "সূরা আল-আনআম ৬:১১৪, সূরা আল-মু'মিন ৪০:১২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hakam.mp3"
  },
  {
    "number": 29,
    "arabic": "الْعَدْلُ",
    "transliteration": "Al-Adl",
    "nameBn": "আল-আদল",
    "meaningEn": "The Embodiment of Justice",
    "meaningBn": "পরম ন্যায়পরায়ণ",
    "detailsEn": "The Just, The One who is entitled to do what He does.",
    "detailsBn": "যিনি সর্বদা নিখুঁত ন্যায়বিচার প্রতিষ্ঠা করেন এবং কারো প্রতি অণু পরিমাণও অবিচার করেন না।",
    "quranReference": "সূরা আল-আনআম ৬:১১৫, সূরা আন-নিসা ৪:৪০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/adl.mp3"
  },
  {
    "number": 30,
    "arabic": "اللَّطِيفُ",
    "transliteration": "Al-Lateef",
    "nameBn": "আল-লাতীফ",
    "meaningEn": "The Knower of Subtleties",
    "meaningBn": "পরম স্নেহশীল ও সূক্ষ্মদর্শী",
    "detailsEn": "The Subtle One, The Gracious, The One who is kind to His slaves and endows upon them.",
    "detailsBn": "যিনি সকল সূক্ষ্ম বিষয় সম্পর্কে সম্যক অবগত এবং বান্দার প্রতি অতি সংগোপনে অনুগ্রহ বর্ষণ করেন।",
    "quranReference": "সূরা আল-আনআম ৬:১০৩, সূরা লুকমান ৩১:১৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/latif.mp3"
  },
  {
    "number": 31,
    "arabic": "الْخَبِيرُ",
    "transliteration": "Al-Khabeer",
    "nameBn": "আল-খাবীর",
    "meaningEn": "The All-Aware One",
    "meaningBn": "সর্বজ্ঞাত ও ওয়াকিবহাল",
    "detailsEn": "The One who knows the truth of things.",
    "detailsBn": "যিনি সকল সৃষ্টিজগতের অন্তর্নিহিত গভীর সত্য ও গোপন অবস্থা সম্পর্কে সম্পূর্ণ অবগত।",
    "quranReference": "সূরা আল-মুলক ৬৭:১৪, সূরা আত-তাহরীম ৬৬:৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/khabir.mp3"
  },
  {
    "number": 32,
    "arabic": "الْحَلِيمُ",
    "transliteration": "Al-Haleem",
    "nameBn": "আল-হালীম",
    "meaningEn": "The Clement One",
    "meaningBn": "পরম ধৈর্যশীল ও সহনশীল",
    "detailsEn": "The Forebearing, The One who delays the punishment for those who deserve it and then He might forgive them.",
    "detailsBn": "যিনি গুনাহগার বান্দাদের তাৎক্ষণিক শাস্তি না দিয়ে তওবার অবারিত সুযোগ প্রদান করেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২২৫, সূরা আল-ইসরা ১৭:৪৪",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/halim.mp3"
  },
  {
    "number": 33,
    "arabic": "الْعَظِيمُ",
    "transliteration": "Al-Azeem",
    "nameBn": "আল-আযীম",
    "meaningEn": "The Magnificent One",
    "meaningBn": "সুমহান ও মহিমান্বিত",
    "detailsEn": "The Great One, The Mighty, The One deserving the attributes of Exaltment, Glory, Extolement, and Purity from all imperfection.",
    "detailsBn": "যাঁর মহত্ত্ব ও শ্রেষ্ঠত্ব মানুষের কল্পনা ও ধারণার বহু ঊর্ধ্বে।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৫৫, সূরা আল-ওয়াক্বিআহ ৫৬:৯৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/azim.mp3"
  },
  {
    "number": 34,
    "arabic": "الْغَفُورُ",
    "transliteration": "Al-Ghafoor",
    "nameBn": "আল-গাফূর",
    "meaningEn": "The Great Forgiver",
    "meaningBn": "অসীম ক্ষমাশীল",
    "detailsEn": "The All-Forgiving, The Forgiving, The One who forgives a lot.",
    "detailsBn": "যিনি বান্দার বারবার করা গুনাহরাশি ক্ষমা করে দেন এবং শাস্তি মওকুফ করেন।",
    "quranReference": "সূরা আয-যুমার ৩৯:৫৩, সূরা আল-হিজর ১৫:৪৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/ghafur.mp3"
  },
  {
    "number": 35,
    "arabic": "الشَّكُورُ",
    "transliteration": "Ash-Shakoor",
    "nameBn": "আশ-শাকূর",
    "meaningEn": "The Acknowledging One",
    "meaningBn": "গুণগ্রাহী ও মহাপুরস্কারদাতা",
    "detailsEn": "The Grateful, The Appreciative, The One who gives a lot of reward for a little obedience.",
    "detailsBn": "যিনি সামান্যতম সৎকর্মেরও বহু গুণ বেশি প্রতিদান ও কল্যাণ দান করেন।",
    "quranReference": "সূরা ফাতির ৩৫:৩০, সূরা আত-তাগাবুন ৬৪:১৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/shakur.mp3"
  },
  {
    "number": 36,
    "arabic": "الْعَلِيُّ",
    "transliteration": "Al-Aliyy",
    "nameBn": "আল-আলী",
    "meaningEn": "The Sublime One",
    "meaningBn": "সর্বোচ্চ ও সুউচ্চ",
    "detailsEn": "The Most High, The One who is clear from the attributes of the creatures.",
    "detailsBn": "যাঁর মর্যাদা, ক্ষমতা ও অবস্থান মহাবিশ্বের সবকিছুর চেয়ে সর্বোচ্চ স্থানে।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৫৫, সূরা আল-আলা ৮৭:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/ali.mp3"
  },
  {
    "number": 37,
    "arabic": "الْكَبِيرُ",
    "transliteration": "Al-Kabeer",
    "nameBn": "আল-কাবীর",
    "meaningEn": "The Great One",
    "meaningBn": "সর্বশ্রেষ্ঠ ও সুবিশাল",
    "detailsEn": "The Most Great, The Great, The One who is greater than everything in status.",
    "detailsBn": "যিনি সর্বাপেক্ষা মহান এবং যাঁর সমকক্ষ বা সমতুল্য কোনো কিছুই নেই।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৬২, সূরা আর-রাদ ১৩:৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/kabir.mp3"
  },
  {
    "number": 38,
    "arabic": "الْحَفِيظُ",
    "transliteration": "Al-Hafiz",
    "nameBn": "আল-হাফীয",
    "meaningEn": "The Guarding One",
    "meaningBn": "পরম সংরক্ষক",
    "detailsEn": "The Preserver, The Protector, The One who protects whatever and whoever He willed to protect.",
    "detailsBn": "যিনি আসমান-জমিন এবং তাঁর বান্দাদের সকল বিপদ-আপদ থেকে রক্ষা করেন ও সংরক্ষণ করেন।",
    "quranReference": "সূরা হূদ ১১:৫৭, সূরা সাবা ৩৪:২১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hafiz.mp3"
  },
  {
    "number": 39,
    "arabic": "المُقيِت",
    "transliteration": "Al-Muqeet",
    "nameBn": "আল-মুক্বীত",
    "meaningEn": "The Sustaining One",
    "meaningBn": "সকলের আহার্য ও শক্তিদাতা",
    "detailsEn": "The Maintainer, The Guardian, The Feeder, The One who has the Power.",
    "detailsBn": "যিনি প্রতিটি প্রাণীর প্রয়োজনীয় খাদ্য, শক্তি ও পুষ্টির ব্যবস্থা করেন।",
    "quranReference": "সূরা আন-নিসা ৪:৮৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muqit.mp3"
  },
  {
    "number": 40,
    "arabic": "الْحسِيبُ",
    "transliteration": "Al-Haseeb",
    "nameBn": "আল-হাসীব",
    "meaningEn": "The Reckoning One",
    "meaningBn": "পুঙ্খানুপুঙ্খ হিসাব গ্রহণকারী",
    "detailsEn": "The Reckoner, The One who gives the satisfaction.",
    "detailsBn": "যিনি বান্দার সকল ভালো ও মন্দ কাজের নিখুঁত হিসাব রাখবেন এবং যিনি বান্দার জন্য যথেষ্ট।",
    "quranReference": "সূরা আন-নিসা ৪:৬, সূরা আল-আহযাব ৩৩:৩৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hasib.mp3"
  },
  {
    "number": 41,
    "arabic": "الْجَلِيلُ",
    "transliteration": "Al-Jaleel",
    "nameBn": "আল-জালীল",
    "meaningEn": "The Majestic One",
    "meaningBn": "মহিমাময় ও প্রতাপশালী",
    "detailsEn": "The Sublime One, The Beneficent, The One who is attributed with greatness of Power and Glory of status.",
    "detailsBn": "যাঁর সত্তা ও গুণাবলিতে রয়েছে পরিপূর্ণ মহত্ত্ব, গাম্ভীর্য ও অসীম মর্যাদা।",
    "quranReference": "সূরা আর-রহমান ৫৫:২৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/jalil.mp3"
  },
  {
    "number": 42,
    "arabic": "الْكَرِيمُ",
    "transliteration": "Al-Kareem",
    "nameBn": "আল-কারীম",
    "meaningEn": "The Bountiful One",
    "meaningBn": "পরম দয়ালু ও উদার দাতা",
    "detailsEn": "The Generous One, The Gracious, The One who is attributed with greatness of Power and Glory of status.",
    "detailsBn": "যিনি প্রার্থনার আগেই যাচ্ঞাহীনভাবে অসীম নেয়ামত ও অনুগ্রহ দান করেন।",
    "quranReference": "সূরা আল-ইনফিতার ৮২:৬, সূরা আন-নামল ২৭:৪০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/karim.mp3"
  },
  {
    "number": 43,
    "arabic": "الرَّقِيبُ",
    "transliteration": "Ar-Raqeeb",
    "nameBn": "আর-রাক্বীব",
    "meaningEn": "The Watchful One",
    "meaningBn": "সতত পর্যবেক্ষক ও পাহারাদার",
    "detailsEn": "The Watcher, The One that nothing is absent from Him. Hence it's meaning is related to the attribute of Knowledge.",
    "detailsBn": "যাঁর নজরদারি থেকে একটি মুহূর্তের জন্যও কোনো কিছু গোপন থাকে না।",
    "quranReference": "সূরা আন-নিসা ৪:১, সূরা আল-মায়িদাহ ৫:১১৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/raqib.mp3"
  },
  {
    "number": 44,
    "arabic": "الْمُجِيبُ",
    "transliteration": "Al-Mujeeb",
    "nameBn": "আল-মুজীব",
    "meaningEn": "The Responding One",
    "meaningBn": "দোআ কবুলকারী",
    "detailsEn": "The Responsive, The Hearkener, The One who answers the one in need if he asks Him and rescues the yearner if he calls upon Him.",
    "detailsBn": "যিনি ব্যাকুল অন্তরের প্রার্থনা ও আহবানে সাড়া দেন এবং অভাব পূরণ করেন।",
    "quranReference": "সূরা হূদ ১১:৬১, সূরা আল-বাক্বারাহ ২:১৮৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mujib.mp3"
  },
  {
    "number": 45,
    "arabic": "الْوَاسِعُ",
    "transliteration": "Al-Waasi’",
    "nameBn": "আল-ওয়াসি",
    "meaningEn": "The All-Pervading One",
    "meaningBn": "সর্বব্যাপী ও অসীম প্রাচুর্যময়",
    "detailsEn": "The Vast, The All-Embracing, The Knowledgeable.",
    "detailsBn": "যাঁর দয়া, জ্ঞান, ক্ষমা ও সামর্থ্য সমগ্র সৃষ্টিজগতকে পরিবেষ্টন করে রেখেছে।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৬৮, সূরা আল-মায়িদাহ ৫:৫৪",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wasi.mp3"
  },
  {
    "number": 46,
    "arabic": "الْحَكِيمُ",
    "transliteration": "Al-Hakeem",
    "nameBn": "আল-হাকীম",
    "meaningEn": "The Wise One",
    "meaningBn": "পরম প্রজ্ঞাময়",
    "detailsEn": "The Wise, The Judge of Judges, The One who is correct in His doings.",
    "detailsBn": "যাঁর প্রতিটি সৃষ্টি, বিধান এবং সিদ্ধান্তে রয়েছে অগাধ প্রজ্ঞা ও গভীর উদ্দেশ্য।",
    "quranReference": "সূরা আল-আনআম ৬:১৮, সূরা লুকমান ৩১:২৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hakim.mp3"
  },
  {
    "number": 47,
    "arabic": "الْوَدُودُ",
    "transliteration": "Al-Wadud",
    "nameBn": "আল-ওয়াদূদ",
    "meaningEn": "The Loving One",
    "meaningBn": "পরম স্নেহময় ও প্রেমময়",
    "detailsEn": "The One who loves His believing slaves and His believing slaves love Him. His love to His slaves is His Will to be merciful to them and praise them.",
    "detailsBn": "যিনি স্বীয় নেককার বান্দাদের ভালোবাসেন এবং তাদের অন্তরে ভালোবাসা সঞ্চার করেন।",
    "quranReference": "সূরা হূদ ১১:৯০, সূরা আল-বুরুজ ৮৫:১৪",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wadud.mp3"
  },
  {
    "number": 48,
    "arabic": "الْمَجِيدُ",
    "transliteration": "Al-Majeed",
    "nameBn": "আল-মাজীদ",
    "meaningEn": "The Glorious One",
    "meaningBn": "মহিমান্বিত ও প্রশংসিত",
    "detailsEn": "The Most Glorious One, The One who is with perfect Power, High Status, Compassion, Generosity and Kindness.",
    "detailsBn": "যিনি পরিপূর্ণ সম্মান, উচ্চ মর্যাদা ও সীমাহীন বদান্যতার একমাত্র অধিকারী।",
    "quranReference": "সূরা হূদ ১১:৭৩, সূরা আল-বুরুজ ৮৫:১৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/majeed.mp3"
  },
  {
    "number": 49,
    "arabic": "الْبَاعِثُ",
    "transliteration": "Al-Ba’ith",
    "nameBn": "আল-বা'ইছ",
    "meaningEn": "The Infuser of New Life",
    "meaningBn": "পুনরুত্থানকারী",
    "detailsEn": "The Resurrector, The Raiser (from death), The One who resurrects His slaves after death for reward and/or punishment.",
    "detailsBn": "যিনি মৃত্যুর পর বিচার দিবসের জন্য সকল মানুষকে কবর থেকে পুনরায় জীবিত করে তুলবেন।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৭, সূরা ইয়াসীন ৩৬:৫২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/baith.mp3"
  },
  {
    "number": 50,
    "arabic": "الشَّهِيدُ",
    "transliteration": "Ash-Shaheed",
    "nameBn": "আশ-শাহীদ",
    "meaningEn": "The All Observing Witness",
    "meaningBn": "সাক্ষ্যদাতা ও প্রত্যক্ষদর্শী",
    "detailsEn": "The Witness, The One who nothing is absent from Him.",
    "detailsBn": "যিনি সর্বাবস্থায় উপস্থিত থেকে প্রতিটি ঘটনার সাক্ষ্য বহন করেন।",
    "quranReference": "সূরা আল-হাজ্জ ২২:১৭, সূরা আল-বুরুজ ৮৫:৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/shahid.mp3"
  },
  {
    "number": 51,
    "arabic": "الْحَقُّ",
    "transliteration": "Al-Haqq",
    "nameBn": "আল-হাক্বক্ব",
    "meaningEn": "The Embodiment of Truth",
    "meaningBn": "চিরন্তন সত্য",
    "detailsEn": "The Truth, The True, The One who truly exists.",
    "detailsBn": "যাঁর অস্তিত্ব সুনিশ্চিত, অপরিবর্তনীয় এবং যাঁর প্রতিশ্রুতি ও বাণী চিরসত্য।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৬, সূরা ইউনুস ১০:৩২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/haqq.mp3"
  },
  {
    "number": 52,
    "arabic": "الْوَكِيلُ",
    "transliteration": "Al-Wakeel",
    "nameBn": "আল-ওয়াকীল",
    "meaningEn": "The Universal Trustee",
    "meaningBn": "পরম কর্মবিধায়ক ও নির্ভরযোগ্য অভিভাবক",
    "detailsEn": "The Trustee, The One who gives the satisfaction and is relied upon.",
    "detailsBn": "যাঁর উপর পূর্ণ আস্থা ও ভরসা রাখা যায় এবং যিনি বান্দার সব ভার বহন করেন।",
    "quranReference": "সূরা আলে ইমরান ৩:১৭৩, সূরা আল-আনআম ৬:১০২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wakil.mp3"
  },
  {
    "number": 53,
    "arabic": "الْقَوِيُّ",
    "transliteration": "Al-Qawwiyy",
    "nameBn": "আল-ক্ববীয়",
    "meaningEn": "The Strong One",
    "meaningBn": "মহাশক্তিশালী",
    "detailsEn": "The Most Strong, The Strong, The One with the complete Power.",
    "detailsBn": "যাঁর শক্তি অসীম এবং যাকে কোনো শক্তি বা প্রতিবন্ধকতা দুর্বল করতে পারে না।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৪০, সূরা আশ-শুরা ৪২:১৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/qawi.mp3"
  },
  {
    "number": 54,
    "arabic": "الْمَتِينُ",
    "transliteration": "Al-Mateen",
    "nameBn": "আল-মাতীন",
    "meaningEn": "The Firm One",
    "meaningBn": "সুদৃঢ় ও অটল",
    "detailsEn": "The One with extreme Power which is un-interrupted and He does not get tired.",
    "detailsBn": "যাঁর ক্ষমতায় কোনো ক্ষয় বা ক্লান্তি নেই, যিনি চিরকাল অপরাজেয় ও অনড়।",
    "quranReference": "সূরা আয-যারিয়াত ৫১:৫৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/matin.mp3"
  },
  {
    "number": 55,
    "arabic": "الْوَلِيُّ",
    "transliteration": "Al-Waliyy",
    "nameBn": "আল-ওয়ালীয়",
    "meaningEn": "The Protecting Associate",
    "meaningBn": "পরম পৃষ্ঠপোষক ও বন্ধু",
    "detailsEn": "The Protecting Friend, The Supporter.",
    "detailsBn": "যিনি ঈমানদার বান্দাদের প্রিয় অভিভাবক, সহায়ক এবং অন্ধকার থেকে আলোতে আনয়নকারী।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৫৭, সূরা আশ-শুরা ৪২:২৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/waliy.mp3"
  },
  {
    "number": 56,
    "arabic": "الْحَمِيدُ",
    "transliteration": "Al-Hameed",
    "nameBn": "আল-হামীদ",
    "meaningEn": "The Sole-Laudable One",
    "meaningBn": "সর্বপ্রশংসিত",
    "detailsEn": "The Praiseworthy, The praised One who deserves to be praised.",
    "detailsBn": "যিনি আপন সত্তা ও মহিমায় চিরপ্রশংসিত, সকল প্রশংসার একমাত্র যোগ্য পাত্র।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৬৪, সূরা ইব্রাহীম ১৪:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hamid.mp3"
  },
  {
    "number": 57,
    "arabic": "الْمُحْصِي",
    "transliteration": "Al-Muhsee",
    "nameBn": "আল-মুহসী",
    "meaningEn": "The All-Enumerating One",
    "meaningBn": "সবকিছুর পরিগণক",
    "detailsEn": "The Counter, The Reckoner, The One who the count of things are known to him.",
    "detailsBn": "যিনি সৃষ্টিজগতের ছোট-বড় সকল বিষয়ের সংখ্যা ও বিবরণ পুঙ্খানুপুঙ্খভাবে অবগত।",
    "quranReference": "সূরা মারইয়াম ১৯:৯৪, সূরা আল-জিন ৭২:২৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muhsi.mp3"
  },
  {
    "number": 58,
    "arabic": "الْمُبْدِئُ",
    "transliteration": "Al-Mubdi",
    "nameBn": "আল-মুবদি",
    "meaningEn": "The Originator",
    "meaningBn": "প্রথম সৃষ্টিকর্তা",
    "detailsEn": "The One who started the human being. That is, He created him.",
    "detailsBn": "যিনি পূর্বে কোনো কিছুর অস্তিত্ব ব্যতিরেকেই প্রথমবারের মতো সৃষ্টি উদ্ভাবন করেছেন।",
    "quranReference": "সূরা আল-বুরুজ ৮৫:১৩, সূরা আল-আম্বিয়া ২১:১০৪",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mubdi.mp3"
  },
  {
    "number": 59,
    "arabic": "الْمُعِيدُ",
    "transliteration": "Al-Mueed",
    "nameBn": "আল-মুঈদ",
    "meaningEn": "The Restorer",
    "meaningBn": "পুনরুজ্জীবনকারী",
    "detailsEn": "The Reproducer, The One who brings back the creatures after death.",
    "detailsBn": "যিনি ধ্বংসের পর সকল সৃষ্টিকে পুনরায় আগের অবস্থায় ফিরিয়ে আনবেন।",
    "quranReference": "সূরা আল-বুরুজ ৮৫:১৩, সূরা আর-রূম ৩০:২৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muid.mp3"
  },
  {
    "number": 60,
    "arabic": "الْمُحْيِي",
    "transliteration": "Al-Muhyi",
    "nameBn": "আল-মুহঈ",
    "meaningEn": "The Maintainer of life",
    "meaningBn": "জীবনদাতা",
    "detailsEn": "The Restorer, The Giver of Life, The One who took out a living human from semen that does not have a soul. He gives life by giving the souls back to the worn out bodies on the resurrection day and He makes the hearts alive by the light of knowledge.",
    "detailsBn": "যিনি নিষ্প্রাণ বস্তুর মাঝে প্রাণ সঞ্চার করেন এবং মৃতকে জীবন দান করেন।",
    "quranReference": "সূরা আর-রূম ৩০:৫০, সূরা ফুসসিলাত ৪১:৩৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muhyi.mp3"
  },
  {
    "number": 61,
    "arabic": "اَلْمُمِيتُ",
    "transliteration": "Al-Mumeet",
    "nameBn": "আল-মুমীত",
    "meaningEn": "The Inflictor of Death",
    "meaningBn": "মৃত্যুদানকারী",
    "detailsEn": "The Creator of Death, The Destroyer, The One who renders the living dead.",
    "detailsBn": "যিনি নির্ধারিত সময়ে সকল জীবিত প্রাণীর মৃত্যু ঘটান।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৬৬, সূরা আল-মুলক ৬৭:২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mumit.mp3"
  },
  {
    "number": 62,
    "arabic": "الْحَيُّ",
    "transliteration": "Al-Hayy",
    "nameBn": "আল-হাইয়্যু",
    "meaningEn": "The Eternally Living One",
    "meaningBn": "চিরঞ্জীব",
    "detailsEn": "The Alive, The One attributed with a life that is unlike our life and is not that of a combination of soul, flesh or blood.",
    "detailsBn": "যিনি সর্বদা জীবিত এবং যাঁর কোনো শুরু ও শেষ নেই; যাঁর কখনো বিনাশ ঘটে না।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৫৫, সূরা আলে ইমরান ৩:২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hayy.mp3"
  },
  {
    "number": 63,
    "arabic": "الْقَيُّومُ",
    "transliteration": "Al-Qayyoom",
    "nameBn": "আল-ক্বাইয়্যূম",
    "meaningEn": "The Self-Subsisting One",
    "meaningBn": "চিরস্থায়ী ও সর্বধারক",
    "detailsEn": "The One who remains and does not end.",
    "detailsBn": "যিনি স্বীয় সত্তায় প্রতিষ্ঠিত এবং সমগ্র সৃষ্টিজগতকে রক্ষা ও পরিচালনা করছেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২৫৫, সূরা ত্বাহা ২০:১১১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/qayyum.mp3"
  },
  {
    "number": 64,
    "arabic": "الْوَاجِدُ",
    "transliteration": "Al-Waajid",
    "nameBn": "আল-ওয়াজিদ",
    "meaningEn": "The Pointing One",
    "meaningBn": "অভাবহীন ও যা ইচ্ছা তা-ই প্রাপ্তকারী",
    "detailsEn": "The Perceiver, The Finder, The Rich who is never poor. Al-Wajd is Richness.",
    "detailsBn": "যাঁর কোনো অভাব নেই, যিনি যা চান তা মুহূর্তের মধ্যেই প্রাপ্ত হন।",
    "quranReference": "সূরা আদ-দুহা ৯৩:৬-৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wajid.mp3"
  },
  {
    "number": 65,
    "arabic": "الْمَاجِدُ",
    "transliteration": "Al-Maajid",
    "nameBn": "আল-মাজিদ",
    "meaningEn": "The All-Noble One",
    "meaningBn": "মহৎ ও শ্রেষ্ঠ",
    "detailsEn": "The Glorious, He who is Most Glorious.",
    "detailsBn": "যাঁর দান, উদারতা ও দয়া অপার এবং যাঁর সম্মান সর্বাধিক।",
    "quranReference": "সূরা আল-বুরুজ ৮৫:১৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/majid.mp3"
  },
  {
    "number": 66,
    "arabic": "الْواحِدُ",
    "transliteration": "Al-Waahid",
    "nameBn": "আল-ওয়াহিদ",
    "meaningEn": "The Only One",
    "meaningBn": "এক ও অদ্বিতীয়",
    "detailsEn": "The Unique, The One, The One without a partner.",
    "detailsBn": "যাঁর কোনো শরীক বা অংশীদার নেই, যাঁর সত্তা ও গুণাবলি সম্পূর্ণ একক।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:১৬৩, সূরা আল-ইখলাস ১১২:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wahid.mp3"
  },
  {
    "number": 67,
    "arabic": "اَلاَحَدُ",
    "transliteration": "Al-Ahad",
    "nameBn": "আল-আহাদ",
    "meaningEn": "The Sole One",
    "meaningBn": "একক ও অতুলনীয়",
    "detailsEn": "The One.",
    "detailsBn": "যিনি অনন্য, অবিভাজ্য এবং যাঁর কোনো সমকক্ষ বা তুলনা নেই।",
    "quranReference": "সূরা আল-ইখলাস ১১২:১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/ahad.mp4"
  },
  {
    "number": 68,
    "arabic": "الصَّمَدُ",
    "transliteration": "As-Samad",
    "nameBn": "আস-সামাদ",
    "meaningEn": "The Supreme Provider",
    "meaningBn": "অমুখাপেক্ষী ও পরম আশ্রয়স্থল",
    "detailsEn": "The Eternal, The Independent, The Master who is relied upon in matters and reverted to in ones needs.",
    "detailsBn": "যাঁর কোনো কিছুর প্রয়োজন নেই, কিন্তু সমস্ত সৃষ্টি সদা যাঁর মুখাপেক্ষী।",
    "quranReference": "সূরা আল-ইখলাস ১১২:২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/samad.mp3"
  },
  {
    "number": 69,
    "arabic": "الْقَادِرُ",
    "transliteration": "Al-Qaadir",
    "nameBn": "আল-ক্বাদীর",
    "meaningEn": "The Omnipotent One",
    "meaningBn": "পরম ক্ষমতাবান",
    "detailsEn": "The Able, The Capable, The One attributed with Power.",
    "detailsBn": "যিনি যা ইচ্ছা তা করার অবাধ ক্ষমতার অধিকারী এবং কোনো কিছুই যাঁর শক্তির বাইরে নয়।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:২০, সূরা আল-আনআম ৬:৬৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/qadir.mp3"
  },
  {
    "number": 70,
    "arabic": "الْمُقْتَدِرُ",
    "transliteration": "Al-Muqtadir",
    "nameBn": "আল-মুক্বতাদির",
    "meaningEn": "The All Authoritative One",
    "meaningBn": "পূর্ণ শক্তির প্রভাবক",
    "detailsEn": "The Powerful, The Dominant, The One with the perfect Power that nothing is withheld from Him.",
    "detailsBn": "যাঁর ইচ্ছা ও সংকল্প সৃষ্টির মাঝে নিখুঁতভাবে ও নিশ্চিতরূপে কার্যকর হয়।",
    "quranReference": "সূরা আল-ক্বামার ৫৪:৪২, সূরা আল-ক্বামার ৫৪:৫৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muqtadir.mp3"
  },
  {
    "number": 71,
    "arabic": "الْمُقَدِّمُ",
    "transliteration": "Al-Muqaddim",
    "nameBn": "আল-মুক্বাদ্দিম",
    "meaningEn": "The Expediting One",
    "meaningBn": "অগ্রবর্তীকারী",
    "detailsEn": "The Expediter, The Promoter, The One who puts things in their right places. He makes ahead what He wills and delays what He wills.",
    "detailsBn": "যিনি স্বীয় হিকমত অনুসারে যাকে চান মর্যাদায় ও কল্যাণে এগিয়ে দেন।",
    "quranReference": "সূরা কাফ ৫০:২৮, সূরা আল-ইসরা ১৭:২১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muqaddim.mp3"
  },
  {
    "number": 72,
    "arabic": "الْمُؤَخِّرُ",
    "transliteration": "Al-Mu’akhkhir",
    "nameBn": "আল-মুআখ্খির",
    "meaningEn": "The Procrastinator",
    "meaningBn": "পশ্চাদবর্তীকারী",
    "detailsEn": "The Delayer, the Retarder, The One who puts things in their right places. He makes ahead what He wills and delays what He wills.",
    "detailsBn": "যিনি স্বীয় প্রজ্ঞাবলে যাকে ইচ্ছা বিলম্বিত করেন কিংবা পেছনে রাখেন।",
    "quranReference": "সূরা নূহ ৭১:৪, সূরা ইব্রাহীম ১৪:৪২",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muakhkhir.mp3"
  },
  {
    "number": 73,
    "arabic": "الأوَّلُ",
    "transliteration": "Al-Awwal",
    "nameBn": "আল-আউয়াল",
    "meaningEn": "The Very First",
    "meaningBn": "অনাদি ও আদিহীন প্রথম",
    "detailsEn": "The First, The One whose Existence is without a beginning.",
    "detailsBn": "যাঁর পূর্বে কোনো কিছুর অস্তিত্ব ছিল না, যিনি সৃষ্টির সূচনাপূর্ব থেকেই বিদ্যমান।",
    "quranReference": "সূরা আল-হাদীদ ৫৭:৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/awwal.mp3"
  },
  {
    "number": 74,
    "arabic": "الآخِرُ",
    "transliteration": "Al-Akhir",
    "nameBn": "আল-আখির",
    "meaningEn": "The Infinite Last One",
    "meaningBn": "অনন্ত ও অন্তহীন শেষ",
    "detailsEn": "The Last, The One whose Existence is without an end.",
    "detailsBn": "সকল সৃষ্টি ধ্বংস হয়ে গেলেও যিনি চিরকাল অবশিষ্ট থাকবেন।",
    "quranReference": "সূরা আল-হাদীদ ৫৭:৩, সূরা আর-রহমান ৫৫:২৬-২৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/akhir.mp3"
  },
  {
    "number": 75,
    "arabic": "الظَّاهِرُ",
    "transliteration": "Az-Zaahir",
    "nameBn": "আয-যাহির",
    "meaningEn": "The Perceptible",
    "meaningBn": "সুস্পষ্ট ও প্রকাশ্য",
    "detailsEn": "The Manifest, The One that nothing is above Him and nothing is underneath Him, hence He exists without a place. He, The Exalted, His Existence is obvious by proofs and He is clear from the delusions of attributes of bodies.",
    "detailsBn": "যাঁর অস্তিত্বের নিদর্শনাবলি মহাবিশ্বের প্রতিটি সৃষ্টির মাঝে দেদীপ্যমান।",
    "quranReference": "সূরা আল-হাদীদ ৫৭:৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/zahir.mp3"
  },
  {
    "number": 76,
    "arabic": "الْبَاطِنُ",
    "transliteration": "Al-Baatin",
    "nameBn": "আল-বাতিন",
    "meaningEn": "The Imperceptible",
    "meaningBn": "গূঢ় ও অপ্রকাশ্য",
    "detailsEn": "The Hidden, The One that nothing is above Him and nothing is underneath Him, hence He exists without a place. He, The Exalted, His Existence is obvious by proofs and He is clear from the delusions of attributes of bodies.",
    "detailsBn": "যাঁকে স্থূল দৃষ্টি দিয়ে দেখা যায় না, যিনি সমস্ত রহস্যের গভীরতম জ্ঞানে উপস্থিত।",
    "quranReference": "সূরা আল-হাদীদ ৫৭:৩, সূরা আল-আনআম ৬:১০৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/batin.mp3"
  },
  {
    "number": 77,
    "arabic": "الْوَالِي",
    "transliteration": "Al-Waali",
    "nameBn": "আল-ওয়ালী",
    "meaningEn": "The Holder of Supreme Authority",
    "meaningBn": "একক শাসক ও অভিভাবক",
    "detailsEn": "The Governor, The One who owns things and manages them.",
    "detailsBn": "যিনি সমগ্র মহাবিশ্বের সকল কাজ পরিচালনা ও তদারকি করেন।",
    "quranReference": "সূরা আর-রাদ ১৩:১১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/wali.mp3"
  },
  {
    "number": 78,
    "arabic": "الْمُتَعَالِي",
    "transliteration": "Al-Muta’ali",
    "nameBn": "আল-মুতা'আলী",
    "meaningEn": "The Extremely Exalted One",
    "meaningBn": "সর্বোচ্চ উন্নীত",
    "detailsEn": "The Most Exalted, The High Exalted, The One who is clear from the attributes of the creation.",
    "detailsBn": "যিনি মানবীয় চিন্তা, সন্দেহ ও কল্পনার বহু ঊর্ধ্বে সুউচ্চ মর্যাদায় সমাসীন।",
    "quranReference": "সূরা আর-রাদ ১৩:৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muta_ali.mp3"
  },
  {
    "number": 79,
    "arabic": "الْبَرُّ",
    "transliteration": "Al-Barr",
    "nameBn": "আল-বার্র",
    "meaningEn": "The Fountain-Head of Truth",
    "meaningBn": "পরম পরোপকারী ও সদাশয়",
    "detailsEn": "The Source of All Goodness, The Righteous, The One who is kind to His creatures, who covered them with His sustenance and specified whoever He willed among them by His support, protection, and special mercy.",
    "detailsBn": "যিনি সৃষ্টির প্রতি সর্বদা কল্যাণকামী এবং যাঁর অনুগ্রহ কখনো শেষ হয় না।",
    "quranReference": "সূরা আত-তূর ৫২:২৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/barr.mp3"
  },
  {
    "number": 80,
    "arabic": "التَّوَابُ",
    "transliteration": "At-Tawwaab",
    "nameBn": "আত-তাওয়াব",
    "meaningEn": "The Ever-Acceptor of Repentance",
    "meaningBn": "তওবা কবুলকারী",
    "detailsEn": "The Relenting, The One who grants repentance to whoever He willed among His creatures and accepts his repentance.",
    "detailsBn": "যিনি অনুতপ্ত বান্দার পাপ মোচন করেন এবং ক্ষমার সাথে তাকে গ্রহণ করেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:৩৭, সূরা আন-নাসর ১১০:৩",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/tawwab.mp3"
  },
  {
    "number": 81,
    "arabic": "الْمُنْتَقِمُ",
    "transliteration": "Al-Muntaqim",
    "nameBn": "আল-মুনতাক্বিম",
    "meaningEn": "The Retaliator",
    "meaningBn": "অন্যায়কারীদের শাস্তিদাতা",
    "detailsEn": "The Avenger, The One who victoriously prevails over His enemies and punishes them for their sins. It may mean the One who destroys them.",
    "detailsBn": "যিনি অহংকারী, যালেম ও সত্যপ্রত্যাখ্যানকারীদের যথাযোগ্য শাস্তি দেন।",
    "quranReference": "সূরা আস-সাজদাহ ৩২:২২, সূরা আয-যুখরুফ ৪৩:৪১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muntaqim.mp3"
  },
  {
    "number": 82,
    "arabic": "العَفُوُّ",
    "transliteration": "Al-Afuww",
    "nameBn": "আল-আফুউ",
    "meaningEn": "The Supreme Pardoner",
    "meaningBn": "পরম মার্জনাশীল",
    "detailsEn": "The Forgiver, The One with wide forgiveness.",
    "detailsBn": "যিনি বান্দার পাপের চিহ্ন পর্যন্ত মুছে দেন এবং পুরোপুরি মাফ করে দেন।",
    "quranReference": "সূরা আন-নিসা ৪:৯৯, সূরা আল-হাজ্জ ২২:৬০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/afuw.mp3"
  },
  {
    "number": 83,
    "arabic": "الرَّؤُوفُ",
    "transliteration": "Ar-Ra’oof",
    "nameBn": "আর-রাউফ",
    "meaningEn": "The Benign One",
    "meaningBn": "পরম স্নেহশীল ও কোমল হৃদয়",
    "detailsEn": "The Compassionate, The One with extreme Mercy. The Mercy of Allah is His will to endow upon whoever He willed among His creatures.",
    "detailsBn": "যাঁর দয়া ও মমতা অত্যন্ত গভীর এবং যিনি বান্দার দুঃখ লাঘব করেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:১৪৩, সূরা আত-তাওবাহ ৯:১১৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/rauf.mp3"
  },
  {
    "number": 84,
    "arabic": "مَالِكُ الْمُلْكِ",
    "transliteration": "Maalik-ul-Mulk",
    "nameBn": "মালিকুল মুলক",
    "meaningEn": "The Eternal Possessor of Sovereignty",
    "meaningBn": "সার্বভৌম রাজ্যের অধিপতি",
    "detailsEn": "The One who controls the Dominion and gives dominion to whoever He willed.",
    "detailsBn": "সমগ্র রাজত্ব ও ক্ষমতার একচ্ছত্র মালিক, যিনি যাকে ইচ্ছা ক্ষমতা দেন ও নেন।",
    "quranReference": "সূরা আলে ইমরান ৩:২৬",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/malik_ul_mulk.mp3"
  },
  {
    "number": 85,
    "arabic": "ذُوالْجَلاَلِ وَالإكْرَامِ",
    "transliteration": "Zul-Jalaali-wal-Ikram",
    "nameBn": "যুল-জালালি ওয়াল-ইকরাম",
    "meaningEn": "The Possessor of Majesty and Honour",
    "meaningBn": "মহিমাময় ও মহানুভবতার অধিকারী",
    "detailsEn": "The Lord of Majesty and Bounty, The One who deserves to be Exalted and not denied.",
    "detailsBn": "যিনি মহত্ত্ব, প্রতাপ, সম্মান ও অফুরন্ত অনুগ্রহের পরম উৎস।",
    "quranReference": "সূরা আর-রহমান ৫৫:২৭, সূরা আর-রহমান ৫৫:৭৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/dhu_l_jalali_wal_ikram.mp3"
  },
  {
    "number": 86,
    "arabic": "الْمُقْسِطُ",
    "transliteration": "Al-Muqsit",
    "nameBn": "আল-মুক্বসিত",
    "meaningEn": "The Just One",
    "meaningBn": "পরম ন্যায়বিচারক",
    "detailsEn": "The Equitable, The One who is Just in His judgment.",
    "detailsBn": "যিনি নিখুঁত সমতা বজায় রাখেন এবং মজলুমের অধিকার প্রতিষ্ঠা করেন।",
    "quranReference": "সূরা আলে ইমরান ৩:১৮, সূরা আল-আম্বিয়া ২১:৪৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/muqsit.mp3"
  },
  {
    "number": 87,
    "arabic": "الْجَامِعُ",
    "transliteration": "Al-Jaami’",
    "nameBn": "আল-জামি",
    "meaningEn": "The Assembler of Scattered Creations",
    "meaningBn": "একত্রকারী ও সমাবেশকারী",
    "detailsEn": "The Gatherer, The One who gathers the creatures on a day that there is no doubt about, that is the Day of Judgment.",
    "detailsBn": "যিনি বিচার দিবসে সকল যুগের সমগ্র মানুষকে একক ময়দানে একত্রিত করবেন।",
    "quranReference": "সূরা আলে ইমরান ৩:৯, সূরা আন-নিসা ৪:১৪০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/jami.mp3"
  },
  {
    "number": 88,
    "arabic": "الْغَنِيُّ",
    "transliteration": "Al-Ghaniyy",
    "nameBn": "আল-গানীয়্য",
    "meaningEn": "The Self-Sufficient One",
    "meaningBn": "পরম প্রাচুর্যময় ও স্বয়ংসম্পূর্ণ",
    "detailsEn": "The One who does not need the creation.",
    "detailsBn": "যিনি সম্পূর্ণ অমুখাপেক্ষী এবং সমগ্র সৃষ্টি সদা যাঁর প্রতি মুখাপেক্ষী।",
    "quranReference": "সূরা আল-আনআম ৬:১৩৩, সূরা আল-ইমরান ৩:৯৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/ghaniy.mp3"
  },
  {
    "number": 89,
    "arabic": "الْمُغْنِي",
    "transliteration": "Al-Mughni",
    "nameBn": "আল-মুগনী",
    "meaningEn": "The Bestower of Sufficiency",
    "meaningBn": "সমৃদ্ধিদাতা ও অভাব দূরকারী",
    "detailsEn": "The Enricher, The One who satisfies the necessities of the creatures.",
    "detailsBn": "যিনি যাকে ইচ্ছা বিপুল প্রাচুর্য, সম্পদ ও মনের তৃপ্তি দান করেন।",
    "quranReference": "সূরা আদ-দুহা ৯৩:৮, সূরা আন-নাজম ৫৩:৪৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mughni.mp3"
  },
  {
    "number": 90,
    "arabic": "اَلْمَانِعُ",
    "transliteration": "Al-Maani’",
    "nameBn": "আল-মানি",
    "meaningEn": "The Preventer",
    "meaningBn": "প্রতিহতকারী ও বাধাদানকারী",
    "detailsEn": "The Withholder.",
    "detailsBn": "যিনি প্রজ্ঞাবলে যা চান তা রক্ষা করেন এবং যাকে ইচ্ছা বিপদ থেকে বাঁচান।",
    "quranReference": "সূরা আল-মুলক ৬৭:২১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/mani.mp3"
  },
  {
    "number": 91,
    "arabic": "الضَّارَّ",
    "transliteration": "Ad-Daarr",
    "nameBn": "আদ-দার্র",
    "meaningEn": "The Distressor",
    "meaningBn": "ক্ষতি ও পরীক্ষার মালিক",
    "detailsEn": "The One who makes harm reach to whoever He willed and benefit to whoever He willed.",
    "detailsBn": "যাঁর অনুমতি ব্যতিরেকে কোনো বিপদ স্পর্শ করতে পারে না এবং যিনি পরীক্ষাস্বরূপ কষ্ট দেন।",
    "quranReference": "সূরা আল-আনআম ৬:১৭, সূরা ইউনুস ১০:১০৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/darr.mp3"
  },
  {
    "number": 92,
    "arabic": "النَّافِعُ",
    "transliteration": "An-Naafi’",
    "nameBn": "আন-নাফি",
    "meaningEn": "The Bestower of Benefits",
    "meaningBn": "পরম কল্যাণকারী",
    "detailsEn": "The Propitious, The One who makes harm reach to whoever He willed and benefit to whoever He willed.",
    "detailsBn": "সকল উপকার ও মঙ্গলের একমাত্র উৎস; যাঁর ইচ্ছায় বান্দা লাভবান হয়।",
    "quranReference": "সূরা আল-ফাতহ ৪৮:১১, সূরা ইউনুস ১০:১০৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/nafi.mp3"
  },
  {
    "number": 93,
    "arabic": "النُّورُ",
    "transliteration": "An-Noor",
    "nameBn": "আন-নূর",
    "meaningEn": "The Prime Light",
    "meaningBn": "পরম আলো ও পথপ্রদর্শক",
    "detailsEn": "The Light, The One who guides.",
    "detailsBn": "যিনি আসমান ও জমিনের জ্যোতি এবং যাঁর আলোয় সকল অন্ধকার দূর হয়।",
    "quranReference": "সূরা আন-নূর ২৪:৩৫",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/nur.mp3"
  },
  {
    "number": 94,
    "arabic": "الْهَادِي",
    "transliteration": "Al-Haadi",
    "nameBn": "আল-হাদী",
    "meaningEn": "The Provider of Guidance",
    "meaningBn": "সঠিক পথপ্রদর্শক",
    "detailsEn": "The Guide, The One whom with His Guidance His believers were guided, and with His Guidance the living beings have been guided to what is beneficial for them and protected from what is harmful to them.",
    "detailsBn": "যিনি মানবজাতিকে সরল-সঠিক হেদায়েতের পথে পরিচালিত করেন।",
    "quranReference": "সূরা আল-হাজ্জ ২২:৫৪, সূরা আল-ফুরকান ২৫:৩১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/hadi.mp3"
  },
  {
    "number": 95,
    "arabic": "الْبَدِيعُ",
    "transliteration": "Al-Badi’",
    "nameBn": "আল-বাদী",
    "meaningEn": "The Unique One",
    "meaningBn": "অনুপম ও অপূর্ব স্রষ্টা",
    "detailsEn": "The Incomparable, The One who created the creation and formed it without any preceding example.",
    "detailsBn": "যিনি কোনো পূর্ব নিদর্শন ছাড়াই অপূর্ব সুন্দর সৃষ্টিজগত উদ্ভাবন করেছেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:১১৭, সূরা আল-আনআম ৬:১০১",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/badi.mp3"
  },
  {
    "number": 96,
    "arabic": "اَلْبَاقِي",
    "transliteration": "Al-Baaqi",
    "nameBn": "আল-বাক্বী",
    "meaningEn": "The Ever Surviving One",
    "meaningBn": "চিরন্তন ও অবিনশ্বর",
    "detailsEn": "The Everlasting, The One that the state of non-existence is impossible for Him.",
    "detailsBn": "সকল সৃষ্টির ধ্বংস সাধনের পরও যিনি চিরকাল টিকে থাকবেন।",
    "quranReference": "সূরা আর-রহমান ৫৫:২৭, সূরা আল-ক্বাসাস ২৮:৮৮",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/baqi.mp3"
  },
  {
    "number": 97,
    "arabic": "الْوَارِثُ",
    "transliteration": "Al-Waaris",
    "nameBn": "আল-ওয়ারিছ",
    "meaningEn": "The Eternal Inheritor",
    "meaningBn": "সকল কিছুর চূড়ান্ত উত্তরাধিকারী",
    "detailsEn": "The Heir, The One whose Existence remains.",
    "detailsBn": "সমগ্র সৃষ্টিজগৎ লয় প্রাপ্ত হওয়ার পর যাঁর হাতে সবকিছু ফিরে আসবে।",
    "quranReference": "সূরা আল-হিজর ১৫:২৩, সূরা আল-আম্বিয়া ২১:৮৯",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/warith.mp3"
  },
  {
    "number": 98,
    "arabic": "الرَّشِيدُ",
    "transliteration": "Ar-Rasheed",
    "nameBn": "আর-রাশীদ",
    "meaningEn": "The Guide to Path of Rectitude",
    "meaningBn": "সত্য পথের সুপথপ্রদর্শক",
    "detailsEn": "The Guide to the Right Path, The One who guides.",
    "detailsBn": "যিনি নিখুঁত পরিকল্পনা ও সঠিক নির্দেশনার মাধ্যমে সবকিছু পরিচালনা করেন।",
    "quranReference": "সূরা আল-কাহফ ১৮:১০, সূরা হূদ ১১:৮৭",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/rashid.mp3"
  },
  {
    "number": 99,
    "arabic": "الصَّبُورُ",
    "transliteration": "As-Saboor",
    "nameBn": "আস-সবূর",
    "meaningEn": "The Extensively Enduring One",
    "meaningBn": "পরম ধৈর্যশীল",
    "detailsEn": "The Patient, The One who does not quickly punish the sinners.",
    "detailsBn": "যিনি অবাধ্যতার পরও তৎক্ষণাৎ পাকড়াও করেন না এবং অফুরন্ত ধৈর্য ধারণ করেন।",
    "quranReference": "সূরা আল-বাক্বারাহ ২:১৫৩, সূরা আলে ইমরান ৩:২০০",
    "audioUrl": "https://raw.githubusercontent.com/MohammedAbidNafi/99-Names-of-Allah/master/app/src/main/res/raw/sabur.mp3"
  }
];
const RUQYAH_CATEGORIES = [
  {
    "id": "all",
    "nameBn": "সব রুকইয়াহ",
    "icon": "🛡️"
  },
  {
    "id": "shifa",
    "nameBn": "রোগমুক্তি ও আরোগ্য",
    "icon": "🌿"
  },
  {
    "id": "nazar",
    "nameBn": "বদনজর ও কুদৃষ্টি",
    "icon": "👁️"
  },
  {
    "id": "sihr",
    "nameBn": "জাদু-টোনা ও জিন",
    "icon": "✨"
  },
  {
    "id": "anxiety",
    "nameBn": "মানসিক শান্তি ও ভয়",
    "icon": "🕊️"
  },
  {
    "id": "daily",
    "nameBn": "দৈনিক সুরক্ষা",
    "icon": "⭐"
  }
];
const RUQYAH_ITEMS = [
  {
    "id": "fatihah",
    "category": "shifa",
    "titleBn": "সূরা আল-ফাতিহা (শিফা)",
    "arabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
    "pronunciationBn": "বিসমিল্লাহির রাহমানির রাহিম...",
    "translationBn": "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু। যাবতীয় প্রশংসা আল্লাহর জন্য যিনি সকল সৃষ্টির রব...",
    "reference": "সূরা আল-ফাতিহা (১:১-৭) ও সহীহ বুখারী ৫৭৩৬",
    "targetCount": 7
  },
  {
    "id": "ayatul-kursi",
    "category": "daily",
    "titleBn": "আয়াতুল কুরসী (সর্বশ্রেষ্ঠ আয়াত)",
    "arabic": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    "pronunciationBn": "আল্লাহু লা ইলাহা ইল্লা হুয়াল হাইয়্যুল ক্বাইয়্যুম...",
    "translationBn": "আল্লাহ, তিনি ছাড়া কোনো সত্য উপাস্য নেই, তিনি চিরঞ্জীব, সর্বসত্তার ধারক...",
    "reference": "সূরা আল-বাকারা (২:২৫৫) ও সহীহ বুখারী ২৩১১",
    "targetCount": 3
  },
  {
    "id": "baqarah-last-2",
    "category": "daily",
    "titleBn": "সূরা আল-বাকারার শেষ দুই আয়াত",
    "arabic": "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ",
    "pronunciationBn": "আ-মানার রাসূলু বিমা- উনঝিলা ইলাইহি মির রাব্বিহি ওয়াল মুমিনূন...",
    "translationBn": "রাসূল তাঁর রবের পক্ষ থেকে যা নাযিল হয়েছে তার ওপর ঈমান এনেছেন এবং মুমিনগণও...",
    "reference": "সূরা আল-বাকারা (২:২৮৫-২৮৬) ও সহীহ বুখারী ৫০৪০",
    "targetCount": 1
  },
  {
    "id": "ikhlas-falaq-nas",
    "category": "nazar",
    "titleBn": "সূরা ইখলাস, ফালাক ও নাস (মুআউবিযাত)",
    "arabic": "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ...\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ...",
    "pronunciationBn": "কুল হুওয়াল্লাহু আহাদ... কুল আউযু বিরাব্বিল ফালাক... কুল আউযু বিরাব্বিন নাস...",
    "translationBn": "বলুন: তিনিই আল্লাহ, এক-অদ্বিতীয়। আল্লাহ অমুখাপেক্ষী... বলুন: আমি আশ্রয় প্রার্থনা করছি ভোরের রবের নিকট... বলুন: আমি আশ্রয় প্রার্থনা করছি মানুষের রবের নিকট...",
    "reference": "সূরা ১১২, ১১৩, ১১৪ ও তিরমিজি ২০৫৮",
    "targetCount": 3
  },
  {
    "id": "yunus-dua",
    "category": "anxiety",
    "titleBn": "দুআয়ে ইউনুস (বিপদ ও দুশ্চিন্তা মুক্তি)",
    "arabic": "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    "pronunciationBn": "লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নি কুনতু মিনায যালিমীন।",
    "translationBn": "আপনি ছাড়া কোনো সত্য উপাস্য নেই, আপনি পরম পবিত্র, নিশ্চয়ই আমি জালিমদের অন্তর্ভুক্ত ছিলাম।",
    "reference": "সূরা আল-আম্বিয়া (২১:৮৭) ও তিরমিজি ৩৫০৫",
    "targetCount": 100
  }
];
const HADITH_DATA = [
  {
    "book": "সহীহ বুখারী",
    "number": 1,
    "chapter": "ওহীর সূচনা",
    "arabic": "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    "bengali": "নিশ্চয়ই সমস্ত কাজ নিয়তের ওপর নির্ভরশীল এবং প্রত্যেক ব্যক্তি যা নিয়ত করেছে তাই পাবে।",
    "narrator": "উমর ইবনুল খাত্তাব (রা.)",
    "grade": "সহীহ"
  },
  {
    "book": "সহীহ বুখারী",
    "number": 5027,
    "chapter": "কুরআনের ফযীলত",
    "arabic": "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    "bengali": "তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে স্বয়ং কুরআন শিখে এবং অন্যকে তা শিক্ষা দেয়।",
    "narrator": "উসমান ইবন আফফান (রা.)",
    "grade": "সহীহ"
  },
  {
    "book": "সহীহ মুসলিম",
    "number": 223,
    "chapter": "পবিত্রতা",
    "arabic": "الطُّهُورُ شَطْرُ الإِيمَانِ",
    "bengali": "পবিত্রতা ঈমানের অর্ধেক। আলহামদুলিল্লাহ দাঁড়িপাল্লা পূর্ণ করে দেয়।",
    "narrator": "আবু মালিক আল-আশআরী (রা.)",
    "grade": "সহীহ"
  },
  {
    "book": "সুনান আত-তিরমিজি",
    "number": 2516,
    "chapter": "কিয়ামতের বিবরণ ও চরিত্র",
    "arabic": "احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ",
    "bengali": "তুমি আল্লাহকে হিফাজত কর (তাঁর বিধান মেনে চল), আল্লাহ তোমাকে হিফাজত করবেন। তুমি আল্লাহকে তোমার সম্মুখে পাবে।",
    "narrator": "ইবনে আব্বাস (রা.)",
    "grade": "সহীহ"
  },
  {
    "book": "সুনান আবু দাউদ",
    "number": 4811,
    "chapter": "সদাচার",
    "arabic": "مَنْ لاَ يَشْكُرُ النَّاسَ لاَ يَشْكُرُ اللَّهَ",
    "bengali": "যে ব্যক্তি মানুষের কৃতজ্ঞতা প্রকাশ করে না, সে আল্লাহরও কৃতজ্ঞতা প্রকাশ করে না।",
    "narrator": "আবু হুরায়রা (রা.)",
    "grade": "সহীহ"
  }
];
const ISLAMIC_EVENTS = [
  {
    "day": 1,
    "month": 1,
    "monthName": "মুহাররম",
    "event": "হিজরি নববর্ষ (ইসলামিক নতুন বছর)"
  },
  {
    "day": 10,
    "month": 1,
    "monthName": "মুহাররম",
    "event": "পবিত্র আশুরা (রোজার দিন)"
  },
  {
    "day": 12,
    "month": 3,
    "monthName": "রবিউল আউয়াল",
    "event": "ঈদে মিলাদুন্নবী (সা.)"
  },
  {
    "day": 27,
    "month": 7,
    "monthName": "রজব",
    "event": "পবিত্র শবে মিরাজ"
  },
  {
    "day": 15,
    "month": 8,
    "monthName": "শাবান",
    "event": "পবিত্র শবে বরাত (লাইলাতুল বরাত)"
  },
  {
    "day": 1,
    "month": 9,
    "monthName": "রমজান",
    "event": "পবিত্র মাহে রমজান শুরু (ফরজ রোজা)"
  },
  {
    "day": 27,
    "month": 9,
    "monthName": "রমজান",
    "event": "পবিত্র শবে কদর (লাইলাতুল কদর)"
  },
  {
    "day": 1,
    "month": 10,
    "monthName": "শাওয়াল",
    "event": "পবিত্র ঈদুল ফিতর"
  },
  {
    "day": 9,
    "month": 12,
    "monthName": "জিলহজ্জ",
    "event": "পবিত্র হজ্ব ও আরাফার দিন"
  },
  {
    "day": 10,
    "month": 12,
    "monthName": "জিলহজ্জ",
    "event": "পবিত্র ঈদুল আজহা (কোরবানি)"
  }
];
