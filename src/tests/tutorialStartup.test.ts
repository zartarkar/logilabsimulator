import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  drive: vi.fn(),
  landscape: false,
  targetVisible: true,
  config: null as any,
  destroy: vi.fn(),
}));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useCallback: (callback: unknown) => callback,
  useRef: (current: unknown) => ({ current }),
  useEffect: (effect: () => void | (() => void)) => state.effects.push(effect),
  useImperativeHandle: () => {},
}));
vi.mock("driver.js", () => ({ driver: (config: unknown) => { state.config = config; return { drive: state.drive, destroy: state.destroy }; } }));
vi.mock("@/i18n", () => ({ useLang: () => ({ lang: "en", t: (key: string) => key }) }));
import { TutorialDialog } from "../components/TutorialDialog";

function mount() {
  const onStarted = vi.fn();
  const onSelectTab = vi.fn();
  const render = (TutorialDialog as unknown as { render: (props: unknown, ref: null) => unknown }).render;
  render({ hideTrigger: true, autoStart: "simulator", onAutoStarted: onStarted, onSelectTab }, null);
  const setup = () => state.effects.map(effect => effect());
  return { onStarted, onSelectTab, setup };
}

beforeEach(() => {
  vi.useFakeTimers();
  state.effects = [];
  state.drive.mockClear();
  state.landscape = false;
  state.targetVisible = true;
  vi.stubGlobal("window", globalThis);
  vi.stubGlobal("dispatchEvent", vi.fn());
  vi.stubGlobal("document", { querySelector: (selector: string) => selector.includes("landscape-title")
    ? (state.landscape ? {} : null)
    : (state.targetVisible ? { getClientRects: () => [1] } : null) });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("automatic guide startup", () => {
  it("survives effect cleanup and replay without losing the request", () => {
    const { setup, onStarted, onSelectTab } = mount();
    const cleanup = setup();
    expect(onStarted).not.toHaveBeenCalled();
    cleanup.forEach(stop => stop?.());
    setup();
    vi.runAllTimers();
    expect(state.drive).toHaveBeenCalledExactlyOnceWith(0);
    expect(onStarted).toHaveBeenCalledOnce();
    expect(onSelectTab.mock.calls.every(([tab]) => tab === "concepts")).toBe(true);
  });

  it("keeps the request pending until the orientation prompt clears", () => {
    state.landscape = true;
    const { setup, onStarted } = mount();
    setup();
    vi.advanceTimersByTime(700);
    expect(state.drive).not.toHaveBeenCalled();
    expect(onStarted).not.toHaveBeenCalled();
    state.landscape = false;
    vi.runAllTimers();
    expect(state.drive).toHaveBeenCalledExactlyOnceWith(0);
    expect(onStarted).toHaveBeenCalledOnce();
  });

  it("cancels startup when the guide unmounts", () => {
    const { setup, onStarted } = mount();
    setup().forEach(stop => stop?.());
    vi.runAllTimers();
    expect(state.drive).not.toHaveBeenCalled();
    expect(onStarted).not.toHaveBeenCalled();
  });
});


describe("guide screen matching", () => {
  it("waits for the requested screen before showing each instruction", () => {
    const { setup, onSelectTab } = mount();
    setup();
    vi.runAllTimers();
    for (let index = 1; index < 16; index++) {
      state.drive.mockClear();
      state.targetVisible = false;
      state.landscape = true;
      state.config.onNextClick(undefined, undefined, { driver: { getActiveIndex: () => index - 1 } });
      vi.advanceTimersByTime(500);
      expect(state.drive).not.toHaveBeenCalled();
      expect(onSelectTab).toHaveBeenLastCalledWith(index < 5 ? "concepts" : index < 11 ? "simulator" : "builder");
      state.landscape = false;
      if (index < 15) {
        vi.advanceTimersByTime(200);
        expect(state.drive).not.toHaveBeenCalled();
      }
      state.targetVisible = true;
      vi.runAllTimers();
      expect(state.drive).toHaveBeenCalledExactlyOnceWith(index);
    }
  });

  it("returns to the matching workspace on Previous and removes the overlay on unmount", () => {
    const { setup, onSelectTab } = mount();
    const cleanups = setup();
    vi.runAllTimers();
    state.config.onPrevClick(undefined, undefined, { driver: { getActiveIndex: () => 11 } });
    vi.runAllTimers();
    expect(onSelectTab).toHaveBeenLastCalledWith("simulator");
    expect(state.drive).toHaveBeenLastCalledWith(10);
    cleanups.forEach(stop => stop?.());
    expect(state.destroy).toHaveBeenCalled();
  });
});
