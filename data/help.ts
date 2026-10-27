import type { L } from "@/types";

export interface HelpTopic {
  id: string;
  q: L;
  a: L;
}
export interface HelpCategory {
  id: string;
  icon: string;
  title: L;
  description: L;
  topics: HelpTopic[];
}

/** Demo help center content. */
export const helpCategories: HelpCategory[] = [
  {
    id: "start", icon: "Rocket",
    title: { ar: "البدء", en: "Getting started" },
    description: { ar: "الخطوات الأولى على المنصة.", en: "Your first steps on the platform." },
    topics: [
      { id: "h-browse", q: { ar: "كيف أجد كورسًا مناسبًا؟", en: "How do I find the right course?" }, a: { ar: "افتح صفحة الكورسات واستخدم التصنيفات أو البحث، أو اتبع مسار تعلم جاهزًا يرتّب الكورسات لك.", en: "Open the courses page and use categories or search, or follow a ready-made learning path that orders courses for you." } },
      { id: "h-account", q: { ar: "هل أحتاج إلى حساب؟", en: "Do I need an account?" }, a: { ar: "في هذه النسخة التجريبية لا توجد حسابات حقيقية. صفحات الدخول والتسجيل واجهات فقط، ويُحفظ تقدمك في متصفحك.", en: "This demo has no real accounts. Sign-in and sign-up pages are interface only, and your progress is kept in your browser." } },
      { id: "h-language", q: { ar: "كيف أغيّر اللغة أو المظهر؟", en: "How do I change language or theme?" }, a: { ar: "من أزرار الشريط العلوي: تبديل اللغة بين العربية والإنجليزية، وتبديل المظهر الفاتح والداكن.", en: "Use the buttons in the top bar to switch between Arabic and English and between light and dark themes." } },
    ],
  },
  {
    id: "learning", icon: "GraduationCap",
    title: { ar: "التعلّم", en: "Learning" },
    description: { ar: "الدروس والتقدم والملاحظات.", en: "Lessons, progress and notes." },
    topics: [
      { id: "h-progress", q: { ar: "أين يُحفظ تقدمي؟", en: "Where is my progress saved?" }, a: { ar: "في التخزين المحلي لمتصفحك فقط. لن يظهر على جهاز آخر، وقد يُحذف إذا مسحت بيانات الموقع.", en: "In your browser's local storage only. It will not appear on another device and may be removed if you clear site data." } },
      { id: "h-resume", q: { ar: "كيف أكمل من حيث توقفت؟", en: "How do I resume where I stopped?" }, a: { ar: "افتح الكورس من لوحة التعلّم أو من قسم متابعة التعلم، وسيفتح آخر درس شاهدته.", en: "Open the course from your dashboard or the continue-learning section and it opens the last lesson you viewed." } },
      { id: "h-videos", q: { ar: "لماذا لا يعمل الفيديو؟", en: "Why won't a video play?" }, a: { ar: "الفيديوهات تُحمَّل من مزوّدين خارجيين. تأكد من اتصالك أو افتح الفيديو على الموقع الأصلي من الرابط البديل.", en: "Videos load from external providers. Check your connection or open the video on the original site using the fallback link." } },
    ],
  },
  {
    id: "certificates", icon: "Award",
    title: { ar: "الشهادات", en: "Certificates" },
    description: { ar: "الإتمام والإثبات.", en: "Completion and proof." },
    topics: [
      { id: "h-cert", q: { ar: "هل تصدر شهادات حقيقية؟", en: "Are real certificates issued?" }, a: { ar: "لا. صفحة الشهادة معاينة تصميمية، ولا تُولَّد شهادات موثقة قبل وجود خادم حقيقي.", en: "No. The certificate page is a design preview and no verifiable certificates are generated until a real backend exists." } },
      { id: "h-complete", q: { ar: "متى يُعتبر الكورس مكتملًا؟", en: "When is a course considered complete?" }, a: { ar: "عندما تُعلّم كل دروسه كمكتملة في مشغّل الدروس.", en: "When every lesson is marked complete in the lesson player." } },
    ],
  },
  {
    id: "billing", icon: "CreditCard",
    title: { ar: "الخطط والدفع", en: "Plans & billing" },
    description: { ar: "الأسعار والاشتراكات.", en: "Pricing and subscriptions." },
    topics: [
      { id: "h-pay", q: { ar: "هل يمكنني الاشتراك الآن؟", en: "Can I subscribe right now?" }, a: { ar: "لا. صفحة الأسعار للعرض فقط ولم يُربط مزوّد دفع، لذلك لا يتم أي خصم.", en: "No. The pricing page is for display only and no payment provider is connected, so nothing is ever charged." } },
      { id: "h-refund", q: { ar: "ما سياسة الاسترداد؟", en: "What is the refund policy?" }, a: { ar: "ستُحدَّد عند تفعيل الدفع. الوثائق القانونية الحالية نماذج تحتاج مراجعة قانونية.", en: "It will be defined once payments are enabled. The current legal documents are templates that need legal review." } },
    ],
  },
];
