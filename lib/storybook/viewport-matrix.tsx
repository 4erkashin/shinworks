import { type ComponentType, type ReactElement } from "react";

import { type ViewportId, viewports } from "@/tokens/generated/viewports";

import { ViewportLocaleTiles } from "./viewport-locale-tiles";

/**
 * Token size lives in each tile iframe. Locking this preview
 * iframe would clip 2K/4K again and starve the two-up grid.
 */
export const fullscreenViewportMatrix = {
  layout: "fullscreen" as const,
  viewport: {
    disable: true,
  },
};

function viewportById(id: ViewportId) {
  const viewport = viewports.find((item) => item.id === id);

  if (!viewport) {
    throw new Error(`Unknown viewport: ${id}`);
  }

  return viewport;
}

/**
 * English beside each other locale in this token viewport.
 * Short viewports stay token-sized; oversized sheets shrink
 * to the pane.
 *
 * Sidebar labels must stay string literals on the story export.
 * Storybook's indexer does not run this helper, so a name built
 * here never reaches the tree.
 */
export function viewportLocaleStory(
  Page: ComponentType,
  id: ViewportId,
): { render: () => ReactElement } {
  const viewport = viewportById(id);

  return {
    render: () => <ViewportLocaleTiles Page={Page} viewport={viewport} />,
  };
}
