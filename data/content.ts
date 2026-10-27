import type { FaqItem, NotificationItem, Partner, Plan, Post, Review, Testimonial } from "@/types";

const u = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const partners: Partner[] = ["Lumio", "Vertex", "Northwind", "Aether", "Quanta", "Helix", "Orbitly", "Pixelcraft", "Nimbus", "Stellar"].map((name, i) => ({ id: `pt-${i}`, name }));

/** Demo figures — the UI labels them as such. `courses`/`instructors` are derived from real data in lib/api. */
export const stats = [
  { id: "courses", value: 14, suffix: "", label: { ar: "كورسًا تجريبيًا", en: "demo courses" } },
  { id: "students", value: 4200, suffix: "+", label: { ar: "طالب (رقم تجريبي)", en: "students (demo figure)" } },
  { id: "instructors", value: 6, suffix: "", label: { ar: "مدرسين", en: "instructors" } },
  { id: "hours", value: 160, suffix: "+", label: { ar: "ساعة محتوى (تجريبي)", en: "content hours (demo)" } },
];

export const reviews: Review[] = [
  { id: "r1", courseSlug: "modern-javascript-masterclass", author: { ar: "نور الهدى", en: "Nour Alhuda" }, avatar: u("1494790108377-be9c29b29330", 200), rating: 5, date: "2026-09-12", text: { ar: "شرح مبسّط ومنظّم، وأخيرًا فهمت async/await بشكل حقيقي.", en: "Simple, well-structured teaching — I finally truly understand async/await." } },
  { id: "r2", courseSlug: "modern-javascript-masterclass", author: { ar: "مصطفى علي", en: "Mostafa Ali" }, avatar: u("1500648767791-00dcc994a43e", 200), rating: 5, date: "2026-08-02", text: { ar: "المشاريع التطبيقية رائعة وبنيت منها محفظتي.", en: "The hands-on projects are great — I built my portfolio from them." } },
  { id: "r3", courseSlug: "react-from-scratch", author: { ar: "ريم السيد", en: "Reem Elsayed" }, avatar: u("1438761681033-6461ffad8d80", 200), rating: 4, date: "2026-09-01", text: { ar: "كورس عميق، ويحتاج تركيزًا لكنه يستحق.", en: "A deep course that demands focus, but absolutely worth it." } },
  { id: "r4", courseSlug: "ui-ux-design-bootcamp", author: { ar: "هاني بدر", en: "Hani Badr" }, avatar: u("1472099645785-5658abf4ff4e", 200), rating: 5, date: "2026-07-21", text: { ar: "غيّر طريقة تفكيري في التصميم تمامًا.", en: "Completely changed the way I think about design." } },
  { id: "r5", courseSlug: "ai-for-everyone-practical", author: { ar: "دعاء محمود", en: "Doaa Mahmoud" }, avatar: u("1573496359142-b8d87734a5a2", 200), rating: 5, date: "2026-10-03", text: { ar: "وفّر عليّ ساعات أسبوعيًا بعد تطبيق الأتمتة.", en: "Saved me hours every week once I applied the automations." } },
  { id: "r6", courseSlug: "ai-for-everyone-practical", author: { ar: "يوسف طارق", en: "Youssef Tarek" }, avatar: u("1507003211169-0a1dd7228f2d", 200), rating: 4, date: "2026-09-27", text: { ar: "محتوى عملي وبعيد عن التعقيد.", en: "Practical content, free of unnecessary complexity." } },
  { id: "r7", courseSlug: "python-for-beginners", author: { ar: "سارة خالد", en: "Sara Khaled" }, avatar: u("1494790108377-be9c29b29330", 200), rating: 5, date: "2026-05-15", text: { ar: "أفضل بداية ممكنة لمن لا يعرف البرمجة.", en: "The best possible start for someone new to code." } },
];

export const testimonials: Testimonial[] = [
  { id: "t1", name: { ar: "ليلى منصور", en: "Layla Mansour" }, role: { ar: "مصممة واجهات", en: "UI Designer" }, avatar: u("1494790108377-be9c29b29330", 300), quote: { ar: "حصلت على وظيفتي الأولى في التصميم بعد إكمال المسار وبناء مشروع التخرج.", en: "I landed my first design job after finishing the path and building the capstone." }, outcome: { ar: "وظيفة جديدة خلال 3 أشهر", en: "New job in 3 months" } },
  { id: "t2", name: { ar: "خالد عبد الله", en: "Khaled Abdullah" }, role: { ar: "مطوّر ويب", en: "Web Developer" }, avatar: u("1500648767791-00dcc994a43e", 300), quote: { ar: "الأسلوب السينمائي في الشرح جعلني أستمتع بالتعلم وأكمل ما بدأت.", en: "The cinematic teaching style made learning fun — and I actually finished." }, outcome: { ar: "أنهى 4 كورسات", en: "Completed 4 courses" } },
  { id: "t3", name: { ar: "جنى حسن", en: "Jana Hassan" }, role: { ar: "مسوّقة رقمية", en: "Digital Marketer" }, avatar: u("1438761681033-6461ffad8d80", 300), quote: { ar: "طبّقت الاستراتيجيات فضاعفت زيارات موقع عميلي خلال شهرين.", en: "I applied the strategies and doubled a client's traffic in two months." }, outcome: { ar: "نمو 2x في الزيارات", en: "2x traffic growth" } },
  { id: "t4", name: { ar: "إياد سمير", en: "Eyad Samir" }, role: { ar: "محلل بيانات", en: "Data Analyst" }, avatar: u("1472099645785-5658abf4ff4e", 300), quote: { ar: "SQL وبايثون هنا كانا الجسر من الفضول إلى الاحتراف.", en: "SQL and Python here were the bridge from curiosity to a profession." }, outcome: { ar: "ترقية إلى محلل أول", en: "Promoted to senior analyst" } },
];

