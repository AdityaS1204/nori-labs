import { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";

import NoriFaceLive from "@/components/robot-face/NoriFaceLive";
import { neutralPack, packState, parsePack, type FacePack } from "@/lib/face-pack";

/**
 * The robot's face, as served to Chromium in kiosk mode by the Python SDK.
 *
 * Deliberately dumb: it renders whichever state it is told to. Mood arbitration
 * and the auto-revert timer for transient reactions live in the SDK, so there is
 * one source of truth and it survives a page reload.
 */

declare global {
  interface Window {
    nori: {
      set: (stateId: string) => boolean;
      get: () => string;
      states: () => string[];
      ready: boolean;
    };
  }
}

const DEFAULT_WS_PORT = "8765";
const MAX_RECONNECT_MS = 10_000;

/* ── Current-state store, driven by both the socket and window.nori ── */

let currentId = "";
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
const getSnapshot = () => currentId;

function applyState(id: string): void {
  if (id === currentId) return;
  currentId = id;
  for (const listener of listeners) listener();
}

/* ── Control socket ── */

function connect(pack: FacePack): void {
  const port = new URLSearchParams(location.search).get("ws") ?? DEFAULT_WS_PORT;
  const url = `ws://${location.hostname || "localhost"}:${port}`;
  let backoff = 500;

  const open = () => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      backoff = 500;
      ws.send(
        JSON.stringify({
          type: "hello",
          pack: pack.name,
          current: currentId,
          states: pack.states.map((s) => s.id),
        }),
      );
    };

    ws.onmessage = (event) => {
      let msg: { type?: string; state?: string };
      try {
        msg = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (msg.type !== "set" || typeof msg.state !== "string") return;

      if (!packState(pack, msg.state)) {
        ws.send(JSON.stringify({ type: "error", error: `unknown state: ${msg.state}` }));
        return;
      }
      applyState(msg.state);
      ws.send(JSON.stringify({ type: "state", state: msg.state }));
    };

    // Retry forever: the face must recover on its own if the SDK restarts.
    ws.onclose = () => {
      setTimeout(open, backoff);
      backoff = Math.min(backoff * 2, MAX_RECONNECT_MS);
    };
    ws.onerror = () => ws.close();
  };

  open();
}

/* ── View ── */

function Face({ pack }: { pack: FacePack }) {
  const id = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const state = packState(pack, id) ?? pack.states[0];

  return (
    <div className="nori-stage" style={{ background: pack.background }}>
      <NoriFaceLive
        face={state.face}
        ambient={pack.ambient}
        transition={pack.transition}
        gazeMode={pack.ambient.gaze.mode}
        fit={pack.fit}
        forceMotion
        className="nori-face"
      />
    </div>
  );
}

/* ── Boot ── */

async function boot(): Promise<void> {
  let pack: FacePack;
  try {
    const response = await fetch("./pack.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`pack.json returned ${response.status}`);
    pack = parsePack(await response.json());
  } catch (err) {
    // Never leave the panel blank: a neutral face beats an error screen.
    console.error("[nori] could not load pack.json, falling back to neutral:", err);
    pack = neutralPack();
  }

  applyState(pack.defaultState);

  window.nori = {
    set: (stateId: string) => {
      if (!packState(pack, stateId)) return false;
      applyState(stateId);
      return true;
    },
    get: () => currentId,
    states: () => pack.states.map((s) => s.id),
    ready: true,
  };

  const root = document.getElementById("root");
  if (!root) throw new Error("missing #root");
  createRoot(root).render(<Face pack={pack} />);

  connect(pack);
}

void boot();
