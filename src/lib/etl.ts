import { parseInput } from "@/lib/convert";
import { DataFormat } from "@/lib/formats";

export type EtlSource = {
  id: string;
  name: string;
  format: DataFormat;
  rows: Record<string, string>[];
  fields: string[];
};

export type MasterField = {
  id: string;
  name: string;
  mappings: Record<string, string>;
  sourceOfTruthId: string | null;
  isMatchKey: boolean;
};

export function detectFormatFromName(name: string): DataFormat | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".xml")) return "xml";
  return null;
}

export function parseSourceFile(name: string, format: DataFormat, content: string): EtlSource {
  const rows = parseInput(format, content);
  const fields = collectFields(rows);

  return {
    id: crypto.randomUUID(),
    name,
    format,
    rows,
    fields,
  };
}

export function suggestMasterFields(sources: EtlSource[]): MasterField[] {
  if (sources.length === 0) return [];

  const fieldNames = new Set<string>();
  for (const source of sources) {
    for (const field of source.fields) {
      fieldNames.add(field);
    }
  }

  const names = Array.from(fieldNames).sort();
  const matchCandidates = ["id", "email", "name", "key", "uuid"];
  const defaultMatchName =
    names.find((name) => matchCandidates.includes(name.toLowerCase())) ?? names[0] ?? "";

  return names.map((name) => ({
    id: crypto.randomUUID(),
    name,
    mappings: buildMappings(sources, name),
    sourceOfTruthId: sources[0]?.id ?? null,
    isMatchKey: name === defaultMatchName,
  }));
}

export function mergeMasterFields(existing: MasterField[], sources: EtlSource[]): MasterField[] {
  if (sources.length === 0) return [];
  if (existing.length === 0) return suggestMasterFields(sources);

  const sourceIds = new Set(sources.map((source) => source.id));
  const updated = existing.map((field) => ({
    ...field,
    mappings: Object.fromEntries(
      sources.map((source) => [
        source.id,
        field.mappings[source.id] ??
          source.fields.find((sourceField) => sourceField.toLowerCase() === field.name.toLowerCase()) ??
          "",
      ]),
    ),
    sourceOfTruthId:
      field.sourceOfTruthId && sourceIds.has(field.sourceOfTruthId)
        ? field.sourceOfTruthId
        : (sources[0]?.id ?? null),
  }));

  const existingNames = new Set(updated.map((field) => field.name.toLowerCase()));
  for (const source of sources) {
    for (const fieldName of source.fields) {
      if (existingNames.has(fieldName.toLowerCase())) continue;

      updated.push({
        id: crypto.randomUUID(),
        name: fieldName,
        mappings: buildMappings(sources, fieldName),
        sourceOfTruthId: source.id,
        isMatchKey: false,
      });
      existingNames.add(fieldName.toLowerCase());
    }
  }

  if (sources.length > 1 && !updated.some((field) => field.isMatchKey)) {
    const matchField = updated.find((field) =>
      ["email", "id", "name"].includes(field.name.toLowerCase()),
    );
    if (matchField) {
      matchField.isMatchKey = true;
    }
  }

  return updated;
}

function buildMappings(sources: EtlSource[], fieldName: string): Record<string, string> {
  return Object.fromEntries(
    sources.map((source) => {
      const exact = source.fields.find((field) => field === fieldName);
      const fuzzy = source.fields.find((field) => field.toLowerCase() === fieldName.toLowerCase());
      return [source.id, exact ?? fuzzy ?? ""];
    }),
  );
}