export const posts: Post[] = [
  { id: "b1", slug: "how-to-learn-faster", image: u("1522202176988-66273c2fd55f", 1200), readMinutes: 6, date: "2026-10-05",
    title: { ar: "كيف تتعلم أسرع دون أن ترهق نفسك؟", en: "How to learn faster without burning out" },
    excerpt: { ar: "خمس عادات صغيرة تضاعف الاستيعاب وتحافظ على حماسك.", en: "Five small habits that multiply retention and keep you motivated." },
    author: { ar: "فريق نيكسورا", en: "The Nexora team" }, tag: { ar: "التعلم", en: "Learning" },
    body: [
      { ar: "التعلم ليس سباقًا، بل نظام. ابدأ بجلسات قصيرة مركّزة بدل ماراثونات طويلة.", en: "Learning isn't a sprint, it's a system. Start with short focused sessions instead of long marathons." },
      { ar: "اكتب ما تعلّمته بكلماتك. الشرح يكشف الثغرات في فهمك أسرع من أي اختبار.", en: "Write what you learned in your own words. Explaining exposes gaps faster than any quiz." },
      { ar: "راجع بعد يوم، ثم أسبوع، ثم شهر. التكرار المتباعد يثبّت المعرفة.", en: "Review after a day, a week, then a month. Spaced repetition locks knowledge in." },
    ] },
  { id: "b2", slug: "choosing-your-first-language", image: u("1555066931-4365d14bab8c", 1200), readMinutes: 5, date: "2026-09-18",
    title: { ar: "أي لغة برمجة تبدأ بها؟", en: "Which programming language should you start with?" },
    excerpt: { ar: "دليل سريع لاختيار لغتك الأولى بحسب هدفك.", en: "A quick guide to choosing your first language by goal." },
    author: { ar: "عمر حداد", en: "Omar Haddad" }, tag: { ar: "برمجة", en: "Programming" },
    body: [
      { ar: "إن كنت تريد بناء مواقع فابدأ بجافاسكربت، وإن كنت تحب البيانات فبايثون خيار ممتاز.", en: "If you want to build websites, start with JavaScript; if data excites you, Python is a great pick." },
      { ar: "اللغة أقل أهمية من الاستمرار. اختر واحدة وابنِ بها شيئًا حقيقيًا.", en: "The language matters less than consistency. Pick one and build something real." },
    ] },
  { id: "b3", slug: "design-systems-101", image: u("1561070791-2526d30994b5", 1200), readMinutes: 7, date: "2026-08-29",
    title: { ar: "نظم التصميم: لماذا تحتاجها فرقك؟", en: "Design systems: why your team needs one" },
    excerpt: { ar: "اتساق أعلى وسرعة أكبر وأخطاء أقل.", en: "More consistency, more speed, fewer mistakes." },
    author: { ar: "لينا فاروق", en: "Lina Farouk" }, tag: { ar: "تصميم", en: "Design" },
    body: [
      { ar: "نظام التصميم مكتبة قرارات وليس مكتبة مكونات فقط.", en: "A design system is a library of decisions, not just components." },
      { ar: "ابدأ صغيرًا: ألوان، طباعة، تباعد، ثم زر واحد جيد.", en: "Start small: color, type, spacing, then one really good button." },
    ] },
  { id: "b4", slug: "ai-tools-for-everyday-work", image: u("1677442136019-21780ecad995", 1200), readMinutes: 4, date: "2026-10-20",
    title: { ar: "أدوات الذكاء الاصطناعي في عملك اليومي", en: "AI tools for everyday work" },
    excerpt: { ar: "أين تفيدك فعلًا، وأين تحتاج لمراجعتك؟", en: "Where they truly help, and where they need your review." },
    author: { ar: "كريم ناصر", en: "Karim Nasser" }, tag: { ar: "ذكاء اصطناعي", en: "AI" },
    body: [
      { ar: "اعتمد على الأدوات في المسودات الأولى، واحتفظ بالقرار النهائي لنفسك.", en: "Lean on tools for first drafts; keep the final call for yourself." },
      { ar: "التعليمات الواضحة تصنع الفرق: السياق، الهدف، الشكل المطلوب.", en: "Clear prompts make the difference: context, goal, desired format." },
    ] },
];

