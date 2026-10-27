import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { RegisterForm } from "@/components/auth/AuthForms";

export async function generateMetadata({ params }: PageProps<"/[lang]/register">) {
  return privateMeta(params, "/register", "auth.register.title", "auth.register.sub");
}

export default async function Page({ params }: PageProps<"/[lang]/register">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <RegisterForm />;
}
