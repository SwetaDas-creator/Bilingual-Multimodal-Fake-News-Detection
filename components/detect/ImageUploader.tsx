"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_MB } from "@/lib/validation";

interface Props {
  file: File | null;
  /** Called with the picked/dropped file (or null on removal). Validation is done by the parent. */
  onFileChange: (file: File | null) => void;
  error?: string | null;
  disabled?: boolean;
}

export default function ImageUploader({
  file,
  onFileChange,
  error,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create / revoke the object URL for preview (prevents memory leaks)
  useEffect(() => {
    if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = (files: FileList | null) => {
    if (disabled || !files || files.length === 0) return;
    onFileChange(files[0]); // single image only
  };

  const remove = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = ""; // allow re-selecting same file
  };

  const errorId = "image-error";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Image
      </label>

      {!file || !previewUrl ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-describedby={error ? errorId : undefined}
          aria-label="Upload an image: click, press Enter, or drop a file here"
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            error
              ? "border-red-400 bg-red-50"
              : dragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-white hover:border-teal-500 hover:bg-slate-50"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <ImagePlus
            className="mb-3 h-10 w-10 text-slate-400"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-700">
            Drag &amp; drop an image here, or{" "}
            <span className="text-teal-700 underline">browse</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG or WebP · up to {MAX_IMAGE_MB} MB
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected image preview"
            className="h-32 w-32 flex-none rounded-md border border-slate-200 object-cover sm:h-40 sm:w-40"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {file.name}
            </p>
            <p className="text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={remove}
              disabled={disabled}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        tabIndex={-1}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
