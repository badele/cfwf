export type Align = "left" | "center" | "right";

export type ParsedCSV = {
  columns: string[];
  // deno-lint-ignore no-explicit-any
  values: any[];
};

export type readerOptions = {
  charseparator?: string;
  chartabletop?: string;
  chartablemiddle?: string;
  chartablebottom?: string;
  maxmarkerlines?: number;
};

export type writerOptions = {
  padding?: number;
  charseparator?: string;
  chartabletop?: string;
  chartablemiddle?: string;
  chartablebottom?: string;
  removetitleline?: number;
  // deno-lint-ignore no-explicit-any
  metas?: any;
  font?: string;
};
