"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileImage } from "lucide-react";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  uploading: boolean;
  progress: number;
}

export default function UploadZone({ onUpload, uploading, progress }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 50));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">
          {isDragActive
            ? "Déposez vos images ici"
            : "Glissez-déposez vos images ici"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          ou cliquez pour parcourir (max 50 images, 20 Mo chacune)
        </p>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {files.length} fichier(s) sélectionné(s)
            </p>
            <button
              onClick={() => onUpload(files)}
              disabled={uploading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? `${progress}%` : "Lancer le renommage"}
            </button>
          </div>
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="grid grid-cols-5 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileImage className="w-6 h-6 text-gray-400" />
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs text-gray-500 truncate mt-1">{f.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
