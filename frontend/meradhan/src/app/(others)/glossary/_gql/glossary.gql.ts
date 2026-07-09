export const glossaryGql = `query Nodes($pagination: PaginationArg, $filters: GlossaryFiltersInput) {
  glossaries_connection(pagination: $pagination, filters: $filters) {
    nodes {
      Title
      Explanation
      documentId
    }
  }
}`;

export type T_GLOSSARY_RESPONSE = {
  glossaries_connection: {
    nodes: Array<GLOSSARY_NODE>;
  };
};

export type GLOSSARY_NODE = {
  Title: string;
  Explanation: string;
  documentId: string;
};
