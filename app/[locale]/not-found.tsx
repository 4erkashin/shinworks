import { useTranslations } from "next-intl";

import { ErrorWidget } from "@/features/error-widget";

/**
 * UI for a missing page. Next.js renders this when no route matches, or when
 * a server component calls notFound(). It is the 404 for this segment.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <ErrorWidget
      action={{
        href: "/",
        kind: "link",
        label: t("home"),
      }}
      description={t("description")}
      title={t("title")}
    />
  );
}
