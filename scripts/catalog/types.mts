export interface CatalogExport {
  network: string;
  href: string;
  size: number;
}

export interface CatalogTestingTool {
  name: string;
  url: string;
}

export interface CatalogLanguage {
  code: string;
  exports: CatalogExport[];
}

export interface CatalogPack {
  id: string;
  name: string;
  description: string;
  languages: CatalogLanguage[];
}

export interface PackDescription {
  name: string;
  description: string;
}
