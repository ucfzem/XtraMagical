"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { useState } from "react";

interface Project {
  id: number;
  name: string;
  naming_pattern: string;
  created_at: string;
}

export default function ProjectList() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("{marque}-{modele}-{couleur}-{contexte}");

  const { data: projects, refetch } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.get("/api/projects").then((r) => r.data),
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/api/projects", { name, naming_pattern: pattern });
    setName("");
    setShowCreate(false);
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes projets</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau projet
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Catalogue été 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pattern de nommage
            </label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles : {"{marque}"}, {"{modèle}"}, {"{couleur}"}, {"{contexte}"}
            </p>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
              Créer
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="border border-gray-300 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {!projects?.length ? (
        <div className="text-center py-16 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun projet pour le moment</p>
          <p className="text-sm">Créez un projet pour commencer à renommer vos photos</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow space-y-2"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
              </div>
              <p className="text-xs text-gray-500 font-mono">{p.naming_pattern}</p>
              <p className="text-xs text-gray-400">
                Créé le {new Date(p.created_at).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
