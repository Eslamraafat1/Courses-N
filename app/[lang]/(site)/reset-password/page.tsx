import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n/config";
import { privateMeta } from "@/components/dashboard/privateMeta";
import { ResetForm } from "@/components/auth/AuthForms";

export async function generateMetadata({ params }: PageProps<"/[lang]/reset-password">) {
  return privateMeta(params, "/reset-password", "auth.reset.title", "auth.reset.sub");
}

export default async function Page({ params }: PageProps<"/[lang]/reset-password">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <ResetForm />;
}
