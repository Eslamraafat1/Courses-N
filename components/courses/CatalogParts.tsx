"use client";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { CourseCardSkeleton, ErrorState } from "@/components/ui/Primitives";
import { useI18n } from "@/components/providers/I18nProvider";

/** Skeleton grid used as the Suspense fallback and for the simulated first load. */
export function CatalogSkeleton({ count = 6, list = false }: { count?: number; list?: boolean }) {
  const { t } = useI18n();
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">{t("catalog.loading")}</p>
      <div className={list ? "grid gap-5" : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"}>
        {Array.from({ length: count }, (_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function Fallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return <ErrorState title={t("catalog.error.title")} body={t("catalog.error.body")} onRetry={onRetry} />;
}

interface BoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}
interface BoundaryState {
  failed: boolean;
}

/** Catches render errors of the results area so a bad card never takes the whole page down; Retry re-mounts the children. */
export class CatalogErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[catalog]", error, info.componentStack);
  }
  retry = () => {
    this.props.onReset?.();
    this.setState({ failed: false });
  };
  render() {
    return this.state.failed ? <Fallback onRetry={this.retry} /> : this.props.children;
  }
}

export { Fallback as CatalogError };
