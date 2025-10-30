"use client"
import { useMemo, useState } from "react";
const alphabets = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(97 + i)
);

export interface GlossaryItem {
  title: string;
  description: string;
}
export const useGlossaryHook = (GLOSSARY_DATA: GlossaryItem[]) => {
  const [selectedAlphabet, setSelectedAlphabet] = useState("A");

  const filteredGlossary = useMemo(() => {
    let filtered = GLOSSARY_DATA;

    if (selectedAlphabet) {
      filtered = filtered.filter((item) =>
        item.title.toUpperCase().startsWith(selectedAlphabet)
      );
    }

    return filtered;
  }, [GLOSSARY_DATA, selectedAlphabet]);
  const onAlphabetClick = (letter: string) => {
    setSelectedAlphabet(letter.toUpperCase());
  };
  return {
    alphabets,
    filteredGlossary,
    selectedAlphabet,
    setSelectedAlphabet,
    onAlphabetClick,
  };
};
