"use client";

import { useTranslations } from "next-intl";

import { ErrorWidget } from "@/features/error-widget";

/**
 * Shown when this page or a nested one throws.
 * `retry()` tries to render it again.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("Error");

  return (
    <ErrorWidget
      action={{
        kind: "button",
        label: t("tryAgain"),
        onPress: retry,
      }}
      description={t("description")}
      digest={error.digest}
      title={t("title")}
    />
  );
}
