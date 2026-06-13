import "server-only";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  vi: () => import("@/dictionaries/vi.json").then((module) => module.default),
};

export type Locale = "en" | "vi";

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
