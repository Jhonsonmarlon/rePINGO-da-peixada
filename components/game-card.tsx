"use client"

import { Edit, Info, Trash2, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import type { Game } from "./game-library"

interface GameCardProps {
  game: Game
  onView: (game: Game) => void
  onEdit: (game: Game) => void
  onDelete: (game: Game) => void
  onTogglePlayed: (gameId: string) => void
}

export default function GameCard({ game, onView, onEdit, onDelete, onTogglePlayed }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-green-800/40 border border-green-700 rounded-lg overflow-hidden hover:shadow-lg hover:border-green-500 transition-all"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={game.imageUrl || "/placeholder.svg?height=160&width=300"}
          alt={game.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">{game.name}</h3>
        <p className="text-green-300 text-xs mb-2 line-clamp-2">{game.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-xs text-green-300">
            <span>Jogadores: {game.maxPlayers}</span>
          </div>
          {game.availableOnHydra && (
            <Badge variant="outline" className="bg-green-600/60 text-white border-green-500 text-[10px] px-1.5 py-0.5">
              Hydra
            </Badge>
          )}
        </div>
      </div>
      <div className="p-2 flex justify-between items-center border-t border-green-700/50">
        <Button
          variant="ghost"
          size="icon"
          className={`${game.played ? "text-emerald-400" : "text-amber-400"} hover:text-white hover:bg-green-700 h-8 w-8`}
          onClick={() => onTogglePlayed(game.id)}
          title={game.played ? "Marcar como não jogado" : "Marcar como jogado"}
        >
          <Gamepad2 className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-300 hover:text-white hover:bg-green-700 h-8 w-8"
            onClick={() => onEdit(game)}
            title="Editar jogo"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-green-300 hover:text-white hover:bg-green-700 h-8 w-8"
            onClick={() => onView(game)}
            title="Ver detalhes"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-300 hover:text-white hover:bg-red-700 h-8 w-8"
            onClick={() => onDelete(game)}
            title="Excluir jogo"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
