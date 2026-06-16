"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Wand2, Sparkles, Download, Loader2 } from "lucide-react";

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const enhanceMutation = useMutation({
    mutationFn: (p: string) =>
      api.post("/api/prompts/enhance", { prompt: p }).then((r) => r.data.enhanced_prompt),
    onSuccess: (data) => setEnhanced(data),
  });

  const generateMutation = useMutation({
    mutationFn: (p: string) =>
      api.post("/api/images/generate", {
        prompt,
        enhanced_prompt: p,
      }).then((r) => {
        const genId = r.data.generation_id;
        return pollGeneration(genId);
      }),
    onSuccess: (url) => setResult(url),
  });

  async function pollGeneration(genId: number): Promise<string> {
    for (let i = 0; i < 60; i++) {
      const res = await api.get(`/api/generations/${genId}`);
      const gen = res.data;
      if (gen.status === "completed" && gen.image_url) return gen.image_url;
      if (gen.status === "failed") throw new Error("Génération échouée");
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error("Timeout");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Générateur d&apos;images</h1>
        <p className="text-gray-600 mt-2">
          Décrivez votre image, améliorez le prompt, et générez un visuel unique.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex: un chat noir assis sur une table en bois, lumière naturelle..."
          />
        </div>

        <button
          onClick={() => enhanceMutation.mutate(prompt)}
          disabled={!prompt || enhanceMutation.isPending}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {enhanceMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Améliorer le prompt
        </button>

        {enhanced && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">
              Prompt amélioré
            </p>
            <p className="text-sm text-gray-800">{enhanced}</p>
            <button
              onClick={() => generateMutation.mutate(enhanced)}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Générer l&apos;image
            </button>
          </div>
        )}

        {generateMutation.isPending && (
          <div className="flex items-center gap-3 text-amber-600 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Génération en cours... Veuillez patienter
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <img
              src={result}
              alt="Image générée"
              className="w-full rounded-xl border"
            />
            <a
              href={result}
              download="xtramagical-generated.png"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Download className="w-4 h-4" />
              Télécharger l&apos;image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