export const plans: Plan[] = [
  { id: "free", name: { ar: "مجاني", en: "Free" }, price: 0, yearly: 0,
    tagline: { ar: "ابدأ وجرّب", en: "Start and explore" },
    features: [{ ar: "كورسات مجانية مختارة", en: "Selected free courses" }, { ar: "معاينة دروس", en: "Lesson previews" }, { ar: "تتبع التقدم", en: "Progress tracking" }] },
  { id: "pro", name: { ar: "احترافي", en: "Pro" }, price: 19, yearly: 190, highlighted: true,
    tagline: { ar: "للمتعلم الجاد", en: "For the serious learner" },
    features: [{ ar: "كل الكورسات", en: "All courses" }, { ar: "شهادات إتمام", en: "Completion certificates" }, { ar: "موارد قابلة للتنزيل", en: "Downloadable resources" }, { ar: "مجتمع نقاش", en: "Discussion community" }] },
  { id: "team", name: { ar: "الفِرَق", en: "Teams" }, price: 49, yearly: 490,
    tagline: { ar: "لشركتك أو فريقك", en: "For your company or team" },
    features: [{ ar: "كل مزايا الاحترافي", en: "Everything in Pro" }, { ar: "لوحة متابعة الفريق", en: "Team progress dashboard" }, { ar: "مسارات مخصصة", en: "Custom learning paths" }, { ar: "دعم أولوية", en: "Priority support" }] },
];

export const faqs: FaqItem[] = [
  { id: "f1", group: "general", q: { ar: "هل المنصة حقيقية أم تجريبية؟", en: "Is this a real platform or a demo?" }, a: { ar: "هذه واجهة تجريبية كاملة. لا يوجد خادم أو دفع فعلي حتى يُربط Backend.", en: "This is a complete front-end demo. There is no server or real payment until a backend is connected." } },
  { id: "f2", group: "learning", q: { ar: "كيف يُحفظ تقدّمي؟", en: "How is my progress saved?" }, a: { ar: "يُحفظ محليًا في متصفحك فقط ولا يتزامن بين الأجهزة.", en: "It's stored locally in your browser only and doesn't sync across devices." } },
  { id: "f3", group: "learning", q: { ar: "هل الفيديوهات خاصة بالمنصة؟", en: "Are the videos exclusive to the platform?" }, a: { ar: "الفيديوهات روابط تجريبية عامة من يوتيوب وفيميو لعرض المشغّل فقط.", en: "Videos are public demo links from YouTube and Vimeo, used only to showcase the player." } },
  { id: "f4", group: "billing", q: { ar: "هل يمكنني الدفع الآن؟", en: "Can I pay right now?" }, a: { ar: "لا. خطط الاشتراك للعرض فقط حتى يُربط مزوّد دفع حقيقي.", en: "No. Plans are display-only until a real payment provider is connected." } },
  { id: "f5", group: "general", q: { ar: "هل أستطيع تغيير اللغة والمظهر؟", en: "Can I change language and theme?" }, a: { ar: "نعم، من الشريط العلوي. يتم حفظ اختيارك في متصفحك.", en: "Yes, from the top bar. Your choice is remembered in your browser." } },
  { id: "f6", group: "billing", q: { ar: "هل توجد سياسة استرداد؟", en: "Is there a refund policy?" }, a: { ar: "ستُحدَّد السياسة عند تفعيل الدفع. الصفحة الحالية نموذج للعرض.", en: "The policy will be defined once payments are enabled. This page is a placeholder." } },
];

export const notifications: NotificationItem[] = [
  { id: "n1", kind: "course", read: false, time: "2026-10-26T09:00:00Z", title: { ar: "درس جديد متاح", en: "A new lesson is available" }, body: { ar: "تمت إضافة درس إلى «ريأكت من الصفر».", en: "A lesson was added to “React from Scratch”." } },
  { id: "n2", kind: "reminder", read: false, time: "2026-10-25T18:30:00Z", title: { ar: "حافظ على سلسلتك", en: "Keep your streak going" }, body: { ar: "أكمل درسًا اليوم لتحافظ على سلسلة 5 أيام.", en: "Finish a lesson today to keep your 5-day streak." } },
  { id: "n3", kind: "system", read: true, time: "2026-10-22T12:00:00Z", title: { ar: "مرحبًا بك في نيكسورا", en: "Welcome to Nexora" }, body: { ar: "هذه إشعارات تجريبية لعرض الواجهة.", en: "These are demo notifications to showcase the UI." } },
];

export const demoStudent = {
  name: { ar: "ضيف تجريبي", en: "Demo Student" },
  email: "student@example.com",
  streak: 5,
  weeklyGoalHours: 6,
  /** minutes studied, Mon → Sun */
  weeklyActivity: [35, 60, 20, 80, 55, 90, 40],
  /** demo "in progress" state used when nothing is saved locally yet */
  seedProgress: {
    "modern-javascript-masterclass": ["js-m1-l1", "js-m1-l2", "js-m1-l3", "js-m2-l1"],
    "react-from-scratch": ["react-m1-l1", "react-m1-l2"],
    "ui-ux-design-bootcamp": ["ux-m1-l1"],
  } as Record<string, string[]>,
};
