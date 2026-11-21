"use client";

import { useId, useState } from "react";

export default function ImageField({ label = "Image", name = "image", initial = "" }) {
  const id = useId();
  const [path, setPath] = useState(initial);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) return setError(data.errors?.file ?? data.message);
    setPath(data.path);
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input type="hidden" name={name} value={path} />
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="block w-full text-sm file:mr-3 file:h-11 file:cursor-pointer file:rounded-lg file:border file:border-input file:bg-card file:px-4 file:font-medium"
      />
      {uploading && <p className="mt-1.5 text-sm text-muted-foreground">Uploading...</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
      {path && <img src={path} alt="" className="mt-3 h-24 w-24 rounded-lg border border-border object-cover" />}
    </div>
  );
}
