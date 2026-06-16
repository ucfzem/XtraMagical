"use client";

import Link from "next/link";
import { ArrowRight, Upload, Wand2, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          IA générative pour vos visuels
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          Renommez et générez
          <br />
          <span className="text-primary-600"> avec l&apos;intelligence artificielle</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          XtraMagical automatise le renommage de vos photos en lot et génère des images
          époustouflantes à partir de descriptions simples.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Commencer un projet
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Wand2 className="w-5 h-5" />
            Générer une image
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Renommage intelligent</h2>
          <p className="text-gray-600">
            Importez vos photos en lot. L&apos;IA identifie le contenu (marque, modèle, couleur)
            et renomme chaque fichier selon votre pattern personnalisé.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Jusqu&apos;à 50 images par lot
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Pattern de nommage configurable
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Export ZIP des fichiers renommés
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold">Génération d&apos;images</h2>
          <p className="text-gray-600">
            Décrivez simplement ce que vous voulez voir. L&apos;IA transforme votre idée en
            un prompt détaillé et génère une image de qualité professionnelle.
          </p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Amélioration automatique du prompt
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Modèles SDXL, DALL-E, et plus
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Haute résolution 1024x1024
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
