import { useQuery } from "@apollo/client/react";
import { glossaryGql, T_GLOSSARY_RESPONSE } from "./glossary.gql";
import { gql } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";

const alphabets = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(97 + i)
);

export const useGlossaryHook = () => {
  const [selectedAlphabet, setSelectedAlphabet] = useState("A");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const titleFilter = useMemo(() => {
    if (debouncedSearch !== "") return { contains: debouncedSearch };
    return { startsWith: selectedAlphabet };
  }, [debouncedSearch, selectedAlphabet]);

  const variables = useMemo(
    () => ({
      pagination: { pageSize: 100000 },
      filters: { Title: titleFilter },
    }),
    [titleFilter]
  );

  const { loading, error, data } = useQuery<T_GLOSSARY_RESPONSE>(
    gql(glossaryGql),
    {
      variables,
    }
  );

  const onAlphabetClick = (letter: string) => {
    setSearch("");
    setSelectedAlphabet(letter.toUpperCase());
  };

  const onSearchChange = (e: string) => {
    setSearch(e);
  };
  const items = data?.glossaries_connection?.nodes ?? [];



  const resetSearch = () => {
    setSearch("");
    setSelectedAlphabet("A");
  };


  return {
    selectedAlphabet,
    search,
    onSearchChange,
    onAlphabetClick,
    items,
    loading,
    alphabets,
    error,
    resetSearch
  };
};
