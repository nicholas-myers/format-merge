"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { InContentAd, PostActionAd } from "@/components/ads/AdPlacement";
import { jsonToCsv, jsonToXml } from "@/lib/convert";
import {
  EtlSource,
  ETL_SAMPLE_SOURCES,
  MasterField,
  detectFormatFromName,
  mergeSources,
  mergeMasterFields,
  parseSourceFile,
  suggestMasterFields,
} from "@/lib/etl";
import { DataFormat, FORMAT_ACCEPT, FORMAT_LABELS } from "@/lib/formats";

type OutputFormat = "json" | "csv" | "xml";

export function EtlPanel() {
  const [sources, setSources] = useState<EtlSource[]>([]);
  const [masterFields, setMasterFields] = useState<MasterField[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");
  const [mergedRows, setMergedRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mergeCount, setMergeCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const outputText = useMemo(() => {
    if (mergedRows.length === 0) return "";

    switch (outputFormat) {
      case "json":
        return JSON.stringify(mergedRows, null, 2);
      case "csv":
        return jsonToCsv(JSON.stringify(mergedRows));
      case "xml":
        return jsonToXml(JSON.stringify(mergedRows));
    }
  }, [mergedRows, outputFormat]);

  const addSource = useCallback((name: string, format: DataFormat, content: string) => {
    try {
      const source = parseSourceFile(name, format, content);
      setSources((prev) => {
        const next = [...prev, source];
        setMasterFields((fields) => mergeMasterFields(fields, next));
        return next;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    }
  }, []);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const format = detectFormatFromName(file.name);
        if (!format) {
          setError(`Could not detect format for "${file.name}". Use .csv, .json, or .xml.`);
          continue;
        }

        const reader = new FileReader();
        reader.onload = () => {
          addSource(file.name, format, String(reader.result ?? ""));
        };
        reader.onerror = () => {
          setError(`Failed to read "${file.name}"`);
        };
        reader.readAsText(file);
      }
    },
    [addSource],
  );

  const handleLoadSamples = useCallback(() => {
    const parsed = ETL_SAMPLE_SOURCES.map((sample) =>
      parseSourceFile(sample.name, sample.format, sample.content),
    );
    setSources(parsed);
    setMasterFields(suggestMasterFields(parsed));
    setMergedRows([]);
    setError(null);
  }, []);

  const handleRemoveSource = useCallback((sourceId: string) => {
    setSources((prev) => {
      const next = prev.filter((source) => source.id !== sourceId);
      setMasterFields((fields) => mergeMasterFields(fields, next));
      return next;
    });
    setMergedRows([]);
  }, []);

  const handleAddField = useCallback(() => {
    setMasterFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: `field_${prev.length + 1}`,
        mappings: Object.fromEntries(sources.map((source) => [source.id, ""])),
        sourceOfTruthId: sources[0]?.id ?? null,
        isMatchKey: false,
      },
    ]);
  }, [sources]);

  const updateField = useCallback((fieldId: string, updates: Partial<MasterField>) => {
    setMasterFields((prev) =>
      prev.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    );
  }, []);

  const setMatchKey = useCallback((fieldId: string) => {
    setMasterFields((prev) =>
      prev.map((field) => ({
        ...field,
        isMatchKey: field.id === fieldId,
      })),
    );
  }, []);

  const handleRemoveField = useCallback((fieldId: string) => {
    setMasterFields((prev) => prev.filter((field) => field.id !== fieldId));
  }, []);

  const handleMerge = useCallback(() => {
    try {
      setError(null);
      const result = mergeSources(sources, masterFields);
      setMergedRows(result);
      setMergeCount((count) => count + 1);
    } catch (err) {
      setMergedRows([]);
      setError(err instanceof Error ? err.message : "Merge failed");
    }
  }, [sources, masterFields]);

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const handleDownload = useCallback(() => {
    if (!outputText) return;
    const extensions = { json: ".json", csv: ".csv", xml: ".xml" };
    const mime = { json: "application/json", csv: "text/csv", xml: "application/xml" };
    const blob = new Blob([outputText], { type: mime[outputFormat] });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `master-data${extensions[outputFormat]}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [outputFormat, outputText]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">ETL Merge Tool</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">
          Upload multiple files in different formats, map fields to a master schema, and choose
          which source is the source of truth for each field.
        </p>
      </div>

      <InContentAd />

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">1. Data sources</h2>
            <p className="text-xs text-zinc-500">Add CSV, JSON, and XML files to merge.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Upload files
            </button>
            <button
              type="button"
              onClick={handleLoadSamples}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Load sample data
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[FORMAT_ACCEPT.csv, FORMAT_ACCEPT.json, FORMAT_ACCEPT.xml].join(",")}
          onChange={(event) => {
            if (event.target.files) handleFiles(event.target.files);
            event.target.value = "";
          }}
          className="hidden"
        />

        {sources.length === 0 ? (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (event.dataTransfer.files.length) {
                handleFiles(event.dataTransfer.files);
              }
            }}
            className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500"
          >
            Drop files here or use Upload files
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <div key={source.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{source.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {FORMAT_LABELS[source.format]} · {source.rows.length} rows ·{" "}
                      {source.fields.length} fields
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSource(source.id)}
                    className="shrink-0 text-xs text-zinc-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  {source.fields.slice(0, 6).join(", ")}
                  {source.fields.length > 6 ? "…" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {sources.length > 0 && (
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">2. Master schema</h2>
              <p className="text-xs text-zinc-500">
                Define output fields, map source columns, and set source of truth per field.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddField}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Add field
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-2 py-2 font-medium">Master field</th>
                  <th className="px-2 py-2 font-medium">Match key</th>
                  {sources.map((source) => (
                    <th key={source.id} className="px-2 py-2 font-medium">
                      {source.name}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-medium">Source of truth</th>
                  <th className="px-2 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {masterFields.map((field) => (
                  <tr key={field.id} className="border-b border-zinc-100">
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(event) =>
                          updateField(field.id, { name: event.target.value })
                        }
                        className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-zinc-400"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="radio"
                        name="matchKey"
                        checked={field.isMatchKey}
                        onChange={() => setMatchKey(field.id)}
                        disabled={sources.length < 2}
                        title={
                          sources.length < 2
                            ? "Match key is only needed with multiple sources"
                            : "Use this field to match records across sources"
                        }
                      />
                    </td>
                    {sources.map((source) => (
                      <td key={source.id} className="px-2 py-2">
                        <select
                          value={field.mappings[source.id] ?? ""}
                          onChange={(event) =>
                            updateField(field.id, {
                              mappings: {
                                ...field.mappings,
                                [source.id]: event.target.value,
                              },
                            })
                          }
                          className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-zinc-400"
                        >
                          <option value="">—</option>
                          {source.fields.map((sourceField) => (
                            <option key={sourceField} value={sourceField}>
                              {sourceField}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <select
                        value={field.sourceOfTruthId ?? ""}
                        onChange={(event) =>
                          updateField(field.id, {
                            sourceOfTruthId: event.target.value || null,
                          })
                        }
                        className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-zinc-400"
                      >
                        <option value="">Any source</option>
                        {sources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="text-xs text-zinc-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-zinc-500">
            Records are joined on the match key field. For each master field, the source of truth
            is used first; if empty, values fall back to other mapped sources.
          </p>
        </section>
      )}

      {sources.length > 0 && (
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">3. Merge & export</h2>
              <p className="text-xs text-zinc-500">
                Build the master dataset and export in your preferred format.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="output-format" className="text-xs text-zinc-500">
                Output
              </label>
              <select
                id="output-format"
                value={outputFormat}
                onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-zinc-400"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMerge}
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            Merge into master dataset
          </button>

          {mergedRows.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-600">
                  {mergedRows.length} record{mergedRows.length === 1 ? "" : "s"} merged
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-zinc-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-400">
                      {masterFields.map((field) => (
                        <th key={field.id} className="px-3 py-2 font-medium">
                          {field.name}
                          {field.isMatchKey && (
                            <span className="ml-1 normal-case text-zinc-400">(key)</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mergedRows.slice(0, 50).map((row, index) => (
                      <tr key={index} className="border-b border-zinc-100">
                        {masterFields.map((field) => (
                          <td key={field.id} className="px-3 py-2 text-zinc-700">
                            {row[field.name] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mergedRows.length > 50 && (
                <p className="text-xs text-zinc-500">
                  Showing first 50 of {mergedRows.length} records. Download for the full dataset.
                </p>
              )}

              <textarea
                readOnly
                value={outputText}
                rows={12}
                spellCheck={false}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-100/50 p-4 text-xs leading-relaxed outline-none"
              />
            </>
          )}

          <PostActionAd visible={mergedRows.length > 0} interactionKey={mergeCount} />
        </section>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
