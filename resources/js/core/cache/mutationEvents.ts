export type MutationEvent = "locations:mutated" | "series:mutated" | "price-lists:mutated" | "items:mutated" | "composite-items:mutated";

export function emitMutation(event: MutationEvent): void {
  window.dispatchEvent(new CustomEvent(event));
}

export function onMutation(event: MutationEvent, handler: () => void): () => void {
  window.addEventListener(event, handler);
  return () => window.removeEventListener(event, handler);
}
