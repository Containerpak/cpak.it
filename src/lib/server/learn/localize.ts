import es from "./translations/es.json";
import it from "./translations/it.json";

type Locale = "en" | "es" | "it";

const translations = { es, it } as const;

export function localizeLearn<T>(value: T, locale: Locale): T {
  if (locale === "en") return value;
  if (typeof value === "string") {
    return (translations[locale][
      value as keyof (typeof translations)[typeof locale]
    ] ?? value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => localizeLearn(item, locale)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localizeLearn(item, locale),
      ]),
    ) as T;
  }
  return value;
}
