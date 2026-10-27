import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { ForgotForm } from "@/components/auth/AuthForms";

export async function generateMetadata({ params }: PageProps<"/[lang]/forgot-password">) {
  return privateMeta(params, "/forgot-password", "auth.forgot.title", "auth.forgot.sub");
}

export default async function Page({ params }: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <ForgotForm />;
}
