import type { L } from "@/types";

export interface LegalSection {
  id: string;
  title: L;
  body: L[];
}

/** SAMPLE template text. Must be reviewed by qualified counsel before real use. */
export const LEGAL_UPDATED = "2026-10-01";

export const privacySections: LegalSection[] = [
  { id: "overview", title: { ar: "نظرة عامة", en: "Overview" }, body: [
    { ar: "توضح هذه الوثيقة النموذجية كيف قد تتعامل منصة تعليمية مع البيانات. هذه النسخة تجريبية ولا تجمع بيانات على خادم.", en: "This sample document describes how a learning platform might handle data. This demo version does not collect data on any server." },
  ] },
  { id: "data-we-handle", title: { ar: "البيانات التي نتعامل معها", en: "Data we handle" }, body: [
    { ar: "في النسخة التجريبية تُحفظ تفضيلاتك وتقدمك وقائمة رغباتك وملاحظاتك في التخزين المحلي لمتصفحك فقط.", en: "In the demo, your preferences, progress, wishlist and notes are stored in your browser's local storage only." },
    { ar: "في نسخة إنتاجية قد تشمل البيانات الاسم والبريد وسجل التعلم وبيانات الدفع عبر مزوّد مرخّص.", en: "A production version could include name, email, learning history and payment data via a licensed provider." },
  ] },
  { id: "use", title: { ar: "كيف نستخدم البيانات", en: "How data is used" }, body: [
    { ar: "لتشغيل الخدمة وتخصيص التجربة وحفظ التقدم والرد على الرسائل.", en: "To operate the service, personalise the experience, save progress and answer messages." },
  ] },
  { id: "third-parties", title: { ar: "أطراف ثالثة", en: "Third parties" }, body: [
    { ar: "تُعرض فيديوهات من مزوّدين خارجيين مثل يوتيوب، وقد تطبّق هذه الجهات سياسات خصوصية خاصة بها.", en: "Videos are embedded from external providers such as YouTube, which may apply their own privacy policies." },
  ] },
  { id: "retention", title: { ar: "الاحتفاظ بالبيانات", en: "Retention" }, body: [
    { ar: "يمكنك حذف بيانات التخزين المحلي في أي وقت من إعدادات المتصفح.", en: "You can delete local storage data at any time from your browser settings." },
  ] },
  { id: "rights", title: { ar: "حقوقك", en: "Your rights" }, body: [
    { ar: "بحسب القانون المطبّق قد يحق لك الاطلاع على بياناتك وتصحيحها وحذفها. يجب تحديد هذه الحقوق بدقة بعد مراجعة قانونية.", en: "Depending on applicable law you may have rights to access, correct and delete your data. These must be specified precisely after legal review." },
  ] },
  { id: "contact", title: { ar: "التواصل", en: "Contact" }, body: [
    { ar: "للاستفسارات استخدم صفحة التواصل. عنوان الشركة وبيانات المسؤول عن الخصوصية يجب إضافتها قبل الإطلاق.", en: "For questions use the contact page. The company address and privacy officer details must be added before launch." },
  ] },
];

export const termsSections: LegalSection[] = [
  { id: "acceptance", title: { ar: "قبول الشروط", en: "Acceptance of terms" }, body: [
    { ar: "باستخدامك هذه النسخة التجريبية فإنك توافق على أنها لأغراض العرض فقط.", en: "By using this demo you agree it is provided for demonstration purposes only." },
  ] },
  { id: "accounts", title: { ar: "الحسابات", en: "Accounts" }, body: [
    { ar: "لا تتوفر حسابات فعلية حاليًا. عند توفرها ستكون مسؤولًا عن سرية بيانات دخولك.", en: "No real accounts exist at the moment. When available, you will be responsible for keeping your credentials confidential." },
  ] },
  { id: "content", title: { ar: "المحتوى والملكية", en: "Content & ownership" }, body: [
    { ar: "المحتوى التعليمي المعروض مثال توضيحي، وتبقى حقوق الفيديوهات الخارجية لأصحابها.", en: "Learning content shown is illustrative, and rights to external videos remain with their owners." },
  ] },
  { id: "acceptable-use", title: { ar: "الاستخدام المقبول", en: "Acceptable use" }, body: [
    { ar: "يُمنع إساءة استخدام الخدمة أو محاولة اختراقها أو نسخ محتواها بشكل مخالف.", en: "You may not abuse the service, attempt to breach it, or copy its content in violation of these terms." },
  ] },
  { id: "payments", title: { ar: "الدفع والاسترداد", en: "Payments & refunds" }, body: [
    { ar: "الدفع غير مفعّل. ستُحدَّد شروط الدفع والاسترداد عند ربط مزوّد دفع.", en: "Payments are not enabled. Payment and refund terms will be defined when a provider is connected." },
  ] },
  { id: "liability", title: { ar: "حدود المسؤولية", en: "Limitation of liability" }, body: [
    { ar: "تُقدَّم الخدمة كما هي دون ضمانات. صياغة حدود المسؤولية تحتاج مراجعة قانونية.", en: "The service is provided as is, without warranties. The wording of liability limits requires legal review." },
  ] },
  { id: "changes", title: { ar: "التعديلات", en: "Changes" }, body: [
    { ar: "قد تُحدَّث هذه الشروط، وسيظهر تاريخ آخر تحديث أعلى الصفحة.", en: "These terms may be updated; the last-updated date appears at the top of the page." },
  ] },
];
