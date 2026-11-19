/**
 * The corner scale for the landing page. Two sizes only: controls and the
 * surfaces they sit on. Every rounded corner reads from here so the squircle
 * clip and its pre-measure `border-radius` can never drift apart.
 */
export const RADIUS = {
  /** Buttons, nav rows, anything you click. */
  control: 12,
  /** Media cards, mosaic tiles, spec grids. */
  surface: 24,
} as const;
