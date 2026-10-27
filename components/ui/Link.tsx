"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/** next/link that prefixes the active locale. External URLs / hashes / mailto pass through untouched. */
export function Link({ href, ...rest }: Props) {
  const { h } = useI18n();
  const external = /^(https?:)?\/\//.test(href);
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...(rest as object)} />;
  }
  return <NextLink href={h(href)} {...rest} />;
}
