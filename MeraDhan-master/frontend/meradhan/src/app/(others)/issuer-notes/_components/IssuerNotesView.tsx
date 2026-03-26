"use client";
import React from "react";
import { IssuerNoteCard } from "./IssuerNoteCard";
import { useIssuerViewType } from "../_store/useIssuerViewType";
import { fetchIssuerNotesGql } from "../_action/issuerNotesAction";

function IssuerNotesView({
  data,
}: {
  data: Awaited<ReturnType<typeof fetchIssuerNotesGql>>;
}) {
  const { gridMode } = useIssuerViewType();
  return (
    <div
      className={`gap-5 grid ${
        gridMode ? "lg:grid-cols-3 md:grid-cols-2" : "grid-cols-1"
      } mt-5`}
    >
      {data?.nodes?.map((note) => (
        <IssuerNoteCard key={note.Slug} gridMode={gridMode} data={note} />
      ))}
    </div>
  );
}

export default IssuerNotesView;
