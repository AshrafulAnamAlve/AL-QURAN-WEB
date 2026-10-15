using AlQuran.Api.Models.Common;

namespace AlQuran.Api.Services.Quran;

/// <summary>
/// Static surah reference data that no free Quran API provides in one place.
///
/// Two Bangla fields, and they are not the same thing:
///   BanglaName    - the surah name transliterated into Bengali script
///                   (আল-ফাতিহা). A curated table maintained in this file.
///   BanglaMeaning - what the name means in Bangla (সূচনা). Taken from the
///                   Quran.com API (/chapters?language=bn), fetched once and
///                   baked in so there is no second runtime dependency.
///
/// AyahCount is included as a cross-check: the surah list from AlQuran.cloud is
/// the source of truth at runtime, and a mismatch against this table is logged
/// rather than silently accepted.
///
/// These are names and meanings, not Quranic text. Corrections are welcome and
/// only need editing here.
/// </summary>
public static class SurahNames
{
    /// <summary>Reference entry for one surah.</summary>
    /// <param name="Number">Surah number, 1-114.</param>
    /// <param name="BanglaName">Name transliterated into Bengali script.</param>
    /// <param name="BanglaMeaning">Meaning of the name, in Bangla.</param>
    /// <param name="EnglishName">Simple Latin transliteration.</param>
    /// <param name="AyahCount">Number of ayahs, used as a sanity check.</param>
    /// <param name="RevelationPlace">"makkah" or "madinah".</param>
    public sealed record Entry(
        int Number,
        string BanglaName,
        string BanglaMeaning,
        string EnglishName,
        int AyahCount,
        string RevelationPlace);

