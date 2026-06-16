"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { uploadImages } from "@/lib/api";
import UploadZone from "@/components/UploadZone";
import { useState } from "react";
import { Download, CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface ImageItem {
  id: number;
  original_filename: string;
  final_filename: string | null;
  final_url: string | null;
  status: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}`).then((r) => r.data),
  });

  const { data: images, refetch } = useQuery<ImageItem[]>({
    queryKey: ["images", projectId],
    queryFn: () => api.get(`/api/projects/${projectId}/images`).then((r) => r.data),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.some((img) => img.status === "pending" || img.status === "processing")) {
        return 2000;
      }
      return false;
    },
  });

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setProgress(0);
    try {
      await uploadImages(projectId, files, setProgress);
      refetch();
    } finally {
      setUploading(false);
    }
  };

  const pendingCount = images?.filter((i) => i.status === "pending" || i.status === "processing").length || 0;
  const completedCount = images?.filter((i) => i.status === "completed").length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{project?.name || "Chargement..."}</h1>
        {project && (
          <p className="text-sm text-gray-500 font-mono mt-1">
            Pattern : {project.naming_pattern}
          </p>
        )}
      </div>

      <UploadZone onUpload={handleUpload} uploading={uploading} progress={progress} />

      {images && images.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">
              Images ({completedCount}/{images.length} traitées)
            </h2>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                {pendingCount} en cours
              </span>
            )}
          </div>
          <div className="divide-y">
            {images.map((img) => (
              <div key={img.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {img.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : img.status === "failed" ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {img.original_filename}
                    </p>
                    {img.final_filename && (
                      <p className="text-xs text-gray-500">
                        → {img.final_filename}
                      </p>
                    )}
                  </div>
                </div>
                {img.final_url && (
                  <a
                    href={img.final_url}
                    download
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
