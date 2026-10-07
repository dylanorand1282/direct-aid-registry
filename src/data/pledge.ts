// Every statement the pledge mock-up makes about money. Kept in one place so
// the wording can be reviewed together, and tested for what it must not say.

export const PLEDGE_NOTICES = {
  banner:
    "Simulation only. No money is collected, held, transferred or processed, and no payment details are requested.",
  acknowledgement:
    "I understand this is a simulation. No money will be moved or held, nothing is sent to the organization, and a simulated pledge has no tax or legal standing.",
  confirmation:
    "Simulated pledge recorded in this browser only. No money has moved, no funds are held, and the organization has not been contacted. This is not a donation and no receipt or tax document exists.",
  storage: "Stored only in this browser's local storage. Clearing your browser data removes it.",
} as const;

export const PLEDGE_PRESETS_USD = [1_000, 5_000, 10_000, 25_000] as const;
export const PLEDGE_MIN_USD = 100;
export const SIMULATED_PLEDGE_PREFIX = "SIM";
