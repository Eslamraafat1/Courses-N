"use client";
import { Modal } from "@/components/ui/Modal";
import { VideoEmbed } from "./VideoEmbed";
import { useI18n } from "@/components/providers/I18nProvider";
import type { VideoRequest } from "./VideoProvider";

export default function VideoModal({ request, onClose }: { request: VideoRequest | null; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Modal open={!!request} onClose={onClose} label={request?.title ?? t("video.dialog")} variant="cinema">
      {request && (
        <div className="flex min-h-0 flex-col">
          <VideoEmbed url={request.url} title={request.title} poster={request.poster} autoPlay />
          <div className="flex items-center justify-between gap-3 bg-neutral-950 px-4 py-3 text-white sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold sm:text-base">{request.title}</p>
              {request.subtitle && <p className="truncate text-xs text-white/60 sm:text-sm">{request.subtitle}</p>}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
