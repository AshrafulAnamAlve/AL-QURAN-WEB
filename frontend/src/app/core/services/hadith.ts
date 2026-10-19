import { Injectable, computed, inject, signal } from '@angular/core';
import { HADITH_CATEGORIES, Hadith, HadithCategory } from '../models/hadith';
import { StorageService } from './storage';

const STORAGE_KEYS = {
  bookmarks: 'alquran.hadith_bookmarks',
  dailyDismissed: 'alquran.daily_hadith_dismissed',
} as const;

/**
 * Authentic Hadiths collection across core Islamic themes:
 * Sahih al-Bukhari, Sahih Muslim, Riyad as-Salihin, Imam Nawawi's 40 Hadiths.
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
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    bangla: 'নিশ্চয়ই সমস্ত কাজের ফলাফল নিয়তের (উদ্দেশ্যের) ওপর নির্ভরশীল। আর প্রত্যেক ব্যক্তি তার নিয়ত অনুযায়ী প্রতিফল পাবে।',
    english: 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.',
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
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
    bangla: 'পবিত্রতা ঈমানের অর্ধেক, আর ‘আলহামদুলিল্লাহ’ আমলের পাল্লাকে পূর্ণ করে দেয়।',
    english: 'Purity is half of faith and "Alhamdulillah" fills the scale.',
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
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    bangla: 'তোমাদের কেউ প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করে যা নিজের জন্য পছন্দ করে।',
    english: 'None of you will believe until you love for your brother what you love for yourself.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 4,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 5027,
    chapterEn: 'Virtues of the Quran',
    chapterBn: 'কুরআনের ফজিলত',
    narratorEn: 'Uthman ibn Affan (RA)',
    narratorBn: 'হযরত উসমান ইবনে আফফান (রা.)',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    bangla: 'তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সেই, যে নিজে কুরআন শিখে এবং অন্যকে তা শেখায়।',
    english: 'The best among you are those who learn the Quran and teach it.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'knowledge',
  },
  {
    id: 5,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6011,
    chapterEn: 'Good Manners',
    chapterBn: 'সদাচরণ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    bangla: 'যে ব্যক্তি আল্লাহ ও শেষ দিবসের প্রতি বিশ্বাস রাখে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।',
    english: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 6,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 1410,
    chapterEn: 'Zakat & Charity',
    chapterBn: 'যাকাত ও সদকা',
    narratorEn: 'Adi ibn Hatim (RA)',
    narratorBn: 'হযরত আদি ইবনে হাতিম (রা.)',
    arabic: 'اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ',
    bangla: 'একটি খেজুরের অর্ধাংশ দান করে হলেও তোমরা জাহান্নামের আগুন থেকে নিজেকে বাঁচাও।',
    english: 'Save yourselves from the Fire, even with half a date given in charity.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'charity',
  },
  {
    id: 7,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2588,
    chapterEn: 'Virtue & Good Relations',
    chapterBn: 'সদাচার ও অনুগ্রহ',
    narratorEn: 'An-Nawwas ibn Sam\'an (RA)',
    narratorBn: 'হযরত নাওয়াস ইবনে সামআন (রা.)',
    arabic: 'الْبِرُّ حُسْنُ الْخُلُقِ، وَالإِثْمُ مَا حَاكَ فِي صَدْرِكَ وَكَرِهْتَ أَنْ يَطَّلِعَ عَلَيْهِ النَّاسُ',
    bangla: 'পুণ্য হলো উত্তম চরিত্র। আর পাপ হলো যা তোমার অন্তরে খটকা সৃষ্টি করে এবং মানুষের জানা তুমি অপছন্দ করো।',
    english: 'Righteousness is good character, and sin is that which wavers in your heart and which you would dislike for people to find out.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 8,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 2646,
    chapterEn: 'Knowledge',
    chapterBn: 'জ্ঞান',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    bangla: 'যে ব্যক্তি জ্ঞান অর্জনের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।',
    english: 'Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'knowledge',
  },
  {
    id: 9,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 1894,
    chapterEn: 'Fasting',
    chapterBn: 'সিয়াম',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'الصِّيَامُ جُنَّةٌ، فَإِذَا كَانَ يَوْمُ صَوْمِ أَحَدِكُمْ فَلاَ يَرْفُثْ وَلاَ يَصْخَبْ',
    bangla: 'রোজা হলো ঢালস্বরূপ। সুতরাং তোমাদের কেউ রোজা রাখলে সে যেন অশ্লীল বাক্য না বলে এবং হইচই না করে।',
    english: 'Fasting is a shield. So when one of you is fasting, he should neither indulge in obscenity nor shout.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'fasting',
  },
  {
    id: 10,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 3371,
    chapterEn: 'Supplication',
    chapterBn: 'দোয়া',
    narratorEn: 'An-Nu\'man ibn Bashir (RA)',
    narratorBn: 'হযরত নুমান ইবনে বাশীর (রা.)',
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    bangla: 'দোয়াই হলো ইবাদত (ইবাদতের মূল সারবস্তু)।',
    english: 'Supplication is the essence of worship.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'dua',
  },
  {
    id: 11,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2699,
    chapterEn: 'Supplication & Repentance',
    chapterBn: 'তওবা ও ক্ষমা',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'مَنْ تَابَ قَبْلَ أَنْ تَطْلُعَ الشَّمْسُ مِنْ مَغْرِبِهَا تَابَ اللَّهُ عَلَيْهِ',
    bangla: 'পশ্চিম দিক থেকে সূর্যোদয় হওয়ার পূর্ব পর্যন্ত যে ব্যক্তি তওবা করবে, আল্লাহ তার তওবা কবুল করবেন।',
    english: 'Whoever repents before the sun rises from the west, Allah will accept his repentance.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'dua',
  },
  {
    id: 12,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6018,
    chapterEn: 'Good Manners',
    chapterBn: 'উত্তম ব্যবহার',
    narratorEn: 'Abdullah ibn Amr (RA)',
    narratorBn: 'হযরত আবদুল্লাহ ইবনে আমর (রা.)',
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    bangla: 'প্রকৃত মুসলিম তো সেই ব্যক্তি, যার জিহ্বা ও হাত থেকে অন্য মুসলিম নিরাপদ থাকে।',
    english: 'A Muslim is the one who avoids harming other Muslims with his tongue and his hands.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 13,
    book: 'Sunan Abi Dawud',
    bookBn: 'সুনান আবু দাউদ',
    hadithNumber: 4941,
    chapterEn: 'Kindness & Mercy',
    chapterBn: 'দয়া ও সহানুভূতি',
    narratorEn: 'Abdullah ibn Amr (RA)',
    narratorBn: 'হযরত আবদুল্লাহ ইবনে আমর (রা.)',
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    bangla: 'দয়াশীলদের ওপর পরম দয়াময় আল্লাহ দয়া করেন। তোমরা পৃথিবীবাসীদের দয়া করো, তবেই আকাশে যিনি আছেন তিনি তোমাদের দয়া করবেন।',
    english: 'The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth and the One in the heavens will have mercy upon you.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 14,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2564,
    chapterEn: 'Brotherhood',
    chapterBn: 'ভ্রাতৃত্ববোধ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'لاَ تَحَاسَدُوا، وَلاَ تَنَاجَشُوا، وَلاَ تَبَاغَضُوا، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا',
    bangla: 'তোমরা একে অপরের প্রতি হিংসা করো না, প্রতারণা করো না এবং বিদ্বেষ পোষণ করো না; বরং আল্লাহর বান্দা হিসেবে সবাই ভাই ভাই হয়ে যাও।',
    english: 'Do not envy one another, do not artificially inflate prices, do not hate one another; and be, O servants of Allah, brothers.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 15,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6407,
    chapterEn: 'Remembrance of Allah',
    chapterBn: 'আল্লাহর স্মরণ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'كَلِمَتَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ، خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    bangla: 'দুটি বাক্য এমন যা পরম করুণাময় আল্লাহর কাছে অত্যন্ত প্রিয়, মুখে উচ্চারণ করা সহজ এবং মিজানের পাল্লায় অনেক ভারী: "সুবহানাল্লাহি ওয়া বিহামদিহী, সুবহানাল্লাহিল আজীম"।',
    english: 'Two phrases are beloved to the Most Merciful, light on the tongue, and heavy on the scale: "Subhan Allahi wa bihamdihi, Subhan Allahil Azim".',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'dua',
  },
  {
    id: 16,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 52,
    chapterEn: 'Faith',
    chapterBn: 'ঈমান ও তাকওয়া',
    narratorEn: 'An-Nu\'man ibn Bashir (RA)',
    narratorBn: 'হযরত নুমান ইবনে বাশীর (রা.)',
    arabic: 'الْحَلاَلُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ، وَبَيْنَهُمَا مُشَبَّهَاتٌ لاَ يَعْلَمُهَا كَثِيرٌ مِنَ النَّاسِ',
    bangla: 'হালাল সুস্পষ্ট এবং হারামও সুস্পষ্ট; আর এ দুয়ের মাঝে রয়েছে বহু সন্দেহজনক বিষয় যা অনেকেই জানে না। যে ব্যক্তি সন্দেহজনক বিষয় থেকে বেঁচে থাকে, সে তার দ্বীন ও সম্মান রক্ষা করে।',
    english: 'That which is lawful is clear and that which is unlawful is clear, and between the two of them are doubtful matters about which many people do not know.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'nawawi40',
  },
  {
    id: 17,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 55,
    chapterEn: 'Sincerity & Faith',
    chapterBn: 'কল্যাণকামিতা',
    narratorEn: 'Tamim ad-Dari (RA)',
    narratorBn: 'হযরত তামীম আদ-দারী (রা.)',
    arabic: 'الدِّينُ النَّصِيحَةُ، قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ',
    bangla: 'রাসূলুল্লাহ ﷺ বলেছেন: "দ্বীন হলো আন্তরিক কল্যাণকামিতা।" আমরা জিজ্ঞেস করলাম: কার জন্য? তিনি বললেন: "আল্লাহর জন্য, তাঁর কিতাবের জন্য, তাঁর রাসূলের জন্য, মুসলিম নেতৃবৃন্দের জন্য এবং সাধারণ মুসলিমদের জন্য।"',
    english: 'The Prophet ﷺ said: "Religion is sincerity." We asked, "To whom?" He said, "To Allah, His Book, His Messenger, and to the leaders of the Muslims and their common folk."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'nawawi40',
  },
  {
    id: 18,
    book: 'Jami` at-Tirmidhi',
    bookBn: 'জামে আত-তিরমিজী',
    hadithNumber: 2317,
    chapterEn: 'Zuhd (Asceticism)',
    chapterBn: 'অনর্থক কাজ বর্জন',
    narratorEn: 'Ali ibn Husayn (RA)',
    narratorBn: 'হযরত আলী ইবনে হুসাইন (রা.)',
    arabic: 'مِنْ حُسْنِ إِسْلاَمِ الْمَرْءِ تَرْكُهُ مَا لاَ يَعْنِيهِ',
    bangla: 'কোনো ব্যক্তির ইসলামের সৌন্দর্য হলো তার জন্য অপ্রয়োজনীয় ও অনর্থক বিষয় বর্জন করা।',
    english: 'Part of the perfection of one\'s Islam is his leaving that which does not concern him.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'nawawi40',
  },
  {
    id: 19,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 6116,
    chapterEn: 'Controlling Anger',
    chapterBn: 'ক্রোধ নিয়ন্ত্রণ',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    bangla: 'কুস্তিতে যে অপরকে পরাভূত করতে পারে সে প্রকৃত বীর নয়; বরং প্রকৃত বীর সে-ই, যে ক্রোধের সময় নিজেকে নিয়ন্ত্রণে রাখতে পারে।',
    english: 'The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'character',
  },
  {
    id: 20,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 5354,
    chapterEn: 'Family Care',
    chapterBn: 'পরিবারের যত্ন',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'السَّاعِي عَلَى الأَرْمَلَةِ وَالْمِسْكِينِ كَالْمُجَاهِدِ فِي سَبِيلِ اللَّهِ',
    bangla: 'বিধবা ও অসহায় দরিদ্রের জন্য সচেষ্ট ব্যক্তি আল্লাহর পথে জিহাদকারীর সমতুল্য।',
    english: 'The one who looks after a widow or a poor person is like a mujahid who fights for Allah\'s Cause.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'charity',
  },
  {
    id: 21,
    book: 'Sahih Muslim',
    bookBn: 'সহিহ মুসলিম',
    hadithNumber: 2698,
    chapterEn: 'Repentance & Mercy',
    chapterBn: 'আল্লাহর রহমত ও তওবা',
    narratorEn: 'Abu Hurairah (RA)',
    narratorBn: 'হযরত আবু হুরায়রা (রা.)',
    arabic: 'إِنَّ اللَّهَ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ سَقَطَ عَلَى بَعِيرِهِ وَقَدْ أَضَلَّهُ فِي أَرْضِ فَلاَةٍ',
    bangla: 'তোমাদের কেউ মরুভূমিতে হারিয়ে যাওয়া উট ফিরে পেলে যতটুকু আনন্দিত হয়, আল্লাহ তাঁর বান্দার তওবায় তার চেয়েও বেশি খুশি হন।',
    english: 'Allah is more pleased with the repentance of His servant than one of you when he finds his lost camel in a desolate wasteland.',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'dua',
  },
  {
    id: 22,
    book: 'Sahih al-Bukhari',
    bookBn: 'সহিহ বুখারী',
    hadithNumber: 528,
    chapterEn: 'Prayer',
    chapterBn: 'সালাতের গুরুত্ব',
    narratorEn: 'Abdullah ibn Mas\'ud (RA)',
    narratorBn: 'হযরত আবদুল্লাহ ইবনে মাসউদ (রা.)',
    arabic: 'سَأَلْتُ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: أَيُّ الْعَمَلِ أَحَبُّ إِلَى اللَّهِ؟ قَالَ: الصَّلاَةُ عَلَى وَقْتِهَا',
    bangla: 'আমি নবীজী ﷺ-কে জিজ্ঞেস করলাম: আল্লাহর নিকট কোন আমল সবচেয়ে বেশি প্রিয়? তিনি বললেন: "সময়মতো নামাজ আদায় করা।"',
    english: 'I asked the Prophet ﷺ: "Which deed is the dearest to Allah?" He replied: "To perform the prayers at their proper stated times."',
    gradeEn: 'Sahih',
    gradeBn: 'সহিহ',
    category: 'salah',
  },
];

@Injectable({ providedIn: 'root' })
export class HadithService {
  private readonly storage = inject(StorageService);

  readonly allHadiths = signal<readonly Hadith[]>(HADITH_DATASET);
  readonly categories = HADITH_CATEGORIES;

  // Filters
  readonly selectedCategory = signal<HadithCategory>('all');
  readonly selectedBook = signal<string>('all');
  readonly searchQuery = signal<string>('');

  // Bookmarks
  private readonly _bookmarks = signal<Set<number>>(this.loadBookmarks());
  readonly bookmarks = this._bookmarks.asReadonly();
  readonly bookmarksCount = computed(() => this._bookmarks().size);

  // Daily Modal Visibility State
  private readonly _dailyModalDismissed = signal<boolean>(this.checkIfDismissedToday());
  readonly isDailyModalDismissed = this._dailyModalDismissed.asReadonly();

  readonly books = computed(() => {
    const list = Array.from(new Set(HADITH_DATASET.map((h) => h.bookBn)));
    return ['সকল গ্রন্থ', ...list];
  });

  /**
   * Deterministically returns today's Hadith based on calendar day of the year.
   */
  readonly dailyHadith = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = Math.abs(dayOfYear) % HADITH_DATASET.length;
    return HADITH_DATASET[index];
  });

  /**
   * Filtered Hadiths matching category, book, and search query.
   */
  readonly filteredHadiths = computed(() => {
    const category = this.selectedCategory();
    const book = this.selectedBook();
    const rawQuery = this.searchQuery().trim().toLowerCase();

    return this.allHadiths().filter((hadith) => {
      // Category filter
      if (category !== 'all' && hadith.category !== category) {
        return false;
      }

      // Book filter
      if (book !== 'all' && book !== 'সকল গ্রন্থ' && hadith.bookBn !== book && hadith.book !== book) {
        return false;
      }

      // Search query filter
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

  setCategory(category: HadithCategory): void {
    this.selectedCategory.set(category);
  }

  setBook(book: string): void {
    this.selectedBook.set(book);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  isBookmarked(id: number): boolean {
    return this._bookmarks().has(id);
  }

  toggleBookmark(id: number): void {
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

  private checkIfDismissedToday(): boolean {
    const dismissedDate = this.storage.read<string>(STORAGE_KEYS.dailyDismissed, '');
    const todayStr = new Date().toDateString();
    return dismissedDate === todayStr;
  }

  private loadBookmarks(): Set<number> {
    const stored = this.storage.read<number[]>(STORAGE_KEYS.bookmarks, []);
    return new Set(Array.isArray(stored) ? stored : []);
  }
}
