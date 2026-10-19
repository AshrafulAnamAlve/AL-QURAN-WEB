# Phase 18 — Daily Hadith Modal & Dedicated Hadith Section (হাদিস বিভাগ)

**Status: ✅ COMPLETE**

---

## Goal

Replace the previous home page task/deed modal with an inspiring **Daily Hadith Modal** that presents a fresh, authentic Hadith each day upon visiting the home page, equipped with a "Read More" (আরও পড়ুন) navigation button, and build a full-featured, dedicated **Hadith Section (`/hadith`)** with categorized collections (Sahih al-Bukhari, Sahih Muslim, 40 Hadith of Imam Nawawi, Riyad as-Salihin), instant search, and bookmarking.

---

## Scope

### 1. Home Page Modal Transition
- [ ] **Remove Previous Task / Dhikr Auto-Popup**:
  - Remove `aq-dhikr-prompt-modal` auto-trigger from the home page.
  - Keep the Tasbih & Dhikr feature intact and accessible from navigation and explore cards (`/tasbih`).
- [ ] **Daily Hadith Modal (`DailyHadithModalComponent`)**:
  - Automatically pops up gracefully on home page visit (throttled to once per day, or dismissed for the session).
  - Displays:
    - **Header**: "আজকের হাদিস" (Hadith of the Day) with source badge (e.g. সহিহ বুখারী / Sahih al-Bukhari).
    - **Arabic Text**: Authentic vocalized Arabic text (`aq-arabic`).
    - **Bangla Translation**: Clear, verified Bengali translation (`aq-bangla`).
    - **Narrator & Reference**: E.g., হযরত আবু হুরায়রা (রা.) বর্ণিত, সহিহ বুখারী হাদিস নং ১.
    - **Authenticity Grade Badge**: "সহিহ" (Sahih) in green chip.
  - **Action Buttons**:
    - **"আরও পড়ুন" (Read More)**: Navigates straight to `/hadith` focused on the selected Hadith or topic, closing the modal.
    - **"কপি করুন" (Copy Hadith)**: Formats Arabic text, translation, narrator, and book reference to the clipboard.
    - **"বন্ধ করুন" (Close / Dismiss)**: Smoothly closes modal with "আজকের জন্য আর দেখাবেন না" (Don't show again today) preference stored in `localStorage`.

### 2. Dedicated Hadith Section (`/hadith`)
- [ ] **Route & App Navigation Integration**:
  - New route: `/hadith` configured with standalone lazy-loading in Angular router.
  - Top navigation bar link: "হাদিস" / "Hadith".
  - Mobile drawer navigation link and icon (`bookOpen` / `feather`).
  - Home page Explore card: "হাদিস শরীফ — সহিহ হাদিস সংকলন ও প্রাত্যহিক শিক্ষা".
- [ ] **Hadith Browser UI Hierarchy**:
  - **Hero Feature Banner**:
    - Prominently showcases "আজকের নির্বাচিত হাদিস" (Today's Featured Hadith) with direct copy/share buttons.
  - **Category / Topic Filter Bar**:
    - *ঈমান ও আকীদা* (Faith & Belief)
    - *নামাজ ও সালাত* (Prayer & Taharah)
    - *সদাচরণ ও আখলাক* (Good Character & Ethics)
    - *দান-সদকা ও পরোপকার* (Charity & Generosity)
    - *সিয়াম ও রমজান* (Fasting & Ramadan)
    - *তওবা ও ক্ষমা প্রার্থনা* (Repentance & Du'a)
    - *জ্ঞান ও শিক্ষা* (Knowledge & Wisdom)
    - *ইমাম নববীর ৪০ হাদিস* (Imam Nawawi's 40 Hadiths)
  - **Source Book Filter**:
    - Sahih al-Bukhari (সহিহ বুখারী)
    - Sahih Muslim (সহিহ মুসলিম)
    - Sunan an-Nasa'i (সুনান আন-নাসায়ী)
    - Jami` at-Tirmidhi (জামে আত-তিরমিজী)
    - Sunan Abi Dawud (সুনান আবু দাউদ)
    - Riyad as-Salihin (রিয়াদুস সালিহীন)
- [ ] **Interactive Hadith Card**:
  - Arabic calligraphy script (`dir="rtl"`).
  - Authentic Bengali translation.
  - English translation (bilingual view option).
  - Narrator chain / Sanad details.
  - Source book name, chapter title, and Hadith number.
  - Authenticity badge (Sahih / Hasan).
  - Quick action toolbar:
    - 🔖 Bookmark Hadith (saved to local favorites).
    - 📋 Copy formatted text with citation.
    - 📤 Share via Web Share API or native share sheet.

### 3. Data Architecture & Persistence
- [ ] **Hadith Models (`frontend/src/app/core/models/hadith.ts`)**:
  - Define `Hadith`, `HadithBook`, `HadithCategory`, `HadithFilterState`.
- [ ] **Hadith Service (`frontend/src/app/core/services/hadith.ts`)**:
  - Curated canonical dataset of 100+ highly impactful, authentic Hadiths.
  - Deterministic daily rotation engine based on calendar day (`getDailyHadith()`).
  - Search engine across Bangla text, English text, Arabic keywords, narrator, and Hadith number.
  - Bookmark service integration (`localStorage.getItem('alquran.hadith_bookmarks')`).
  - Daily modal dismissal state (`localStorage.getItem('alquran.daily_hadith_dismissed')`).

### 4. Reading Customization & Mobile Responsiveness
- [ ] Full responsiveness across mobile, tablet, and desktop.
- [ ] Dark / Light / System theme consistency using CSS custom properties (`--aq-surface`, `--aq-gold`, `--aq-primary`).
- [ ] Seamless integration with PWA offline caching.

---

## Technical Design & Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │            HadithService                     │
                    │ - Curated Authentic Hadiths Dataset          │
                    │ - Daily Rotation Algorithm (Day of Year)     │
                    │ - Category / Book Filter Engine              │
                    │ - LocalStorage Bookmarks & Dismissal State   │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │                                              │
                    ▼                                              ▼
    ┌───────────────────────────────┐              ┌───────────────────────────────┐
    │    DailyHadithModalComponent  │              │        HadithPageComponent    │
    │  - Automatic Home Popup       │              │  - Route: /hadith             │
    │  - Arabic + Bangla + Sanad    │              │  - Search & Topic Filters     │
    │  - "আরও পড়ুন" (Read More)     │              │  - Hero Featured Hadith       │
    │  - Copy & Dismiss Controls    │              │  - Paginated / Filtered List  │
    └───────────────────────────────┘              └───────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] The previous task/deed modal no longer appears automatically on the home page.
- [ ] A new Daily Hadith Modal pops up on the home page displaying a fresh Hadith each day.
- [ ] The modal displays Arabic text, Bangla translation, narrator, source book, and a prominent "আরও পড়ুন" (Read More) button.
- [ ] Clicking "আরও পড়ুন" navigates to the `/hadith` section and closes the modal.
- [ ] The user can dismiss the modal with "Don't show again today", and the choice persists in `localStorage`.
- [ ] The `/hadith` page provides categorized browsing, source book filters, and instant keyword search.
- [ ] Users can bookmark favorite Hadiths and copy formatted Hadiths to their clipboard.
- [ ] Unit test suites cover `HadithService`, `DailyHadithModalComponent`, and `HadithPageComponent`.
- [ ] Production build (`ng build`) passes with zero errors.

---

## Verification Steps

1. Open Home page (`/`):
   - Verify the previous task modal does not pop up.
   - Verify the new **Daily Hadith Modal** appears smoothly with today's Hadith.
2. Inspect Daily Hadith Modal:
   - Verify Arabic text, Bangla translation, source book, and Hadith number are visible.
   - Click "আরও পড়ুন": verify it closes the modal and navigates to `/hadith`.
3. In `/hadith`:
   - Verify categories (নামাজ, ঈমান, আখলাক, দান, ইত্যাদি) filter Hadiths accurately.
   - Test search by typing a keyword (e.g. "নিয়ত", "নামাজ", "Bukhari").
   - Test bookmarking a Hadith and copying it to clipboard.
4. Dismiss modal on Home and refresh page:
   - Verify "Don't show again today" prevents intrusive re-popups.
