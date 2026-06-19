const flashKey = "hli.materials.flash";

export function setMaterialsFlash(message: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(flashKey, message);
}

export function consumeMaterialsFlash(): string | null {
  if (typeof window === "undefined") return null;
  const message = window.sessionStorage.getItem(flashKey);
  if (message) window.sessionStorage.removeItem(flashKey);
  return message;
}
