import { XMLParser } from "fast-xml-parser";
import Papa from "papaparse";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function parseCsv(input: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(input.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors.map((e) => e.message).join("; "));
  }

  return result.data;
}

export function csvToJson(input: string): string {
  const rows = parseCsv(input);
  return JSON.stringify(rows, null, 2);
}

export function jsonToCsv(input: string): string {
  const parsed = JSON.parse(input) as JsonValue;
  const rows = normalizeToRows(parsed);

  if (rows.length === 0) {
    return "";
  }

  const headers = collectHeaders(rows);
  return Papa.unparse({ fields: headers, data: rows.map((row) => headers.map((h) => row[h] ?? "")) });
}

export function csvToXml(input: string, rootTag = "records", rowTag = "record"): string {
  const rows = parseCsv(input);
  const xmlRows = rows
    .map((row) => {
      const fields = Object.entries(row)
        .map(([key, value]) => `    <${escapeXmlTag(key)}>${escapeXmlText(String(value))}</${escapeXmlTag(key)}>`)
        .join("\n");
      return `  <${rowTag}>\n${fields}\n  </${rowTag}>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${xmlRows}\n</${rootTag}>`;
}

export function xmlToJson(input: string): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
  });

  const parsed = parser.parse(input);
  const normalized = normalizeXmlRoot(parsed);
  return JSON.stringify(normalized, null, 2);
}

export function jsonToXml(input: string, rootTag = "records", rowTag = "record"): string {
  const parsed = JSON.parse(input) as JsonValue;
  const rows = normalizeToRows(parsed);

  const xmlRows = rows
    .map((row) => {
      const fields = Object.entries(row)
        .map(([key, value]) => `    <${escapeXmlTag(key)}>${escapeXmlText(String(value ?? ""))}</${escapeXmlTag(key)}>`)
        .join("\n");
      return `  <${rowTag}>\n${fields}\n  </${rowTag}>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${xmlRows}\n</${rootTag}>`;
}

export function xmlToCsv(input: string): string {
  const json = xmlToJson(input);
  return jsonToCsv(json);
}

export function parseInput(format: "csv" | "json" | "xml", input: string): Record<string, string>[] {
  switch (format) {
    case "csv":
      return parseCsv(input);
    case "json":
      return normalizeToRows(JSON.parse(input) as JsonValue);
    case "xml":
      return normalizeToRows(JSON.parse(xmlToJson(input)) as JsonValue);
  }
}

function normalizeToRows(value: JsonValue): Record<string, string>[] {
  if (Array.isArray(value)) {
    return value.map((item) => flattenRow(item));
  }

  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, JsonValue>;
    const arrayKey = Object.keys(obj).find((key) => Array.isArray(obj[key]));

    if (arrayKey) {
      const items = obj[arrayKey];
      if (Array.isArray(items)) {
        return items.map((item) => flattenRow(item));
      }
    }

    return [flattenRow(value)];
  }

  return [{ value: String(value) }];
}

function flattenRow(value: JsonValue): Record<string, string> {
  if (value === null || value === undefined) {
    return {};
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return { value: String(value) };
  }

  const row: Record<string, string> = {};
  for (const [key, val] of Object.entries(value)) {
    if (val === null || val === undefined) {
      row[key] = "";
    } else if (typeof val === "object") {
      row[key] = JSON.stringify(val);
    } else {
      row[key] = String(val);
    }
  }
  return row;
}

function collectHeaders(rows: Record<string, string>[]): string[] {
  const headers = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headers.add(key);
    }
  }
  return Array.from(headers);
}

function normalizeXmlRoot(parsed: unknown): JsonValue {
  if (!parsed || typeof parsed !== "object") {
    return parsed as JsonValue;
  }

  const root = parsed as Record<string, JsonValue>;
  const keys = Object.keys(root);

  if (keys.length === 1) {
    const key = keys[0];
    const value = root[key];

    if (Array.isArray(value)) {
      return value.map((item) => unwrapXmlItem(item));
    }

    if (value && typeof value === "object") {
      const obj = value as Record<string, JsonValue>;
      const childKeys = Object.keys(obj);

      if (childKeys.length === 1 && Array.isArray(obj[childKeys[0]])) {
        const items = obj[childKeys[0]] as JsonValue[];
        return items.map((item) => unwrapXmlItem(item));
      }

      return [unwrapXmlItem(value)];
    }
  }

  return root as JsonValue;
}

function unwrapXmlItem(item: JsonValue): Record<string, string> {
  if (item === null || typeof item !== "object" || Array.isArray(item)) {
    return { value: String(item ?? "") };
  }

  const row: Record<string, string> = {};
  for (const [key, val] of Object.entries(item)) {
    if (key.startsWith("@_")) {
      row[key.slice(2)] = String(val ?? "");
    } else if (val === null || val === undefined) {
      row[key] = "";
    } else if (typeof val === "object") {
      row[key] = JSON.stringify(val);
    } else {
      row[key] = String(val);
    }
  }
  return row;
}

function escapeXmlTag(tag: string): string {
  return tag.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function escapeXmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function convert(from: "csv" | "json" | "xml", to: "csv" | "json" | "xml", input: string): string {
  if (from === to) {
    return input;
  }

  const key = `${from}-to-${to}` as const;

  switch (key) {
    case "csv-to-json":
      return csvToJson(input);
    case "json-to-csv":
      return jsonToCsv(input);
    case "csv-to-xml":
      return csvToXml(input);
    case "xml-to-csv":
      return xmlToCsv(input);
    case "xml-to-json":
      return xmlToJson(input);
    case "json-to-xml":
      return jsonToXml(input);
    default:
      throw new Error(`Unsupported conversion: ${from} to ${to}`);
  }
}
