# Desktop App — System-Wide Computer Protection & Halal Guard Plan

> **লক্ষ্য:** আল-কুরআন উইন্ডোজ ডেস্কটপ অ্যাপের মাধ্যমে পুরো কম্পিউটারে (সকল ব্রাউজার ও অ্যাপের জন্য) ১-ক্লিকে পর্নোগ্রাফি, জুয়া ও ক্ষতিকর সাইট ব্লক করা এবং গুগল/ইউটিউব সেফ-সার্চ বাধ্যতামূলক করা।

---

## ১. প্রযুক্তিগত আর্কিটেকচার (Technical Architecture)

উইন্ডোজ অপারেটিং সিস্টেমে কোনো পেইড সফটওয়্যার ছাড়াই সিস্টেম-লেভেল ব্লকিং কার্যকর করার দুটি নির্ভরযোগ্য উপায় রয়েছে:

```
[ Electron Main Process (desktop/src/main) ]
            │
            ├── 1. IPC Controller (desktop/src/main/ipc.ts)
            │      └── toggle-system-shield (enable / disable)
            │
            ├── 2. PowerShell Network Adapter DNS Service
            │      ├── Set-DnsClientServerAddress (CleanBrowsing / Cloudflare 1.1.1.3)
            │      └── Clear-DnsClientCache (Instant DNS Flush)
            │
            └── 3. Windows Hosts File Protection (Optional Backup)
                   └── C:\Windows\System32\drivers\etc\hosts
```

---

## ২. মূল ফিচারসমূহ (Core Features)

### ক. সিস্টেম-লেভেল ফ্যামিলি ডিএনএস শিল্ড (System-Wide Family DNS)
- **সক্রিয় ডিএনএস:**
  - **CleanBrowsing Family Filter:** `185.228.168.168` এবং `185.228.169.168`
  - অথবা **Cloudflare 1.1.1.3 Family Filter:** `1.1.1.3` এবং `1.0.0.3`
- **কার্যকারিতা:**
  - কম্পিউটারের সকল ব্রাউজারে (Chrome, Edge, Firefox, Brave) যেকোনো অ্যাডাল্ট, পর্নোগ্রাফিক বা ম্যালিশিয়াস সাইট ওপেন হওয়া সাথে সাথে আটকে দেবে।
  - গুগল, বিং এবং ইউটিউবে স্বয়ংক্রিয়ভাবে **Strict SafeSearch** কার্যকর থাকবে।

### খ. ডেস্কটপ অ্যাপ ইউজার ইন্টারফেস (UI Controls)
- **সেটিংস ও হোম স্ক্রিনে নতুন কার্ড:**
  - `🛡️ সিস্টেম-লেভেল হালাল গার্ড (Halal Computer Shield)`
  - টগল সুইচ: **[সক্রিয় করুন / বন্ধ করুন]**
  - স্ট্যাটাস ব্যাজ: `🟢 কম্পিউটার সুরক্ষিত (Protected)` / `⚪ নিষ্ক্রিয় (Inactive)`
- **উইন্ডোজ সিস্টেম ট্রে (System Tray) মেনু:**
  - ট্রে আইকনে রাইট-ক্লিক মেনুতে থাকবে:
    - `🛡️ হালাল শিল্ড: চালু`
    - `🛡️ হালাল শিল্ড: বন্ধ`

### গ. নিরাপত্তা ও ইউজার পারমিশন (Safety & Permissions)
- ডিএনএস পরিবর্তনের জন্য উইন্ডোজ অ্যাডমিনিস্ট্রেটর পারমিশন প্রয়োজন হলে একটি স্পষ্ট ও মার্জিত ডায়ালগ দেখাবে।
- ইউজার চাইলে যেকোনো সময় ১-ক্লিকে আবার পূর্বের অটোমেটিক (DHCP) ডিএনএস সেটিংসে ফিরে যেতে পারবেন।

---

## ৩. ফাইল পরিবর্তন ও ইমপ্লিমেন্টেশন প্ল্যান

1. **`desktop/src/main/system-shield.ts` (নতুন ফাইল):**
   - PowerShell স্ক্রিপ্টের মাধ্যমে উইন্ডোজ অ্যাক্টিভ নেটওয়ার্ক অ্যাডাপ্টার ডিটেক্ট করা।
   - ডিএনএস সেট করা (`Set-DnsClientServerAddress`) এবং ডিএনএস ফ্লাশ করা (`Clear-DnsClientCache`)।
   - বর্তমান ডিএনএস স্ট্যাটাস রিড করে রিটার্ন করা।
2. **`desktop/src/main/ipc.ts`:**
   - নতুন আইপিসি হ্যান্ডলার: `shield:get-status`, `shield:toggle`.
3. **`desktop/src/preload/index.ts`:**
   - `window.desktopApi.toggleShield(enabled)` এবং `window.desktopApi.getShieldStatus()`.
4. **`desktop/src/main/tray.ts`:**
   - সিস্টেম ট্রে কনটেক্সট মেনুতে হালাল শিল্ড টগল অপশন যোগ।
5. **`frontend/src/app/core/services/desktop.ts`:**
   - শিল্ড স্টেট সিগন্যাল (`isShieldActive = signal<boolean>(false)`).
6. **`frontend/src/app/features/settings/settings.html`:**
   - ডেস্কটপ অ্যাপে চললে হালাল গার্ড নিয়ন্ত্রণ কার্ড প্রদর্শন।

---

## ৪. টেস্ট ও ভেরিফিকেশন মানদণ্ড
- [ ] উইন্ডোজে শিল্ড অন করলে ডিএনএস সঠিক আইপিতে সেট হচ্ছে কি না।
- [ ] টেস্ট অ্যাডাল্ট ডোমেইন ও গুগলে সেফ-সার্চ লক কার্যকর হচ্ছে কি না।
- [ ] শিল্ড বন্ধ করলে পুনরায় সাধারণ ডিএনএস ফিরে আসছে কি না।
- [ ] সিস্টেম ট্রে থেকে সরাসরি টগল কাজ করছে কি না।
