import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CANONICAL_BOOKS,
  CanonicalBook,
  CanonicalHadithItem,
  HADITH_CATEGORIES,
  Hadith,
  HadithCategory,
  HadithChapter,
} from '../models/hadith';
import { StorageService } from './storage';

const STORAGE_KEYS = {
  bookmarks: 'alquran.hadith_bookmarks',
  canonicalBookmarks: 'alquran.canonical_hadith_bookmarks',
  dailyDismissed: 'alquran.daily_hadith_dismissed',
} as const;

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

/**
 * Authentic Hadiths collection across core Islamic themes:
 * Sahih al-Bukhari, Sahih Muslim, Riyad as-Salihin, Imam Nawawi's 40 Hadiths.
 * Each narration includes the authentic companion attribution and prophet statement (সনদ ও মতন).
 */
export const HADITH_DATASET: readonly Hadith[] = [
  {
    id: 1,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 1,
    chapterEn: 'Revelation',
    chapterBn: 'ওহীর সূচনা',
    narratorEn: 'Umar ibn al-Khattab (RA)',
    narratorBn: 'হযরত উমর ইবনুল খাত্তাব (রা.)',
    arabic: 'عَنْ أَمِيرِ الْمُؤْمِنِينَ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    bangla: 'হযরত উমর ইবনুল খাত্তাব (রা.) হতে বর্ণিত। তিনি বলেন, আমি রাসূলুল্লাহ (সা.)-কে বলতে শুনেছিঃ নিশ্চয়ই সমস্ত কাজের ফলাফল নিয়তের (উদ্দেশ্যের) ওপর নির্ভরশীল। আর প্রত্যেক ব্যক্তি তার নিয়ত অনুযায়ী প্রতিফল পাবে।',
    english: 'Narrated Umar ibn al-Khattab (RA): I heard Allah\'s Messenger (ﷺ) saying: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'iman',
  },
  {
    id: 2,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 223,
    chapterEn: 'Purification',
    chapterBn: 'পবিত্রতা',
    narratorEn: 'Abu Malik al-Ash\'ari (RA)',
    narratorBn: 'হযরত আবু মালিক আল-আশআরী (রা.)',
    arabic: 'عَنْ أَبِي مَالِكٍ الأَشْعَرِيِّ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
    bangla: 'হযরত আবু মালিক আল-আশআরী (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ পবিত্রতা ঈমানের অর্ধেক, আর ‘আলহামদুলিল্লাহ’ আমলের পাল্লাকে পূর্ণ করে দেয়।',
    english: 'Narrated Abu Malik al-Ash\'ari (RA): The Messenger of Allah (ﷺ) said: "Purity is half of faith and \'Alhamdulillah\' fills the scale."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'salah',
  },
  {
    id: 3,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 13,
    chapterEn: 'Faith',
    chapterBn: 'ঈমান',
    narratorEn: 'Anas ibn Malik (RA)',
    narratorBn: 'হযরত আনাস ইবনে মালিক (রা.)',
    arabic: 'عَنْ أَنَسٍ عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ: لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    bangla: 'হযরত আনাস ইবনে মালিক (রা.) হতে বর্ণিত। নবী করীম (সা.) বলেছেনঃ তোমাদের কেউ প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করে যা নিজের জন্য পছন্দ করে।',
    english: 'Narrated Anas (RA): The Prophet (ﷺ) said: "None of you will believe until you love for your brother what you love for yourself."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'iman',
  },
  {
    id: 4,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 1162,
    chapterEn: 'Suckling',
    chapterBn: 'সদাচরণ ও চরিত্র',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ মুমিনদের মধ্যে ঈমানের দিক থেকে সবচেয়ে পূর্ণাঙ্গ ব্যক্তি সে, যার চরিত্র সবচেয়ে সুন্দর।',
    english: 'Narrated Abu Hurairah (RA): The Messenger of Allah (ﷺ) said: "The most complete of the believers in faith is the one who has the best character."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 5,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 8,
    chapterEn: 'Faith',
    chapterBn: 'ইসলামের ভিত্তি',
    narratorEn: 'Abdullah ibn Umar (RA)',
    narratorBn: 'হযরত আব্দুল্লাহ ইবনে উমর (রা.)',
    arabic: 'عَنِ ابْنِ عُمَرَ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ',
    bangla: 'হযরত আব্দুল্লাহ ইবনে উমর (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ ইসলামের ভিত্তি পাঁচটি জিনিসের ওপর স্থাপিত—এ সাক্ষ্য দেওয়া যে আল্লাহ ছাড়া কোনো সত্য ইলাহ নেই এবং মুহাম্মদ (সা.) তাঁর বান্দা ও রাসূল; সালাত কায়েম করা; যাকাত আদায় করা; হজ পালন করা এবং রমজানের রোজা রাখা।',
    english: 'Narrated Ibn Umar (RA): Allah\'s Messenger (ﷺ) said: Islam is based on five principles: To testify that none has the right to be worshipped but Allah and Muhammad is Allah\'s Messenger, to establish prayers, to pay Zakat, to perform Hajj, and to observe fast during Ramadan.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'iman',
  },
  {
    id: 6,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 35,
    chapterEn: 'Faith',
    chapterBn: 'লজ্জাশীলতা',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ: وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। নবী করীম (সা.) বলেছেনঃ লজ্জা ও শালীনতা ঈমানের একটি বিশেষ শাখা।',
    english: 'Narrated Abu Hurairah (RA): The Prophet (ﷺ) said: "Modesty is a branch of faith."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 7,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6018,
    chapterEn: 'Good Manners',
    chapterBn: 'উত্তম কথা ও আচরণ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم قَالَ: مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। আল্লাহর রাসূল (সা.) বলেছেনঃ যে ব্যক্তি আল্লাহ ও পরকালের প্রতি ঈমান রাখে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।',
    english: 'Narrated Abu Hurairah (RA): Allah\'s Messenger (ﷺ) said: "Whoever believes in Allah and the Last Day should speak good or remain silent."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 8,
    book: 'Sunan Abi Dawud',
    bookBn: 'সুনান আবু দাউদ',
    hadithNumber: 864,
    chapterEn: 'Prayer',
    chapterBn: 'সালাতের হিসাব',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلاَتُهُ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ কিয়ামতের দিন বান্দার আমলসমূহের মধ্যে সর্বপ্রথম সালাত বা নামাজের হিসাব নেওয়া হবে।',
    english: 'Narrated Abu Hurairah (RA): I heard the Messenger of Allah (ﷺ) say: "The first of his deeds for which a person will be called to account on the Day of Resurrection is his prayer."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'salah',
  },
  {
    id: 9,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 1956,
    chapterEn: 'Righteousness',
    chapterBn: 'মুচকি হাসি সদকা',
    narratorEn: 'Abu Dharr (RA)',
    narratorBn: 'হযরত আবু যর (রা.)',
    arabic: 'عَنْ أَبِي ذَرٍّ قَالَ: قَالَ لِي رَسُولُ اللَّهِ صلى الله عليه وسلم: تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    bangla: 'হযরত আবু যর (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) আমাকে বলেছেনঃ তোমার ভাইয়ের মুখের দিকে তাকিয়ে মুচকি হাসাও তোমার জন্য একটি সদকা।',
    english: 'Narrated Abu Dharr (RA): The Messenger of Allah (ﷺ) said to me: "Your smiling in the face of your brother is charity for you."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'charity',
  },
  {
    id: 10,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2664,
    chapterEn: 'Destiny',
    chapterBn: 'মুমিনের শক্তি',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ وَفِي كُلٍّ خَيْرٌ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। রাসূলুল্লাহ (সা.) বলেছেনঃ শক্তিশালী মুমিন দুর্বল মুমিনের চেয়ে আল্লাহর নিকট অধিক উত্তম ও প্রিয়; তবে উভয়ের মধ্যেই কল্যাণ রয়েছে।',
    english: 'Narrated Abu Hurairah (RA): The Messenger of Allah (ﷺ) said: "A strong believer is better and is more lovable to Allah than a weak believer, and there is good in everyone."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'iman',
  },
  {
    id: 11,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 1894,
    chapterEn: 'Fasting',
    chapterBn: 'রোজার মর্যাদা',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: الصِّيَامُ جُنَّةٌ فَلاَ يَرْفُثْ وَلاَ يَجْهَلْ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। রাসূলুল্লাহ (সা.) বলেছেনঃ রোজা হলো (পাপ ও জাহান্নাম থেকে বাঁচার) ঢালস্বরূপ। অতএব রোজাদার যেন অশ্লীল কথা না বলে এবং জাহেলী আচরণ না করে।',
    english: 'Narrated Abu Hurairah (RA): Allah\'s Messenger (ﷺ) said: "Fasting is a shield or protection from the fire and from committing sins. If one of you is fasting, he should avoid sexual relation and quarreling."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'fasting',
  },
  {
    id: 12,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6307,
    chapterEn: 'Invocations',
    chapterBn: 'ক্ষমা প্রার্থনা ও তওবা',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ আল্লাহর কসম! আমি প্রতিদিন সত্তর বারেরও বেশি আল্লাহর দরবারে ক্ষমা প্রার্থনা করি এবং তওবা করি।',
    english: 'Narrated Abu Hurairah (RA): I heard Allah\'s Messenger (ﷺ) saying: "By Allah! I ask for forgiveness from Allah and turn to Him in repentance more than seventy times a day."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'dua',
  },
  {
    id: 13,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 71,
    chapterEn: 'Knowledge',
    chapterBn: 'দ্বীনের সঠিক জ্ঞান',
    narratorEn: 'Muawiyah (RA)',
    narratorBn: 'হযরত মুয়াবিয়া (রা.)',
    arabic: 'عَنْ مُعَاوِيَةَ خَطِيبًا يَقُولُ: سَمِعْتُ النَّبِيَّ صلى الله عليه وسلم يَقُولُ: مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
    bangla: 'হযরত মুয়াবিয়া (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ আল্লাহ যার মঙ্গল চান, তাকে দ্বীনের সঠিক বুঝ ও প্রজ্ঞা দান করেন।',
    english: 'Narrated Muawiyah (RA): I heard Allah\'s Messenger (ﷺ) saying: "If Allah wants to do good to a person, He makes him comprehend the religion."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'knowledge',
  },
  {
    id: 14,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 55,
    chapterEn: 'Faith',
    chapterBn: 'দ্বীন আন্তরিক নসীহত',
    narratorEn: 'Tamim ad-Dari (RA)',
    narratorBn: 'হযরত তামীম আদ-দারী (রা.)',
    arabic: 'عَنْ تَمِيمٍ الدَّارِيِّ أَنَّ النَّبِيَّ صلى الله عليه وسلم قَالَ: الدِّينُ النَّصِيحَةُ، قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ',
    bangla: 'হযরত তামীম আদ-দারী (রা.) হতে বর্ণিত। নবী করীম (সা.) বলেছেনঃ দ্বীন হলো আন্তরিক শুভকামনা (নসীহত)। আমরা জিজ্ঞেস করলাম, কার জন্য? তিনি বললেনঃ আল্লাহর জন্য, তাঁর কিতাবের জন্য, তাঁর রাসূলের জন্য, এবং মুসলিমদের নেতা ও সাধারণ মানুষের জন্য।',
    english: 'Narrated Tamim ad-Dari (RA): The Prophet (ﷺ) said: "Religion is sincerity." We said: "To whom?" He said: "To Allah, to His Book, to His Messenger, and to the leaders of the Muslims and their common folk."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'nawawi40',
  },
  {
    id: 15,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 2518,
    chapterEn: 'Resurrection',
    chapterBn: 'সন্দেহ বর্জন',
    narratorEn: 'Hasan ibn Ali (RA)',
    narratorBn: 'হযরত হাসান ইবনে আলী (রা.)',
    arabic: 'عَنِ الْحَسَنِ بْنِ عَلِيٍّ قَالَ: حَفِظْتُ مِنْ رَسُولِ اللَّهِ صلى الله عليه وسلم: دَعْ مَا يَرِيبُكَ إِلَى مَا لاَ يَرِيبُكَ',
    bangla: 'হযরত হাসান ইবনে আলী (রা.) হতে বর্ণিত। তিনি বলেন, আমি রাসূলুল্লাহ (সা.)-এর কাছ থেকে মুখস্থ রেখেছি—যা তোমাকে সন্দেহে ফেলে তা ছেড়ে দাও এবং যা সন্দেহে ফেলে না তা গ্রহণ করো।',
    english: 'Narrated Hasan ibn Ali (RA): I memorized from the Messenger of Allah (ﷺ): "Leave that which makes you doubt for that which does not make you doubt."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'nawawi40',
  },
  {
    id: 16,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2593,
    chapterEn: 'Virtue',
    chapterBn: 'নম্রতা ও কোমলতা',
    narratorEn: 'Aisha (RA)',
    narratorBn: 'হযরত আয়েশা (রা.)',
    arabic: 'عَنْ عَائِشَةَ زَوْجِ النَّبِيِّ صلى الله عليه وسلم عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ: إِنَّ الرِّفْقَ لاَ يَكُونُ فِي شَيْءٍ إِلاَّ زَانَهُ وَلاَ يُنْزَعُ مِنْ شَيْءٍ إِلاَّ شَانَهُ',
    bangla: 'হযরত আয়েশা (রা.) হতে বর্ণিত। নবী করীম (সা.) বলেছেনঃ নম্রতা যে জিনিসেই থাকে তা তাকে সুন্দর করে দেয়, আর যে জিনিস থেকে তা কেড়ে নেওয়া হয় তা তাকে ত্রুটিযুক্ত করে।',
    english: 'Narrated Aisha (RA): The Prophet (ﷺ) said: "Kindness is not found in anything except that it beautifies it, and it is not removed from anything except that it makes it defective."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 17,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 52,
    chapterEn: 'Belief',
    chapterBn: 'অন্তর বা কলব শুদ্ধি',
    narratorEn: 'Nu\'man ibn Bashir (RA)',
    narratorBn: 'হযরত নুমান ইবনে বশীর (রা.)',
    arabic: 'عَنِ النُّعْمَانِ بْنِ بَشِيرٍ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: أَلاَ وَإِنَّ فِي الْجَسَدِ مُضْغَةً إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلاَ وَهِيَ الْقَلْبُ',
    bangla: 'হযরত নুমান ইবনে বশীর (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ জেনে রেখো, শরীরের মধ্যে একটি মাংসের টুকরো আছে; তা যখন শুদ্ধ হয় তখন পুরো শরীর শুদ্ধ থাকে, আর তা যখন কলুষিত হয় পুরো শরীর কলুষিত হয়ে যায়। জেনে রেখো, তা হলো অন্তর (কলব)।',
    english: 'Narrated Nu\'man ibn Bashir (RA): I heard Allah\'s Messenger (ﷺ) saying: "Beware! There is a piece of flesh in the body if it becomes good the whole body becomes good but if it gets spoilt the whole body gets spoilt and that is the heart."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 18,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2319,
    chapterEn: 'Virtues',
    chapterBn: 'দয়া ও সহানুভূতি',
    narratorEn: 'Jarir ibn Abdullah (RA)',
    narratorBn: 'হযরত জারির ইবনে আব্দুল্লাহ (রা.)',
    arabic: 'عَنْ جَرِيرِ بْنِ عَبْدِ اللَّهِ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: مَنْ لاَ يَرْحَمِ النَّاسَ لاَ يَرْحَمْهُ اللَّهُ',
    bangla: 'হযরত জারির ইবনে আব্দুল্লাহ (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ যে ব্যক্তি মানুষের প্রতি দয়া করে না, আল্লাহও তার প্রতি দয়া করেন না।',
    english: 'Narrated Jarir ibn Abdullah (RA): Allah\'s Messenger (ﷺ) said: "He who is not merciful to people, Allah will not be merciful to him."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 19,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6116,
    chapterEn: 'Good Manners',
    chapterBn: 'ক্রোধ সংবরণ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ أَنَّ رَجُلاً قَالَ لِلنَّبِيِّ صلى الله عليه وسلم: أَوْصِنِي. قَالَ: لاَ تَغْضَبْ. فَرَدَّدَ مِرَارًا، قَالَ: لاَ تَغْضَبْ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। এক ব্যক্তি নবীজি (সা.)-কে বলল, আমাকে কিছু উপদেশ দিন। নবীজি বললেনঃ রাগ করবে না। লোকটি বারবার একই প্রশ্ন করল, নবীজি প্রতিবারই বললেনঃ রাগ করবে না।',
    english: 'Narrated Abu Hurairah (RA): A man said to the Prophet (ﷺ), "Advise me!" The Prophet said, "Do not become angry and furious." The man asked (the same) again and again, and the Prophet said in each case, "Do not become angry and furious."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 20,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 2646,
    chapterEn: 'Knowledge',
    chapterBn: 'জ্ঞানার্জনের পথ জান্নাতের পথ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    bangla: 'হযরত আবু হুরায়রা (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ যে ব্যক্তি জ্ঞান অর্জনের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।',
    english: 'Narrated Abu Hurairah (RA): The Messenger of Allah (ﷺ) said: "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'knowledge',
  },
  {
    id: 21,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6412,
    chapterEn: 'To Make the Heart Tender',
    chapterBn: 'স্বাস্থ্য ও অবসর সময়',
    narratorEn: 'Ibn Abbas (RA)',
    narratorBn: 'হযরত আব্দুল্লাহ ইবনে আব্বাস (রা.)',
    arabic: 'عَنِ ابْنِ عَبَّاسٍ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: قَالَ النَّبِيُّ صلى الله عليه وسلم: نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ',
    bangla: 'হযরত আব্দুল্লাহ ইবনে আব্বাস (রা.) হতে বর্ণিত। তিনি বলেন, রাসূলুল্লাহ (সা.) বলেছেনঃ দুটি নেয়ামতের বিষয়ে অধিকাংশ মানুষ উদাসীন ও ক্ষতিগ্রস্ত—সুস্বাস্থ্য এবং অবসর সময়।',
    english: 'Narrated Ibn Abbas (RA): The Prophet (ﷺ) said: "There are two blessings which many people lose: (They are) health and free time for doing good."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 22,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 1410,
    chapterEn: 'Zakat',
    chapterBn: 'সদকার মহত্ব',
    narratorEn: 'Adi ibn Hatim (RA)',
    narratorBn: 'হযরত আদী ইবনে হাতিম (রা.)',
    arabic: 'عَنْ عَدِيِّ بْنِ حَاتِمٍ قَالَ: سَمِعْتُ النَّبِيَّ صلى الله عليه وسلم يَقُولُ: اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ',
    bangla: 'হযরত আদী ইবনে হাতিম (রা.) হতে বর্ণিত। তিনি বলেন, আমি নবী করীম (সা.)-কে বলতে শুনেছিঃ তোমরা এক টুকরো খেজুরের মাধ্যমে হলেও জাহান্নামের আগুন থেকে বাঁচার চেষ্টা করো।',
    english: 'Narrated Adi ibn Hatim (RA): I heard the Prophet (ﷺ) saying: "Save yourself from Hell-fire even by giving half a date-fruit in charity."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'charity',
  },
];

/**
 * Natural Bengali chapter translations for canonical book chapters.
 */
const CHAPTER_NAME_BN_MAP: Record<string, string> = {
  'Revelation': 'ওহীর সূচনা',
  'Belief': 'ঈমান ও বিশ্বাস',
  'Knowledge': 'জ্ঞান ও শিক্ষা',
  'Ablutions (Wudu\')': 'পবিত্রতা ও ওজু',
  'Bathing (Ghusl)': 'গোসল',
  'Menstrual Periods': 'ঋতুস্রাব (হায়েজ)',
  'Rubbing hands and feet with dust (Tayammum)': 'তায়াম্মুম',
  'Prayers (Salat)': 'সালাত / নামাজ',
  'Times of the Prayers': 'সালাতের ওয়াক্ত',
  'Call to Prayers (Adhaan)': 'আজান',
  'Friday Prayer': 'জুমুআর সালাত',
  'Fear Prayer': 'ভয়ের সালাত',
  'The Two Festivals (Eids)': 'দুই ঈদ',
  'Witr Prayer': 'বিতর সালাত',
  'Invocation for Rain (Istisqaa)': 'বৃষ্টির প্রার্থনা (ইস্তিসকা)',
  'Eclipses': 'সূর্যগ্রহণ ও চন্দ্রগ্রহণ',
  'Prostration During Recital of Qur\'an': 'তিলাওয়াত সাজদাহ',
  'Shortening the Prayers (At-Taqseer)': 'সালাত কসর করা',
  'Prayer at Night (Tahajjud)': 'তাহাজ্জুদ সালাত',
  'Funerals (Al-Janaa\'iz)': 'জানাযা ও দাফন',
  'Zakat': 'যাকাত',
  'Obligatory Charity Tax After Ramadan (Zakat ul Fitr)': 'সদকাতুল ফিতর',
  'Hajj (Pilgrimage)': 'হজ',
  'Umrah (Minor pilgrimage)': 'উমরাহ',
  'Fasting': 'সিয়াম ও রোজা',
  'Tarawih': 'তারাবীহ সালাত',
  'Retiring to a Mosque for Remembrance of Allah (I\'tikaf)': 'ইতিকাফ',
  'Sales and Trade': 'ক্রয়-বিক্রয় ও ব্যবসা',
  'Partnership': 'অংশীদারি ব্যবসা',
  'Mortgaging': 'বন্ধক রাখা',
  'Manumission of Slaves': 'দাসমুক্তি',
  'Gifts': 'দান ও উপহার',
  'Witnesses': 'সাক্ষ্য প্রদান',
  'Peacemaking': 'আপোষ-মীমাংসা',
  'Conditions': 'চুক্তি ও শর্তাবলী',
  'Wills and Testaments (Wasaayaa)': 'ওসিয়তনামা',
  'Fighting for the Cause of Allah (Jihaad)': 'জিহাদ',
  'One-fifth of Booty to the Cause of Allah (Khumus)': 'গণিমত ও খুমুস',
  'Jizyah and Mawaada\'ah': 'জিজিয়া ও নিরাপত্তা',
  'Beginning of Creation': 'সৃষ্টির সূচনা',
  'Prophets': 'নবীগণের বিবরণ',
  'Virtues and Merits of the Prophet (pbuh) and his Companions': 'নবীজি ও সাহাবীগণের মর্যাদা',
  'Companions of the Prophet': 'সাহাবীগণের মর্যাদা',
  'Wedlock, Marriage (Nikaah)': 'বিয়ে ও দাম্পত্য',
  'Divorce': 'তালাক',
  'Supporting the Family': 'পারিবারিক ভরণপোষণ',
  'Food, Meals': 'খাদ্য ও আহার',
  'Sacrifice on Occasion of Birth (`Aqiqa)': 'আকিকা',
  'Hunting, Slaughtering': 'শিকার ও পশু জবেহ',
  'Al-Adha Festival Sacrifice (Adaahi)': 'কোরবানি',
  'Drinks': 'পানীয় দ্রব্যাদি',
  'Patients': 'রোগীর সেবা',
  'Medicine': 'চিকিৎসা ও প্রতিষেধক',
  'Dress': 'পোশাক-পরিচ্ছদ',
  'Good Manners and Form (Al-Adab)': 'উত্তম চরিত্র ও শিষ্টাচার',
  'Asking Permission': 'অনুমতি গ্রহণ',
  'Invocations': 'দোয়া ও মোনাজাত',
  'To make the Heart Tender (Ar-Riqaq)': 'চিত্তশুদ্ধি ও পরকাল চিন্তা',
  'Divine Will (Al-Qadar)': 'তাকদীর বা ভাগ্য',
  'Oaths and Vows': 'কসম ও মানত',
  'Expiation for Unfulfilled Oaths': 'কসমের কাফফারা',
  'Inheritance Laws (Al-Faraa\'id)': 'উত্তরাধিকার আইন (ফরায়েজ)',
  'Limits and Punishments set by Allah (Hudood)': 'শাস্তি ও হুদুদ',
  'Blood Money (Ad-Diyat)': 'রক্তপণ (দিয়াত)',
  'Apostates': 'মুরতাদদের বিধান',
  'Saying Something under Compulsion (Ikrah)': 'বাধ্যকরণ (ইকরাহ)',
  'Tricks': 'হিলা বা অপকৌশল নিষেধ',
  'Interpretation of Dreams': 'স্বপ্নের ব্যাখ্যা',
  'Afflictions and the End of the World': 'ফিতনা ও কিয়ামতের আলামত',
  'Judgments (Ahkaam)': 'বিচারকার্য ও ফয়সালা',
  'Holding Fast to the Qur\'an and Sunnah': 'কুরআন ও সুন্নাহ আঁকড়ে ধরা',
  'Acceptance of Information Given by a Truthful Person': 'খবরে ওয়াহিদ',
  'Oneness, Uniqueness of Allah (Tawheed)': 'তাওহীদ বা একত্ববাদ',
  'The Book of Faith': 'ঈমান ও বিশ্বাস',
  'The Book of Purification': 'পবিত্রতা ও তাহারাত',
  'The Book of Menstruation': 'ঋতুস্রাব (হায়েজ)',
  'The Book of Prayers': 'সালাত ও নামাজ',
  'The Book of Mosques and Places of Prayer': 'মসজিদ ও সালাতের স্থান',
  'The Book of Prayer - Travellers': 'মুসাফিরের সালাত',
  'The Book of Prayer - Friday': 'জুমুআর সালাত',
  'The Book of Prayer - Two Eids': 'দুই ঈদের সালাত',
  'The Book of Prayer - Rain': 'বৃষ্টির সালাত (ইস্তিসকা)',
  'The Book of Prayer - Eclipses': 'সূর্যগ্রহণের সালাত',
  'The Book of Zakat': 'যাকাত',
  'The Book of Fasting': 'সিয়াম ও রোজা',
  'The Book of I\'tikaf': 'ইতিকাফ',
  'The Book of Pilgrimage': 'হজ ও উমরাহ',
  'The Book of Marriage': 'বিয়ে ও দাম্পত্য',
  'The Book of Suckling': 'দুধপান',
  'The Book of Divorce': 'তালাক',
  'The Book of Business Transactions': 'ব্যবসা-বাণিজ্য',
  'The Book of Inheritance': 'উত্তরাধিকার বণ্টন',
  'The Book of Gifts': 'হেবা ও দান',
  'The Book of Wills': 'ওসিয়ত',
  'The Book of Vows': 'মানত',
  'The Book of Oaths': 'কসম',
  'The Book of Judicial Decisions': 'বিচার ও ফয়সালা',
  'The Book of Lost Property': 'হারানো বস্তু প্রাপ্তি',
  'The Book of Jihad and Expeditions': 'জিহাদ ও যুদ্ধ',
  'The Book of Government': 'নেতৃত্ব ও শাসনকাজ',
  'The Book of Hunting and Slaughter': 'শিকার ও জবেহ',
  'The Book of Sacrifices': 'কোরবানি',
  'The Book of Drinks': 'পানীয় দ্রব্যাদি',
  'The Book of Clothes and Adornment': 'পোশাক ও অলঙ্কার',
  'The Book of Manners and Etiquette': 'আদব ও শিষ্টাচার',
  'The Book of Greetings': 'সালাম প্রদান',
  'The Book Concerning the Use of Correct Words': 'উত্তম বাক্যচয়ন',
  'The Book of Poetry': 'কবিতা ও সাহিত্য',
  'The Book of Dreams': 'স্বপ্নের বিবরণ',
  'The Book of Virtues': 'রাসূলুল্লাহ (সা.)-এর সুমহান গুণাবলী',
  'The Book of the Merits of the Companions': 'সাহাবীগণের মর্যাদা',
  'The Book of Virtue, Enjoining Good Manners, and Joining of the Ties of Kinship': 'আত্মীয়তার সম্পর্ক ও সদ্ব্যবহার',
  'The Book of Destiny': 'তাকদীর',
  'The Book of Knowledge': 'জ্ঞান ও শিক্ষা',
  'The Book of Praise, Supplication, Repentance, and Seeking Forgiveness': 'জিকির, তওবা ও ক্ষমা প্রার্থনা',
  'Heart Melting Traditions': 'হৃদয় গলানো নসীহত',
  'The Book of Repentance': 'তওবা ও অনুশোচনা',
  'Characteristics of the Day of Judgment, Paradise, and Hell': 'কিয়ামত, জান্নাত ও জাহান্নামের বিবরণ',
  'The Book of Paradise, its Description, its Bounties and its Inhabitants': 'জান্নাত ও জান্নাতবাসীদের বিবরণ',
  'The Book of Tribulations and Portents of the Last Hour': 'ফিতনা ও কিয়ামতের লক্ষণ',
  'The Book of Asceticism and Heart-Softening Traditions': 'জুহদ বা দুনিয়া বিমুখতা',
  'The Book of Commentary on the Qur\'an': 'কুরআনের তাফসীর',
  'Forty Hadith of an-Nawawi': 'ইমাম নববীর ৪০ হাদিস',
};

@Injectable({ providedIn: 'root' })
export class HadithService {
  private readonly storage = inject(StorageService);

  // 1. Curated Foundation (Always available offline)
  readonly allHadiths = signal<readonly Hadith[]>(HADITH_DATASET);
  readonly selectedCategory = signal<HadithCategory>('all');
  readonly selectedBook = signal<string>('all');
  readonly searchQuery = signal<string>('');

  private readonly _bookmarks = signal<Set<number | string>>(this.loadBookmarks());
  readonly bookmarks = this._bookmarks.asReadonly();
  readonly bookmarksCount = computed(() => this._bookmarks().size);

  private readonly _dailyModalDismissed = signal<boolean>(this.checkIfDismissedToday());
  readonly isDailyModalDismissed = this._dailyModalDismissed.asReadonly();

  readonly books = computed(() => {
    const list = Array.from(new Set(HADITH_DATASET.map((h) => h.bookBn)));
    return ['সকল গ্রন্থ', ...list];
  });

  readonly dailyHadith = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = Math.abs(dayOfYear) % HADITH_DATASET.length;
    return HADITH_DATASET[index];
  });

  readonly filteredHadiths = computed(() => {
    const category = this.selectedCategory();
    const book = this.selectedBook();
    const rawQuery = this.searchQuery().trim().toLowerCase();

    return this.allHadiths().filter((hadith) => {
      if (category !== 'all' && hadith.category !== category) return false;
      if (book !== 'all' && book !== 'সকল গ্রন্থ' && hadith.bookBn !== book && hadith.book !== book) return false;

      if (rawQuery) {
        const query = rawQuery;
        const matchesBangla = hadith.bangla.toLowerCase().includes(query);
        const matchesEnglish = hadith.english.toLowerCase().includes(query);
        const matchesArabic = hadith.arabic.includes(query);
        const matchesNarrator =
          hadith.narratorBn.toLowerCase().includes(query) ||
          hadith.narratorEn.toLowerCase().includes(query);
        const matchesBook =
          hadith.bookBn.toLowerCase().includes(query) || hadith.book.toLowerCase().includes(query);
        const matchesNumber = String(hadith.hadithNumber).includes(query);

        if (!matchesBangla && !matchesEnglish && !matchesArabic && !matchesNarrator && !matchesBook && !matchesNumber) {
          return false;
        }
      }

      return true;
    });
  });

  // 2. Canonical Cloud API Explorer (36,000+ authentic Hadiths via jsDelivr CDN)
  readonly canonicalBooks = CANONICAL_BOOKS;
  readonly selectedBookId = signal<string>('bukhari');
  readonly selectedChapterNumber = signal<number>(1);
  readonly chapters = signal<readonly HadithChapter[]>([]);
  readonly canonicalHadiths = signal<readonly CanonicalHadithItem[]>([]);
  readonly loadingCanonical = signal<boolean>(false);
  readonly canonicalError = signal<string | null>(null);

  // In-memory caches to prevent redundant network hits
  private infoMetadataCache: Record<string, any> | null = null;
  private readonly sectionCache = new Map<string, readonly CanonicalHadithItem[]>();

  setCategory(category: HadithCategory): void {
    this.selectedCategory.set(category);
  }

  setBook(book: string): void {
    this.selectedBook.set(book);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  isBookmarked(id: number | string): boolean {
    return this._bookmarks().has(id);
  }

  toggleBookmark(id: number | string): void {
    this._bookmarks.update((set) => {
      const updated = new Set(set);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      this.storage.write(STORAGE_KEYS.bookmarks, Array.from(updated));
      return updated;
    });
  }

  dismissDailyModal(dontShowAgainToday = true): void {
    this._dailyModalDismissed.set(true);
    if (dontShowAgainToday) {
      const todayStr = new Date().toDateString();
      this.storage.write(STORAGE_KEYS.dailyDismissed, todayStr);
    }
  }

  // --- Canonical Cloud API Methods ---

  async selectCanonicalBook(bookId: string): Promise<void> {
    this.selectedBookId.set(bookId);
    this.selectedChapterNumber.set(1);
    await this.loadBookChapters(bookId);
    await this.loadChapterHadiths(bookId, 1);
  }

  async selectChapter(chapterNo: number): Promise<void> {
    this.selectedChapterNumber.set(chapterNo);
    await this.loadChapterHadiths(this.selectedBookId(), chapterNo);
  }

  /**
   * Loads the chapter list for a specific canonical book.
   */
  async loadBookChapters(bookId: string): Promise<void> {
    try {
      this.loadingCanonical.set(true);
      this.canonicalError.set(null);

      if (!this.infoMetadataCache) {
        const res = await fetch(`${CDN_BASE}/info.min.json`);
        if (!res.ok) throw new Error('Could not load canonical book metadata');
        this.infoMetadataCache = await res.json();
      }

      const bookMeta = this.infoMetadataCache?.[bookId]?.metadata;
      if (!bookMeta) throw new Error('Book metadata not found');

      const sections = bookMeta.sections as Record<string, string>;
      const sectionDetails = bookMeta.section_details as Record<string, any> | undefined;

      const chapterList: HadithChapter[] = [];
      for (const [key, name] of Object.entries(sections)) {
        const num = parseInt(key, 10);
        if (num === 0 && !name) continue; // Skip empty preface
        const nameEn = name || `Section ${num}`;
        const nameBn = CHAPTER_NAME_BN_MAP[nameEn] || nameEn;
        const details = sectionDetails?.[key];
        const count = details?.hadithnumber_last
          ? details.hadithnumber_last - details.hadithnumber_first + 1
          : undefined;

        chapterList.push({
          number: num,
          nameEn,
          nameBn,
          hadithCount: count,
        });
      }

      // Sort by chapter number
      chapterList.sort((a, b) => a.number - b.number);
      this.chapters.set(chapterList);
    } catch (err: any) {
      this.canonicalError.set(err?.message || 'ইন্টারনেট সংযোগ যাচাই করুন। হাদিস লোড করা যায়নি।');
    } finally {
      this.loadingCanonical.set(false);
    }
  }

  /**
   * Fetches and merges Bengali and Arabic Hadith texts for a specific chapter/section.
   */
  async loadChapterHadiths(bookId: string, chapterNo: number): Promise<void> {
    const cacheKey = `${bookId}-${chapterNo}`;
    if (this.sectionCache.has(cacheKey)) {
      this.canonicalHadiths.set(this.sectionCache.get(cacheKey)!);
      return;
    }

    try {
      this.loadingCanonical.set(true);
      this.canonicalError.set(null);

      const [benRes, araRes] = await Promise.all([
        fetch(`${CDN_BASE}/editions/ben-${bookId}/sections/${chapterNo}.min.json`),
        fetch(`${CDN_BASE}/editions/ara-${bookId}/sections/${chapterNo}.min.json`),
      ]);

      if (!benRes.ok) throw new Error('অধ্যায়ের হাদিস পাওয়া যায়নি');

      const benData = await benRes.json();
      const araData = araRes.ok ? await araRes.json() : null;

      const araMap = new Map<number, string>();
      if (araData?.hadiths) {
        for (const h of araData.hadiths) {
          araMap.set(h.hadithnumber, h.text);
        }
      }

      const book = CANONICAL_BOOKS.find((b) => b.id === bookId);
      const chapter = this.chapters().find((c) => c.number === chapterNo);

      const items: CanonicalHadithItem[] = (benData.hadiths || []).map((h: any) => ({
        id: `${bookId}-${h.hadithnumber}`,
        bookId,
        bookNameBn: book?.nameBn || bookId,
        bookNameEn: book?.nameEn || bookId,
        hadithNumber: h.hadithnumber,
        chapterNumber: chapterNo,
        chapterNameBn: chapter?.nameBn || `অধ্যায় ${chapterNo}`,
        chapterNameEn: chapter?.nameEn || `Chapter ${chapterNo}`,
        arabic: araMap.get(h.hadithnumber) || '',
        bangla: h.text,
        grade: h.grades?.[0]?.grade || 'Sahih',
      }));

      this.sectionCache.set(cacheKey, items);
      this.canonicalHadiths.set(items);
    } catch (err: any) {
      this.canonicalError.set(err?.message || 'হাদিস লোড করা সম্ভব হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      this.canonicalHadiths.set([]);
    } finally {
      this.loadingCanonical.set(false);
    }
  }

  private checkIfDismissedToday(): boolean {
    const dismissedDate = this.storage.read<string>(STORAGE_KEYS.dailyDismissed, '');
    const todayStr = new Date().toDateString();
    return dismissedDate === todayStr;
  }

  private loadBookmarks(): Set<number | string> {
    const stored = this.storage.read<(number | string)[]>(STORAGE_KEYS.bookmarks, []);
    return new Set(Array.isArray(stored) ? stored : []);
  }
}
