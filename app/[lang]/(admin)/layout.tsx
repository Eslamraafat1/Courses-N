import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

/** Admin is a UI preview: never indexed, never followed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: LayoutProps<"/[lang]">) {
  return <AdminShell>{children}</AdminShell>;
}
