import { describe, expect, it } from "vitest";
import { isLandscape } from "../logic/mobileOrientation";

describe("mobile rotation detection", () => {
  const portrait = { width: 390, height: 844, mediaLandscape: false };
  it("recognizes device rotation even when the WebView keeps a portrait viewport", () => {
    expect(isLandscape({ ...portrait, type: "landscape-primary" })).toBe(true);
    expect(isLandscape({ ...portrait, type: "landscape-secondary" })).toBe(true);
    expect(isLandscape({ ...portrait, legacyAngle: 90 })).toBe(true);
    expect(isLandscape({ ...portrait, legacyAngle: -90 })).toBe(true);
  });
  it("supports viewport and media-query fallbacks without an orientation API", () => {
    expect(isLandscape(portrait)).toBe(false);
    expect(isLandscape({ ...portrait, legacyAngle: 180 })).toBe(false);
    expect(isLandscape({ ...portrait, mediaLandscape: true })).toBe(true);
    expect(isLandscape({ ...portrait, width: 844, height: 390 })).toBe(true);
  });
});