    private static readonly IReadOnlyDictionary<int, Entry> Lookup = new Entry[]
    {
        new(1, "আল-ফাতিহা", "সূচনা", "Al-Fatihah", 7, "makkah"),
        new(2, "আল-বাকারা", "বকনা-বাছুর", "Al-Baqarah", 286, "madinah"),
        new(3, "আলে-ইমরান", "ইমরানের পরিবার", "Ali 'Imran", 200, "madinah"),
        new(4, "আন-নিসা", "নারী", "An-Nisa", 176, "madinah"),
        new(5, "আল-মায়িদা", "খাদ্য পরিবেশিত টেবিল", "Al-Ma'idah", 120, "madinah"),
        new(6, "আল-আনআম", "গৃহপালিত পশু", "Al-An'am", 165, "makkah"),
        new(7, "আল-আরাফ", "উচু স্থান", "Al-A'raf", 206, "makkah"),
        new(8, "আল-আনফাল", "যুদ্ধ-লব্ধ ধনসম্পদ", "Al-Anfal", 75, "madinah"),
        new(9, "আত-তাওবা", "অনুশোচনা", "At-Tawbah", 129, "madinah"),
        new(10, "ইউনুস", "নবী ইউনুস", "Yunus", 109, "makkah"),
        new(11, "হুদ", "নবী হুদ", "Hud", 123, "makkah"),
        new(12, "ইউসুফ", "নবী ইউসুফ", "Yusuf", 111, "makkah"),
        new(13, "আর-রাদ", "বজ্রপাত", "Ar-Ra'd", 43, "madinah"),
        new(14, "ইবরাহীম", "নবী ইবরাহীম", "Ibrahim", 52, "makkah"),
        new(15, "আল-হিজর", "পাথুরে পাহাড়", "Al-Hijr", 99, "makkah"),
        new(16, "আন-নাহল", "মৌমাছি", "An-Nahl", 128, "makkah"),
        new(17, "বনী ইসরাঈল", "ইহুদি জাতি", "Al-Isra", 111, "makkah"),
        new(18, "আল-কাহফ", "গুহা", "Al-Kahf", 110, "makkah"),
        new(19, "মারইয়াম", "মারইয়াম (ঈসা নবীর মা)", "Maryam", 98, "makkah"),
        new(20, "ত্বা-হা", "ত়া হা", "Taha", 135, "makkah"),
        new(21, "আল-আম্বিয়া", "নবীগণ", "Al-Anbya", 112, "makkah"),
        new(22, "আল-হাজ্জ", "হ়াজ্জ", "Al-Hajj", 78, "madinah"),
        new(23, "আল-মুমিনুন", "বিশ্বাসী", "Al-Mu'minun", 118, "makkah"),
        new(24, "আন-নূর", "আলো", "An-Nur", 64, "madinah"),
        new(25, "আল-ফুরকান", "মানদণ্ড", "Al-Furqan", 77, "makkah"),
        new(26, "আশ-শুআরা", "কবি", "Ash-Shu'ara", 227, "makkah"),
        new(27, "আন-নামল", "পিঁপড়া", "An-Naml", 93, "makkah"),
        new(28, "আল-কাসাস", "কাহিনি", "Al-Qasas", 88, "makkah"),
        new(29, "আল-আনকাবুত", "মাকড়শা", "Al-'Ankabut", 69, "makkah"),
        new(30, "আর-রূম", "রোমান জাতি", "Ar-Rum", 60, "makkah"),
        new(31, "লুকমান", "এক জ্ঞানী ব্যাক্তি", "Luqman", 34, "makkah"),
        new(32, "আস-সাজদা", "সিজদা", "As-Sajdah", 30, "makkah"),
        new(33, "আল-আহযাব", "জোট", "Al-Ahzab", 73, "madinah"),
        new(34, "সাবা", "রানী সাবা/শেবা", "Saba", 54, "makkah"),
        new(35, "ফাতির", "আদি স্রষ্টা", "Fatir", 45, "makkah"),
        new(36, "ইয়াসীন", "ইয়াসীন", "Ya-Sin", 83, "makkah"),
        new(37, "আস-সাফফাত", "সারিবদ্ধভাবে দাঁড়ানো", "As-Saffat", 182, "makkah"),
        new(38, "সোয়াদ", "আরবি বর্ণ সাদ", "Sad", 88, "makkah"),
        new(39, "আয-যুমার", "দলবদ্ধ জনতা", "Az-Zumar", 75, "makkah"),
        new(40, "আল-মুমিন", "ক্ষমাকারী", "Ghafir", 85, "makkah"),
        new(41, "হা-মীম সাজদা", "সুস্পষ্ট বিবরণ", "Fussilat", 54, "makkah"),
        new(42, "আশ-শূরা", "পরামর্শ", "Ash-Shuraa", 53, "makkah"),
        new(43, "আয-যুখরুফ", "সোনাদানা", "Az-Zukhruf", 89, "makkah"),
        new(44, "আদ-দুখান", "ধোঁয়া", "Ad-Dukhan", 59, "makkah"),
        new(45, "আল-জাসিয়া", "নতজানু", "Al-Jathiyah", 37, "makkah"),
        new(46, "আল-আহকাফ", "বালুর পাহাড়", "Al-Ahqaf", 35, "makkah"),
        new(47, "মুহাম্মদ", "নবী মুহাম্মদ", "Muhammad", 38, "madinah"),
        new(48, "আল-ফাতহ", "বিজয়", "Al-Fath", 29, "madinah"),
        new(49, "আল-হুজুরাত", "আবাস", "Al-Hujurat", 18, "madinah"),
        new(50, "ক্বাফ", "কাফ", "Qaf", 45, "makkah"),
        new(51, "আয-যারিয়াত", "বিক্ষেপকারী বাতাস", "Adh-Dhariyat", 60, "makkah"),
        new(52, "আত-তূর", "পাহাড়", "At-Tur", 49, "makkah"),
        new(53, "আন-নাজম", "তারা", "An-Najm", 62, "makkah"),
        new(54, "আল-কামার", "চাঁদ", "Al-Qamar", 55, "makkah"),
        new(55, "আর-রহমান", "পরম করুণাময়", "Ar-Rahman", 78, "madinah"),
        new(56, "আল-ওয়াকিয়া", "নিশ্চিত ঘটনা", "Al-Waqi'ah", 96, "makkah"),
        new(57, "আল-হাদীদ", "লোহা", "Al-Hadid", 29, "madinah"),
        new(58, "আল-মুজাদালা", "অনুযোগকারিণী", "Al-Mujadila", 22, "madinah"),
        new(59, "আল-হাশর", "সমাবেশ", "Al-Hashr", 24, "madinah"),
        new(60, "আল-মুমতাহিনা", "নারী, যাকে পরীক্ষা করা হবে", "Al-Mumtahanah", 13, "madinah"),
        new(61, "আস-সাফ", "সারিবদ্ধ সৈন্যদল", "As-Saf", 14, "madinah"),
        new(62, "আল-জুমুআ", "সম্মেলন/শুক্রবার", "Al-Jumu'ah", 11, "madinah"),
        new(63, "আল-মুনাফিকুন", "ভণ্ড বিশ্বাসী", "Al-Munafiqun", 11, "madinah"),
        new(64, "আত-তাগাবুন", "মোহ অপসারণ", "At-Taghabun", 18, "madinah"),
        new(65, "আত-তালাক", "তালাক", "At-Talaq", 12, "madinah"),
        new(66, "আত-তাহরীম", "নিষিদ্ধকরণ", "At-Tahrim", 12, "madinah"),
        new(67, "আল-মুলক", "সার্বভৌম কর্তৃত্ব", "Al-Mulk", 30, "makkah"),
        new(68, "আল-কলম", "কলম", "Al-Qalam", 52, "makkah"),
        new(69, "আল-হাক্কাহ", "নিশ্চিত সত্য", "Al-Haqqah", 52, "makkah"),
        new(70, "আল-মাআরিজ", "উন্নয়নের সোপান", "Al-Ma'arij", 44, "makkah"),
        new(71, "নূহ", "নবী নূহ", "Nuh", 28, "makkah"),
        new(72, "আল-জিন", "জিন সম্প্রদায়", "Al-Jinn", 28, "makkah"),
        new(73, "আল-মুযযাম্মিল", "বস্ত্রাচ্ছাদনকারী", "Al-Muzzammil", 20, "makkah"),
        new(74, "আল-মুদ্দাসসির", "পোশাক পরিহিত", "Al-Muddaththir", 56, "makkah"),
        new(75, "আল-কিয়ামাহ", "পুনরুত্থান", "Al-Qiyamah", 40, "makkah"),
        new(76, "আল-ইনসান", "মানবজাতি", "Al-Insan", 31, "madinah"),
        new(77, "আল-মুরসালাত", "প্রেরিত পুরুষ", "Al-Mursalat", 50, "makkah"),
        new(78, "আন-নাবা", "মহাসংবাদ", "An-Naba", 40, "makkah"),
        new(79, "আন-নাযিআত", "প্রচেষ্টাকারী", "An-Nazi'at", 46, "makkah"),
        new(80, "আবাসা", "সে ভ্রু কুঁচকালো", "'Abasa", 42, "makkah"),
        new(81, "আত-তাকভীর", "অন্ধকারাচ্ছন্ন", "At-Takwir", 29, "makkah"),
        new(82, "আল-ইনফিতার", "বিদীর্ণ করা", "Al-Infitar", 19, "makkah"),
        new(83, "আল-মুতাফফিফীন", "প্রতারণা করা", "Al-Mutaffifin", 36, "makkah"),
        new(84, "আল-ইনশিকাক", "খণ্ড-বিখণ্ডকরণ", "Al-Inshiqaq", 25, "makkah"),
        new(85, "আল-বুরূজ", "নক্ষত্রপুঞ্জ", "Al-Buruj", 22, "makkah"),
        new(86, "আত-তারিক", "রাতের আগন্তুক", "At-Tariq", 17, "makkah"),
        new(87, "আল-আলা", "সর্বোন্নত", "Al-A'la", 19, "makkah"),
        new(88, "আল-গাশিয়া", "বিহ্বলকর ঘটনা", "Al-Ghashiyah", 26, "makkah"),
        new(89, "আল-ফজর", "ভোরবেলা", "Al-Fajr", 30, "makkah"),
        new(90, "আল-বালাদ", "নগর", "Al-Balad", 20, "makkah"),
        new(91, "আশ-শামস", "সূর্য", "Ash-Shams", 15, "makkah"),
        new(92, "আল-লাইল", "রাত", "Al-Layl", 21, "makkah"),
        new(93, "আদ-দুহা", "পূর্বাহ্নের সুর্যকিরণ", "Ad-Duhaa", 11, "makkah"),
        new(94, "আশ-শারহ", "বক্ষ প্রশস্তকরণ", "Ash-Sharh", 8, "makkah"),
        new(95, "আত-তীন", "ডুমুর", "At-Tin", 8, "makkah"),
        new(96, "আল-আলাক", "রক্তপিণ্ড", "Al-'Alaq", 19, "makkah"),
        new(97, "আল-কদর", "মহিমান্বিত", "Al-Qadr", 5, "makkah"),
        new(98, "আল-বাইয়িনাহ", "প্রমাণ", "Al-Bayyinah", 8, "madinah"),
        new(99, "আয-যিলযাল", "ভূমিকম্প", "Az-Zalzalah", 8, "madinah"),
        new(100, "আল-আদিয়াত", "অভিযানকারী", "Al-'Adiyat", 11, "makkah"),
        new(101, "আল-কারিআ", "মহাসংকট", "Al-Qari'ah", 11, "makkah"),
        new(102, "আত-তাকাসুর", "প্রাচুর্যের প্রতিযোগিতা", "At-Takathur", 8, "makkah"),
        new(103, "আল-আসর", "সময়", "Al-'Asr", 3, "makkah"),
        new(104, "আল-হুমাযাহ", "পরনিন্দাকারী", "Al-Humazah", 9, "makkah"),
        new(105, "আল-ফীল", "হাতি", "Al-Fil", 5, "makkah"),
        new(106, "কুরাইশ", "কুরাইশ গোত্র", "Quraysh", 4, "makkah"),
        new(107, "আল-মাউন", "সাহায্য সহায়তা", "Al-Ma'un", 7, "makkah"),
        new(108, "আল-কাউসার", "কাউসার/প্রাচুর্য", "Al-Kawthar", 3, "makkah"),
        new(109, "আল-কাফিরুন", "অবিশ্বাসী", "Al-Kafirun", 6, "makkah"),
        new(110, "আন-নাসর", "সাহায্য", "An-Nasr", 3, "madinah"),
        new(111, "আল-লাহাব", "খেজুরের পাকানো (রশি)", "Al-Masad", 5, "makkah"),
        new(112, "আল-ইখলাস", "আন্তরিকতা", "Al-Ikhlas", 4, "makkah"),
        new(113, "আল-ফালাক", "নিশিভোর", "Al-Falaq", 5, "makkah"),
        new(114, "আন-নাস", "মানুষ জাতি", "An-Nas", 6, "makkah"),
    }.ToDictionary(entry => entry.Number);

    /// <summary>Total surahs in the Quran.</summary>
    public const int SurahCount = 114;

    /// <summary>Total ayahs in the Quran, used for the reading-progress figure.</summary>
    public const int TotalAyahCount = 6236;

    /// <summary>Total juz (para) in the Quran.</summary>
    public const int JuzCount = 30;

    /// <summary>Reference data for one surah.</summary>
    /// <exception cref="RequestValidationException">The number is outside 1-114.</exception>
    public static Entry Get(int surahNumber)
    {
        if (!Lookup.TryGetValue(surahNumber, out var entry))
        {
            throw new RequestValidationException(
                $"Surah number must be between 1 and {SurahCount}.",
                nameof(surahNumber));
        }

        return entry;
    }

    /// <summary>Reference data for one surah, or null when the number is out of range.</summary>
    public static Entry? Find(int surahNumber) =>
        Lookup.TryGetValue(surahNumber, out var entry) ? entry : null;

    /// <summary>Every entry, ordered by surah number.</summary>
    public static IReadOnlyList<Entry> All { get; } =
        Lookup.Values.OrderBy(entry => entry.Number).ToList();
}
