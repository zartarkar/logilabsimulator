/** WebViews can retain portrait viewport dimensions after the device rotates. */
export function isLandscape({ width, height, type, legacyAngle, mediaLandscape }: {
  width: number; height: number; type?: string | undefined;
  legacyAngle?: number | undefined; mediaLandscape: boolean;
}) {
  return width > height || mediaLandscape || type?.startsWith("landscape") === true ||
    (typeof legacyAngle === "number" && Math.abs(legacyAngle) % 180 === 90);
}
