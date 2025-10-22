import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { GlossaryItem } from "./constant";

export const useGlossaryHook = (
  data: GlossaryItem[],
  initialLetter: string = "A"
) => {
  const [activeLetter, setActiveLetter] = useState<string>(initialLetter);
  const [query, setQuery] = useState<string>("");

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const letter = (activeLetter || "").trim().toUpperCase();

    const byLetter = (g: GlossaryItem) =>
      letter ? g.term.trim().toUpperCase().startsWith(letter) : true;

    const byQuery = (g: GlossaryItem) =>
      normalizedQuery
        ? (g.term + " " + g.definition).toLowerCase().includes(normalizedQuery)
        : true;

    return data
      .filter((g) => byLetter(g) && byQuery(g))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [data, activeLetter, normalizedQuery]);

  // Helpers
  const onLetterClick = useCallback(
    (ch: string) => setActiveLetter(ch.toUpperCase()),
    []
  );

  const onQueryChange = useCallback(
    (v: string | ChangeEvent<HTMLInputElement>) => {
      const next = typeof v === "string" ? v : v.target.value;
      setQuery(next);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setActiveLetter("");
    setQuery("");
  }, []);

  return {
    activeLetter,
    query,
    filtered,
    setActiveLetter,
    setQuery,
    onLetterClick,
    onQueryChange,
    clearFilters,
  };
};
