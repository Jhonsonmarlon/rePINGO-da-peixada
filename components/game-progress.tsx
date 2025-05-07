"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import type { Game } from "./game-library"

interface GameProgressProps {
  games: Game[]
  isSelecting: boolean
  selectedGame: Game | null
  onSelectionComplete: (game: Game) => void
}

export default function GameProgress({ games, isSelecting, selectedGame, onSelectionComplete }: GameProgressProps) {
  const [progress, setProgress] = useState(0)

  // Reset progress when selection starts
  useEffect(() => {
    if (isSelecting) {
      setProgress(0)
    }
  }, [isSelecting])

  // Handle progress animation
  useEffect(() => {
    if (!isSelecting || games.length === 0) {
      return
    }

    // Simulate progress over 3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1
        return newProgress <= 100 ? newProgress : 100
      })
    }, 30) // 30ms * 100 steps = ~3 seconds

    return () => clearInterval(interval)
  }, [isSelecting, games.length])

  // Handle selection completion separately from progress updates
  useEffect(() => {
    if (isSelecting && progress === 100 && games.length > 0) {
      // Small delay to ensure we don't update state during render
      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * games.length)
        onSelectionComplete(games[randomIndex])
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [progress, isSelecting, games, onSelectionComplete])

  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-green-800/30 rounded-lg border border-green-700">
        <p className="text-green-300">Não há jogos não jogados disponíveis para sorteio!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative pt-6 pb-2">
        <h3 className="text-lg font-medium text-green-200 mb-2">
          {isSelecting ? "Sorteando jogo..." : "Pronto para sortear"}
        </h3>
        <Progress
          value={progress}
          className="h-4 bg-green-900/50"
          indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-400"
        />

        {isSelecting && <div className="mt-2 text-center text-green-300 text-sm">{progress}% completo</div>}
      </div>

      {selectedGame && !isSelecting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-800/40 rounded-lg border border-green-500 shadow-lg"
        >
          <div className="flex items-start">
            <div className="w-24 h-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
              <img
                src={selectedGame.imageUrl || "/placeholder.svg?height=96&width=96"}
                alt={selectedGame.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white">{selectedGame.name}</h4>
              <p className="text-green-200 text-sm mb-2">{selectedGame.description}</p>
              <div className="flex items-center flex-wrap gap-2">
                <span className="bg-green-700/60 text-green-100 text-xs px-2 py-1 rounded-full">
                  Jogadores: {selectedGame.maxPlayers}
                </span>
                {selectedGame.availableOnHydra && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Disponível na Hydra</span>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedGame.played ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {selectedGame.played ? "Já jogado" : "Não jogado"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
