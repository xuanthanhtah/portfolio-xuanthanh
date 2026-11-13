// Kept separate from ChristmasTreeScene so importing these doesn't pull
// three / drei / postprocessing into the main bundle.
export type LightMode = "twinkle" | "chase" | "breathe";
export const LIGHT_MODES: LightMode[] = ["twinkle", "chase", "breathe"];
