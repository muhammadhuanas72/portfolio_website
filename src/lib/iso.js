// Standard 30° isometric projection shared by every line drawing.
export const C = Math.cos(Math.PI / 6);
export const S = Math.sin(Math.PI / 6);
export const iso = ([x, y, z]) => [(x - z) * C, (x + z) * S - y];
export const pts = (list) => list.map((p) => iso(p).map((v) => v.toFixed(2)).join(",")).join(" ");
