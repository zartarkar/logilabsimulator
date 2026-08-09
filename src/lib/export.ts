import type { CircuitGraph } from "@/logic/types";

const ON = "#16a34a";
const OFF = "#94a3b8";

function gateMarkup(type: string): string {
  const s = `fill="#ffffff" stroke="#0f172a" stroke-width="2"`;
  switch (type) {
    case "AND":
      return `<path d="M8 2 H32 A22 22 0 0 1 32 46 H8 Z" ${s}/>`;
    case "NAND":
      return `<path d="M8 2 H32 A22 22 0 0 1 32 46 H8 Z" ${s}/><circle cx="59" cy="24" r="5" ${s}/>`;
    case "OR":
      return `<path d="M6 2 Q26 24 6 46 Q34 46 52 24 Q34 2 6 2 Z" ${s}/>`;
    case "NOR":
      return `<path d="M6 2 Q26 24 6 46 Q34 46 52 24 Q34 2 6 2 Z" ${s}/><circle cx="59" cy="24" r="5" ${s}/>`;
    case "XOR":
      return `<path d="M0 2 Q20 24 0 46" fill="none" stroke="#0f172a" stroke-width="2"/><path d="M6 2 Q26 24 6 46 Q34 46 52 24 Q34 2 6 2 Z" ${s}/>`;
    case "XNOR":
      return `<path d="M0 2 Q20 24 0 46" fill="none" stroke="#0f172a" stroke-width="2"/><path d="M6 2 Q26 24 6 46 Q34 46 52 24 Q34 2 6 2 Z" ${s}/><circle cx="59" cy="24" r="5" ${s}/>`;
    case "NOT":
      return `<path d="M10 3 L46 24 L10 45 Z" ${s}/><circle cx="51" cy="24" r="5" ${s}/>`;
    case "BUFFER":
      return `<path d="M10 3 L50 24 L10 45 Z" ${s}/>`;
    default:
      return `<rect x="8" y="6" width="52" height="36" rx="6" ${s}/>`;
  }
}

export function circuitToSvg(graph: CircuitGraph): string {
  const W = 68;
  const H = 48;
  const pad = 40;
  const minX = Math.min(...graph.nodes.map((n) => n.x));
  const minY = Math.min(...graph.nodes.map((n) => n.y));
  const maxX = Math.max(...graph.nodes.map((n) => n.x)) + W;
  const maxY = Math.max(...graph.nodes.map((n) => n.y)) + H;
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;
  const pos = new Map(graph.nodes.map((n) => [n.id, { x: n.x - minX + pad, y: n.y - minY + pad }]));

  const wires = graph.edges
    .map((e) => {
      const s = pos.get(e.source)!;
      const t = pos.get(e.target)!;
      const target = graph.nodes.find((n) => n.id === e.target)!;
      const ports = Math.max(target.inputs.length, 1);
      const sy = s.y + H / 2;
      const ty = t.y + ((e.targetPort + 1) / (ports + 1)) * H;
      const mid = (s.x + W + t.x) / 2;
      const color = e.value === 1 ? ON : OFF;
      return `<path d="M${s.x + W} ${sy} H${mid} V${ty} H${t.x}" fill="none" stroke="${color}" stroke-width="${e.value === 1 ? 2.4 : 1.4}"/><text x="${mid}" y="${ty - 4}" font-size="10" font-family="monospace" fill="#0f172a">${e.value}</text>`;
    })
    .join("");

  const nodes = graph.nodes
    .map((n) => {
      const p = pos.get(n.id)!;
      if (n.type === "INPUT" || n.type === "OUTPUT" || n.type === "CONST0" || n.type === "CONST1") {
        const on = n.value === 1;
        return `<g transform="translate(${p.x},${p.y})"><rect width="${W}" height="${H}" rx="8" fill="${on ? "#dcfce7" : "#f1f5f9"}" stroke="${on ? ON : "#0f172a"}" stroke-width="2"/><text x="${W / 2}" y="22" text-anchor="middle" font-size="13" font-family="monospace" font-weight="bold" fill="#0f172a">${n.label}</text><text x="${W / 2}" y="38" text-anchor="middle" font-size="11" font-family="monospace" fill="#0f172a">${n.value} ${on ? "ON" : "OFF"}</text></g>`;
      }
      return `<g transform="translate(${p.x},${p.y})">${gateMarkup(n.type)}<text x="${W / 2}" y="${H + 12}" text-anchor="middle" font-size="10" font-family="monospace" fill="#0f172a">${n.type}=${n.value}</text></g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/>${wires}${nodes}</svg>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportSvg(graph: CircuitGraph, name: string) {
  downloadBlob(new Blob([circuitToSvg(graph)], { type: "image/svg+xml" }), `${name}-circuit.svg`);
}

export async function exportPng(graph: CircuitGraph, name: string) {
  const svg = circuitToSvg(graph);
  const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.width * 2;
  canvas.height = img.height * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0);
  canvas.toBlob((blob) => blob && downloadBlob(blob, `${name}-circuit.png`));
}

export function exportJson(data: unknown, name: string) {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${name}-project.json`);
}
