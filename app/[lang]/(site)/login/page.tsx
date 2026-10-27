import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { LoginForm } from "@/components/auth/AuthForms";

export async function generateMetadata({ params }: PageProps<"/[lang]/login">) {
  return privateMeta(params, "/login", "auth.login.title", "auth.login.sub");
}

export default async function Page({ params }: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <LoginForm />;
}
