export type DataFormat = "csv" | "json" | "xml";

export type ConversionPair = {
  from: DataFormat;
  to: DataFormat;
  label: string;
  path: string;
};

export const CONVERSIONS: ConversionPair[] = [
  { from: "csv", to: "json", label: "CSV → JSON", path: "/csv-to-json" },
  { from: "json", to: "csv", label: "JSON → CSV", path: "/json-to-csv" },
  { from: "csv", to: "xml", label: "CSV → XML", path: "/csv-to-xml" },
  { from: "xml", to: "csv", label: "XML → CSV", path: "/xml-to-csv" },
  { from: "xml", to: "json", label: "XML → JSON", path: "/xml-to-json" },
  { from: "json", to: "xml", label: "JSON → XML", path: "/json-to-xml" },
];

export function getConversion(from: DataFormat, to: DataFormat): ConversionPair | undefined {
  return CONVERSIONS.find((c) => c.from === from && c.to === to);
}

export const FORMAT_LABELS: Record<DataFormat, string> = {
  csv: "CSV",
  json: "JSON",
  xml: "XML",
};

export const FORMAT_EXTENSIONS: Record<DataFormat, string> = {
  csv: ".csv",
  json: ".json",
  xml: ".xml",
};

export const FORMAT_MIME: Record<DataFormat, string> = {
  csv: "text/csv",
  json: "application/json",
  xml: "application/xml",
};

export const FORMAT_ACCEPT: Record<DataFormat, string> = {
  csv: ".csv,text/csv",
  json: ".json,application/json",
  xml: ".xml,application/xml,text/xml",
};

export const SAMPLE_INPUT: Record<DataFormat, string> = {
  csv: `name,email,age
Alice,alice@example.com,30
Bob,bob@example.com,25
Carol,carol@example.com,28`,
  json: `[
  { "name": "Alice", "email": "alice@example.com", "age": 30 },
  { "name": "Bob", "email": "bob@example.com", "age": 25 },
  { "name": "Carol", "email": "carol@example.com", "age": 28 }
]`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<records>
  <record>
    <name>Alice</name>
    <email>alice@example.com</email>
    <age>30</age>
  </record>
  <record>
    <name>Bob</name>
    <email>bob@example.com</email>
    <age>25</age>
  </record>
  <record>
    <name>Carol</name>
    <email>carol@example.com</email>
    <age>28</age>
  </record>
</records>`,
};
