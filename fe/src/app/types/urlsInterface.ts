// crear una interface

export interface UrlToolBar{
  title: string
  url: string
}

export type TableRow = Record<string, string | number | boolean | null | undefined>;

export interface TableHeader {
  label: string;
  key: string;
}
