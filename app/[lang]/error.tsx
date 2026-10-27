"use client";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section role="alert" className="container-x grid min-h-[70dvh] place-items-center py-20 text-center">
      <div>
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-coral/15 text-coral">
          <TriangleAlert className="size-9" aria-hidden />
        </div>
        <h1 className="hd-2">{t("err.500.title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">{t("err.500.body")}</p>
        {error.digest && (
          <p className="mt-3 text-sm text-muted">
            {t("err.code")}: <code className="ltr-run font-mono">{error.digest}</code>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>{t("act.retry")}</Button>
          <Button href="/" variant="outline">{t("act.goHome")}</Button>
        </div>
      </div>
    </section>
  );
}
