import type { LearningPath } from "@/types";

const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const paths: LearningPath[] = [
  {
    id: "p-frontend", slug: "frontend-developer", accent: "#5233e8", level: "beginner", weeks: 20,
    image: img("1498050108023-c5249f4df085"),
    title: { ar: "مطوّر واجهات أمامية", en: "Frontend Developer" },
    description: { ar: "من HTML إلى تطبيقات ريأكت بتايب سكربت — مسار كامل لأول وظيفة لك.", en: "From HTML to React with TypeScript — a complete route to your first job." },
    stages: [
      { id: "p1-1", courseSlug: "web-foundations-html-css", title: { ar: "أساسيات الويب", en: "Web foundations" }, description: { ar: "هيكلة الصفحات وتنسيقها.", en: "Structure and style pages." } },
      { id: "p1-2", courseSlug: "modern-javascript-masterclass", title: { ar: "جافاسكربت", en: "JavaScript" }, description: { ar: "المنطق والتفاعل.", en: "Logic and interactivity." } },
      { id: "p1-3", courseSlug: "react-from-scratch", title: { ar: "ريأكت", en: "React" }, description: { ar: "واجهات مبنية بالمكونات.", en: "Component-driven interfaces." } },
      { id: "p1-4", courseSlug: "typescript-essentials", title: { ar: "تايب سكربت", en: "TypeScript" }, description: { ar: "كود أكثر أمانًا.", en: "Safer code." } },
    ],
  },
  {
    id: "p-product-design", slug: "product-designer", accent: "#ff5c3a", level: "intermediate", weeks: 14,
    image: img("1561070791-2526d30994b5"),
    title: { ar: "مصمم منتجات رقمية", en: "Product Designer" },
    description: { ar: "تعلّم التصميم من البحث إلى الهوية والنماذج الأولية.", en: "Learn design from research to identity and prototypes." },
    stages: [
      { id: "p2-1", courseSlug: "brand-identity-from-zero", title: { ar: "الهوية", en: "Identity" }, description: { ar: "الأسس البصرية للعلامة.", en: "The visual foundations of a brand." } },
      { id: "p2-2", courseSlug: "ui-ux-design-bootcamp", title: { ar: "تجربة المستخدم", en: "UX & UI" }, description: { ar: "البحث والتصميم والنماذج.", en: "Research, design and prototypes." } },
      { id: "p2-3", courseSlug: "web-foundations-html-css", title: { ar: "التنفيذ", en: "Implementation" }, description: { ar: "فهم ما يمكن بناؤه.", en: "Know what can be built." } },
    ],
  },
  {
    id: "p-ai", slug: "ai-practitioner", accent: "#2db4ff", level: "intermediate", weeks: 12,
    image: img("1677442136019-21780ecad995"),
    title: { ar: "ممارس الذكاء الاصطناعي", en: "AI Practitioner" },
    description: { ar: "من فهم النماذج إلى تحليل البيانات وبناء أتمتة ذكية.", en: "From understanding models to data analysis and smart automation." },
    stages: [
      { id: "p3-1", courseSlug: "python-for-beginners", title: { ar: "بايثون", en: "Python" }, description: { ar: "لغة الذكاء الاصطناعي.", en: "The language of AI." } },
      { id: "p3-2", courseSlug: "ai-for-everyone-practical", title: { ar: "الذكاء الاصطناعي", en: "Applied AI" }, description: { ar: "النماذج والتعليمات.", en: "Models and prompts." } },
      { id: "p3-3", courseSlug: "data-science-with-python", title: { ar: "علم البيانات", en: "Data science" }, description: { ar: "التحليل والنمذجة.", en: "Analysis and modeling." } },
    ],
  },
  {
    id: "p-growth", slug: "growth-marketer", accent: "#d6338a", level: "beginner", weeks: 10,
    image: img("1460925895917-afdab827c52f"),
    title: { ar: "خبير نمو وتسويق", en: "Growth Marketer" },
    description: { ar: "ابنِ مشروعًا وسوّقه بالبيانات والمحتوى.", en: "Build a venture and market it with data and content." },
    stages: [
      { id: "p4-1", courseSlug: "startup-business-fundamentals", title: { ar: "الفكرة", en: "The idea" }, description: { ar: "اختبار السوق.", en: "Test the market." } },
      { id: "p4-2", courseSlug: "digital-marketing-playbook", title: { ar: "التسويق", en: "Marketing" }, description: { ar: "قنوات النمو.", en: "Growth channels." } },
      { id: "p4-3", courseSlug: "sql-for-data-people", title: { ar: "القياس", en: "Measurement" }, description: { ar: "استعلم عن بياناتك.", en: "Query your data." } },
    ],
  },
];
