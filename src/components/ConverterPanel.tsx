"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PostActionAd, InContentAd } from "@/components/ads/AdPlacement";
import { convert } from "@/lib/convert";
import {
  DataFormat,
  FORMAT_ACCEPT,
  FORMAT_EXTENSIONS,
  FORMAT_LABELS,
  FORMAT_MIME,
  SAMPLE_INPUT,
} from "@/lib/formats";

type ConverterPanelProps = {
  from: DataFormat;
  to: DataFormat;
};

export function ConverterPanel({ from, to }: ConverterPanelProps) {
  const [input, setInput] = useState(SAMPLE_INPUT[from]);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [convertCount, setConvertCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = useMemo(
    () => `${FORMAT_LABELS[from]} to ${FORMAT_LABELS[to]} Converter`,
    [from, to],
  );

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ""));
      setUploadedFileName(file.name);
      setOutput("");
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        readFile(file);
      }
      event.target.value = "";
    },
    [readFile],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) {
        readFile(file);
      }
    },
    [readFile],
  );

  const handleConvert = useCallback(() => {
    try {
      setError(null);
      const result = convert(from, to, input);
      setOutput(result);
      setConvertCount((count) => count + 1);
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Conversion failed");
    }
  }, [from, to, input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: FORMAT_MIME[to] });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `converted${FORMAT_EXTENSIONS[to]}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [output, to]);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_INPUT[from]);
    setUploadedFileName(null);
    setOutput("");
    setError(null);
  }, [from]);

  const handleClear = useCallback(() => {
    setInput("");
    setUploadedFileName(null);
    setOutput("");
    setError(null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload or paste your {FORMAT_LABELS[from]} data below and convert it to{" "}
          {FORMAT_LABELS[to]}.
        </p>
      </div>

      <InContentAd />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="input" className="text-sm font-medium text-zinc-700">
              Input ({FORMAT_LABELS[from]})
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                Upload file
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                Clear
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={FORMAT_ACCEPT[from]}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-xl transition ${
              isDragging ? "ring-2 ring-zinc-400 ring-offset-2" : ""
            }`}
          >
            {isDragging && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-400 bg-zinc-50/90">
                <p className="text-sm font-medium text-zinc-600">Drop {FORMAT_LABELS[from]} file here</p>
              </div>
            )}
            <textarea
              id="input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setUploadedFileName(null);
              }}
              rows={18}
              spellCheck={false}
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed shadow-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              placeholder={`Paste ${FORMAT_LABELS[from]} here or drag and drop a file...`}
            />
          </div>

          {uploadedFileName && (
            <p className="text-xs text-zinc-500">
              Loaded from <span className="font-medium text-zinc-700">{uploadedFileName}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="output" className="text-sm font-medium text-zinc-700">
              Output ({FORMAT_LABELS[to]})
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="text-xs text-zinc-500 hover:text-zinc-800 disabled:opacity-40"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output}
                className="text-xs text-zinc-500 hover:text-zinc-800 disabled:opacity-40"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            id="output"
            value={output}
            readOnly
            rows={18}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-100/50 p-4 text-sm leading-relaxed shadow-inner outline-none"
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleConvert}
        className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
      >
        Convert to {FORMAT_LABELS[to]}
      </button>

      <PostActionAd visible={Boolean(output)} interactionKey={convertCount} />
    </div>
  );
}
