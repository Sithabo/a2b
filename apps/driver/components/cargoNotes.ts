import type { CargoDetails } from "@a2b/core";

/** Plain-language handling notes a driver should know before accepting. */
export function cargoNotes(cargo: CargoDetails, isImport: boolean): string[] {
  const notes: string[] = [];
  if (isImport) notes.push("Port / customs pickup — carry the digital customs pass to the gate.");
  if (cargo.requiresFlatbedLowboy) notes.push("Needs a flatbed or lowboy trailer.");
  if (cargo.requiresHydraulicTipper) notes.push("Needs a hydraulic tipper.");
  if (cargo.type === "CHEMICALS_PHARMA") {
    notes.push(`Hazardous goods${cargo.chemicalContainer ? ` in ${cargo.chemicalContainer.replace("_", " ").toLowerCase()}` : ""} — follow hazmat handling rules.`);
  }
  if (cargo.storageEnvironment === "CHILLED") notes.push("Chilled — keep refrigerated (2–8 °C).");
  if (cargo.storageEnvironment === "FROZEN") notes.push("Frozen — keep at −18 °C or below.");
  if (cargo.type === "FRAGILE_CARGO") notes.push("Fragile — secure and handle with care.");
  return notes;
}
