/**
 * Input-time helper for the custom-eye field: keeps the pasted SVG as-is (so it
 * renders exactly) and works out its coordinate box so the renderer can size it
 * into the eye. Sanitisation happens later, at render time (see CustomSvgEye).
 *
 * Browser-only (uses DOMParser + getBBox); callers run it from client events.
 */

export interface ParsedCustomSvg {
  /** The markup to store, verbatim. */
  svg: string;
  /** Its coordinate box [x, y, w, h] — from viewBox, width/height, or measured. */
  viewBox?: [number, number, number, number];
}

function parseViewBoxAttr(
  attr: string | null | undefined,
): [number, number, number, number] | undefined {
  if (!attr) return undefined;
  const p = attr.trim().split(/[\s,]+/).map(Number);
  if (p.length === 4 && p.every(Number.isFinite) && p[2] > 0 && p[3] > 0) {
    return [p[0], p[1], p[2], p[3]];
  }
  return undefined;
}

/** Measure the bounding box of inner SVG markup by rendering it off-screen. */
function measureInnerBBox(
  inner: string,
): [number, number, number, number] | undefined {
  if (typeof document === "undefined") return undefined;
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute(
    "style",
    "position:absolute;left:-99999px;top:-99999px;width:10px;height:10px;overflow:visible;opacity:0;pointer-events:none",
  );
  const g = document.createElementNS(NS, "g");
  g.innerHTML = inner;
  svg.appendChild(g);
  document.body.appendChild(svg);
  try {
    const b = g.getBBox();
    if (!b.width && !b.height) return undefined;
    return [b.x, b.y, b.width, b.height];
  } catch {
    return undefined;
  } finally {
    document.body.removeChild(svg);
  }
}

export function parseCustomSvg(raw: string): ParsedCustomSvg {
  const s = raw.trim();
  if (!s) return { svg: "" };
  if (typeof document === "undefined") return { svg: raw };

  // A bare path `d` — measure it directly.
  if (!s.includes("<")) {
    return { svg: raw, viewBox: measureInnerBBox(`<path d="${s.replace(/"/g, "")}" />`) };
  }

  try {
    const wrapped = s.includes("<svg")
      ? s
      : `<svg xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
    const doc = new DOMParser().parseFromString(wrapped, "image/svg+xml");
    if (doc.querySelector("parsererror")) return { svg: raw };
    const svgEl = doc.querySelector("svg");

    let viewBox = parseViewBoxAttr(svgEl?.getAttribute("viewBox"));
    if (!viewBox) {
      const w = parseFloat(svgEl?.getAttribute("width") ?? "");
      const h = parseFloat(svgEl?.getAttribute("height") ?? "");
      if (w > 0 && h > 0) viewBox = [0, 0, w, h];
    }
    if (!viewBox && svgEl) viewBox = measureInnerBBox(svgEl.innerHTML);

    return { svg: raw, viewBox };
  } catch {
    return { svg: raw };
  }
}
