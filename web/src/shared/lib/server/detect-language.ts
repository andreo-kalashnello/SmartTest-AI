export type TestLanguage = "uk" | "en";

export type LanguageMode = "auto" | TestLanguage;

const CYRILLIC = /[\u0400-\u04FF]/g;
const LATIN = /[a-zA-Z]/g;

export function detectLanguageFromText(text: string): TestLanguage {
  const sample = text.slice(0, 4000);
  const cyrillic = (sample.match(CYRILLIC) ?? []).length;
  const latin = (sample.match(LATIN) ?? []).length;

  if (cyrillic === 0 && latin === 0) return "uk";
  return cyrillic >= latin ? "uk" : "en";
}

export function resolveTestLanguage(
  mode: LanguageMode | undefined,
  parts: Array<string | undefined>,
): TestLanguage {
  if (mode === "uk" || mode === "en") return mode;
  const combined = parts.filter(Boolean).join("\n");
  return detectLanguageFromText(combined);
}

export function languageInstruction(lang: TestLanguage): string {
  if (lang === "uk") {
    return [
      "LANGUAGE RULE (mandatory): Write ALL question prompts and ALL answer options in Ukrainian only.",
      "Do not use English. Use Ukrainian mathematical terms (наприклад: гіпотенуза, катет, область визначення).",
    ].join(" ");
  }

  return [
    "LANGUAGE RULE (mandatory): Write ALL question prompts and ALL answer options in English only.",
    "Do not mix other languages.",
  ].join(" ");
}