export function mergeSources(
  sources: EtlSource[],
  masterFields: MasterField[],
): Record<string, string>[] {
  if (sources.length === 0 || masterFields.length === 0) {
    return [];
  }

  if (sources.length === 1) {
    return projectSource(sources[0], masterFields);
  }

  const matchField = masterFields.find((field) => field.isMatchKey);
  if (!matchField) {
    throw new Error("Select a match key field to merge records across sources.");
  }

  const indexes = sources.map((source) => buildSourceIndex(source, matchField));
  const allKeys = new Set<string>();
  for (const index of indexes) {
    for (const key of index.keys()) {
      allKeys.add(key);
    }
  }

  const merged: Record<string, string>[] = [];
  for (const key of allKeys) {
    const row: Record<string, string> = {};
    for (const field of masterFields) {
      row[field.name] = resolveFieldValue(sources, field, indexes, key);
    }
    merged.push(row);
  }

  return merged.sort((a, b) => {
    const matchValue = a[matchField.name] ?? "";
    return matchValue.localeCompare(b[matchField.name] ?? "");
  });
}

function projectSource(source: EtlSource, masterFields: MasterField[]): Record<string, string>[] {
  return source.rows.map((row) => {
    const projected: Record<string, string> = {};
    for (const field of masterFields) {
      const sourceColumn = field.mappings[source.id];
      projected[field.name] = sourceColumn ? (row[sourceColumn] ?? "") : "";
    }
    return projected;
  });
}

function buildSourceIndex(
  source: EtlSource,
  matchField: MasterField,
): Map<string, Record<string, string>> {
  const index = new Map<string, Record<string, string>>();
  const matchColumn = matchField.mappings[source.id];

  source.rows.forEach((row, rowIndex) => {
    const rawKey = matchColumn ? (row[matchColumn] ?? "").trim() : "";
    const key = rawKey || `__row__${source.id}__${rowIndex}`;
    index.set(key, row);
  });

  return index;
}

function resolveFieldValue(
  sources: EtlSource[],
  field: MasterField,
  indexes: Map<string, Record<string, string>>[],
  matchKey: string,
): string {
  const orderedSources = orderSourcesByPriority(sources, field.sourceOfTruthId);

  for (const source of orderedSources) {
    const sourceIndex = indexes[sources.indexOf(source)];
    const row = sourceIndex.get(matchKey);
    if (!row) continue;

    const sourceColumn = field.mappings[source.id];
    if (!sourceColumn) continue;

    const value = (row[sourceColumn] ?? "").trim();
    if (value) {
      return value;
    }
  }

  return "";
}

function orderSourcesByPriority(sources: EtlSource[], sourceOfTruthId: string | null): EtlSource[] {
  if (!sourceOfTruthId) return sources;

  const primary = sources.find((source) => source.id === sourceOfTruthId);
  if (!primary) return sources;

  return [primary, ...sources.filter((source) => source.id !== sourceOfTruthId)];
}

function collectFields(rows: Record<string, string>[]): string[] {
  const fields = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      fields.add(key);
    }
  }
  return Array.from(fields);
}

export const ETL_SAMPLE_SOURCES: { name: string; format: DataFormat; content: string }[] = [
  {
    name: "customers.csv",
    format: "csv",
    content: `id,name,email,department
1,Alice,alice@example.com,Engineering
2,Bob,bob@example.com,Sales
3,Carol,carol@example.com,Marketing`,
  },
  {
    name: "contacts.json",
    format: "json",
    content: `[
  { "email": "alice@example.com", "phone": "555-0101", "city": "Seattle" },
  { "email": "bob@example.com", "phone": "555-0102", "city": "Portland" },
  { "email": "dave@example.com", "phone": "555-0104", "city": "Denver" }
]`,
  },
  {
    name: "profiles.xml",
    format: "xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<records>
  <record>
    <email>alice@example.com</email>
    <title>Senior Engineer</title>
    <salary>120000</salary>
  </record>
  <record>
    <email>bob@example.com</email>
    <title>Account Executive</title>
    <salary>95000</salary>
  </record>
  <record>
    <email>carol@example.com</email>
    <title>Marketing Lead</title>
    <salary>88000</salary>
  </record>
</records>`,
  },
];
