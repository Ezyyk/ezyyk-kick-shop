"use client";
import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = "Obrázek" }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vyberte prosím obrázek.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        const err = await res.json();
        alert(err.error || "Nepodařilo se nahrát obrázek");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Chyba při nahrávání obrázku");
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  // Handle global paste event when component is mounted
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        // Prevent default only if an image is pasted to not break text inputs
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          handleUpload(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="admin-form-group admin-form-wide">
      <label>{label} (Drag & Drop / Ctrl+V / Kliknutí)</label>
      
      {value ? (
        <div style={{ position: "relative", width: "100%", maxWidth: "300px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
          <img src={value} alt="Náhled" style={{ width: "100%", height: "auto", display: "block" }} />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", border: "none", color: "white", borderRadius: "50%", padding: "4px", cursor: "pointer", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--accent-primary)" : "var(--glass-border)"}`,
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(138, 43, 226, 0.1)" : "rgba(0,0,0,0.2)",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "var(--text-secondary)"
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept="image/*"
            style={{ display: "none" }}
          />
          {isUploading ? (
            <>
              <Loader2 size={32} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
              <p>Nahrávám...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </>
          ) : (
            <>
              <UploadCloud size={32} />
              <p style={{ margin: 0 }}>Klikněte, přetáhněte sem obrázek nebo stiskněte <b>Ctrl+V</b></p>
            </>
          )}
        </div>
      )}
      
      {/* Fallback to text input in case they want to paste a direct URL */}
      {!value && !isUploading && (
        <input
          type="text"
          placeholder="Nebo vložte externí URL adresu obrázku..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input"
          style={{ marginTop: "1rem" }}
        />
      )}
    </div>
  );
}
