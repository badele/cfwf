export type Align = "left" | "center" | "right";

export type FormatCFWF = {
  content: string;
  metadatas: string;
};

export type NamedArray = {
  columns: string[];
  // deno-lint-ignore no-explicit-any
  rows: any[];
};

// export type readerOptions = {
//   chartitlesep?: string;
//   chardescsep?: string;
//   chartabletop?: string;
//   chartablemiddle?: string;
//   chartablebottom?: string;
//   charyamlsep?: string;
//   maxmarkerlines?: number;
// };

export type CFWFOptions = {
  padding?: number;
  chartitlesep?: string;
  chardescsep?: string;
  chartabletop?: string;
  chartablemiddle?: string;
  chartablebottom?: string;
  charyamlsep?: string;
  removetitleline?: number;
  // deno-lint-ignore no-explicit-any
  metas?: any;
  font?: string;
  separate?: boolean;
};

export type DatasetType = {
  title?: string;
  generatedtitle?: string;
  description?: string;
  tables?: Record<string, TableType>;
  metadatas?: {
    orders?: string[];
    font?: string;
    removetitlelines?: number;
    sources?: string[];
    license?: string;
    author?: string;
    version?: string;
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
  };
};

export type TableType = {
  subtitle?: string;
  description?: string;
  columns?: string[];
  // deno-lint-ignore no-explicit-any
  rows?: any[];
  metadatas?: {
    aligns?: string[];
    sources?: string[];
    license?: string;
    author?: string;
    // deno-lint-ignore no-explicit-any
    [key: string]: any;
  };
};

export type ExportTable = {
  columns: string[];
  // deno-lint-ignore no-explicit-any
  rows: any[];
};

export type CFWFDataset = {
  dataset?: DatasetType;
  tables?: Record<string, TableType>;
};
