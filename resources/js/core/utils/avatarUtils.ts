const AVATAR_COLORS = [
  "#E41F07", "#1565C0", "#2E7D32", "#6A1B9A",
  "#E65100", "#00695C", "#AD1457", "#0277BD",
  "#558B2F", "#4527A0", "#F57F17", "#00838F",
];

const SALUTATIONS = /^(Mr\.?|Mrs\.?|Ms\.?|Miss\.?|Dr\.?|Prof\.?|Er\.?|CA\.?|CS\.?|Adv\.?|Sir|Shri|Smt\.?)\s+/i;

export function nameInitial(name: string): string {
  const stripped = name.replace(SALUTATIONS, "").trim();
  return (stripped || name).charAt(0).toUpperCase();
}

export function nameToColor(name: string): string {
  const stripped = name.replace(SALUTATIONS, "").trim() || name;
  let hash = 0;
  for (let i = 0; i < stripped.length; i++) {
    hash = stripped.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
