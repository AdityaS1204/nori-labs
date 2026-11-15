/**
 * Turn whatever the user pastes into the custom-eye field — a full `<svg>`,
 * a `<path>`/`<rect>`/`<circle>`/… tag, or a bare path `d` — into a clean path
 * `d` plus its measured bounding box. The box lets the renderer auto-fit the
 * path into the eye regardless of the coordinate system it was authored in.
 *
 * Basic shapes are converted to path geometry (not rendered as raw markup), so
 * what we store and later show to other viewers is pure geometry — no scripts
 * or event handlers ride along.
 *
 * Browser-only (uses DOMParser + getBBox); callers run it from client events.
 */

export interface NormalizedSvg {
  /** A bare path `d` (may be empty if nothing usable was found). */
  d: string;
  /** Measured [x, y, width, height] of `d`, when it could be measured. */
  viewBox?: [number, number, number, number];
}

const num = (el: Element, attr: string, fallback = 0): number => {
  const v = parseFloat(el.getAttribute(attr) ?? "");
  return Number.isFinite(v) ? v : fallback;
};

/** Convert one SVG element to a path `d` (empty string if unsupported). */
function elementToPath(el: Element): string {
  switch (el.tagName.toLowerCase()) {
    case "path":
      return el.getAttribute("d")?.trim() ?? "";
    case "rect": {
      const x = num(el, "x");
      const y = num(el, "y");
      const w = num(el, "width");
      const h = num(el, "height");
      if (w <= 0 || h <= 0) return "";
      let rx = num(el, "rx", NaN);
      let ry = num(el, "ry", NaN);
      if (!Number.isFinite(rx)) rx = Number.isFinite(ry) ? ry : 0;
      if (!Number.isFinite(ry)) ry = rx;
      rx = Math.min(rx, w / 2);
      ry = Math.min(ry, h / 2);
      if (rx <= 0 || ry <= 0) {
        return `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
      }
      return (
        `M${x + rx} ${y} H${x + w - rx} A${rx} ${ry} 0 0 1 ${x + w} ${y + ry} ` +
        `V${y + h - ry} A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h} ` +
        `H${x + rx} A${rx} ${ry} 0 0 1 ${x} ${y + h - ry} ` +
        `V${y + ry} A${rx} ${ry} 0 0 1 ${x + rx} ${y} Z`
      );
    }
    case "circle": {
      const cx = num(el, "cx");
      const cy = num(el, "cy");
      const r = num(el, "r");
      if (r <= 0) return "";
      return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
    }
    case "ellipse": {
      const cx = num(el, "cx");
      const cy = num(el, "cy");
      const rx = num(el, "rx");
      const ry = num(el, "ry");
      if (rx <= 0 || ry <= 0) return "";
      return `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
    }
    case "polygon":
    case "polyline": {
      const pts = (el.getAttribute("points") ?? "").trim().replace(/,/g, " ").split(/\s+/);
      if (pts.length < 4) return "";
      const d = `M${pts[0]} ${pts[1]} L${pts.slice(2).join(" ")}`;
      return el.tagName.toLowerCase() === "polygon" ? `${d} Z` : d;
    }
    case "line":
      return `M${num(el, "x1")} ${num(el, "y1")} L${num(el, "x2")} ${num(el, "y2")}`;
    default:
      return "";
  }
}

/** Pull path geometry out of pasted markup (or pass a bare `d` through). */
function extractD(input: string): string {
  if (!input.includes("<")) return input; // already a bare `d`
  if (typeof document === "undefined") return "";
  try {
    const markup = input.includes("<svg")
      ? input
      : `<svg xmlns="http://www.w3.org/2000/svg">${input}</svg>`;
    const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
    if (doc.querySelector("parsererror")) return "";
    const els = doc.querySelectorAll(
      "path, rect, circle, ellipse, polygon, polyline, line",
    );
    return Array.from(els)
      .map(elementToPath)
      .filter(Boolean)
      .join(" ");
  } catch {
    return "";
  }
}

/** Measure a path's bounding box by rendering it off-screen. */
function measureBBox(d: string): [number, number, number, number] | undefined {
  if (typeof document === "undefined") return undefined;
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  // Off-screen but genuinely rendered — a 0×0 svg can make getBBox return nothing.
  svg.setAttribute(
    "style",
    "position:absolute;left:-99999px;top:-99999px;width:10px;height:10px;overflow:visible;opacity:0;pointer-events:none",
  );
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  try {
    const b = path.getBBox();
    if (!b.width && !b.height) return undefined;
    return [b.x, b.y, b.width, b.height];
  } catch {
    return undefined;
  } finally {
    document.body.removeChild(svg);
  }
}

export function normalizeCustomSvg(input: string): NormalizedSvg {
  const raw = input.trim();
  if (!raw) return { d: "" };
  const d = extractD(raw);
  if (!d) return { d: "" };
  return { d, viewBox: measureBBox(d) };
}
