"use client"

import { Info, Check, X, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Game } from "./game-library"

interface GameListProps {
  games: Game[]
  onViewDetails: (game: Game) => void
  onTogglePlayed: (gameId: string) => void
  onEditGame: (game: Game) => void
  onDeleteGame: (game: Game) => void
}

export default function GameList({ games, onViewDetails, onTogglePlayed, onEditGame, onDeleteGame }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-green-800/30 rounded-lg border border-green-700">
        <p className="text-green-300">Nenhum jogo na biblioteca ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {games.map((game) => (
        <div
          key={game.id}
          className="flex items-center p-3 bg-green-800/40 rounded-lg border border-green-700 hover:bg-green-700/50 transition-colors"
        >
          <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
            <img
              src={game.imageUrl || "/placeholder.svg?height=48&width=48"}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-white font-medium truncate">{game.name}</h3>
            <div className="flex items-center text-xs text-green-300 gap-2">
              <span>Jogadores: {game.maxPlayers}</span>
              {game.availableOnHydra && (
                <Badge
                  variant="outline"
                  className="bg-green-600/30 text-white border-green-500 text-[10px] px-1.5 py-0.5"
                >
                  Hydra
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`${
                  game.played ? "bg-emerald-600/30 border-emerald-500" : "bg-amber-600/30 border-amber-500"
                } text-white text-[10px] px-1.5 py-0.5`}
              >
                {game.played ? "Jogado" : "Não jogado"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`text-${game.played ? "emerald" : "amber"}-400 hover:text-white hover:bg-green-700`}
              onClick={() => onTogglePlayed(game.id)}
              title={game.played ? "Marcar como não jogado" : "Marcar como jogado"}
            >
              {game.played ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="sr-only">{game.played ? "Marcar como não jogado" : "Marcar como jogado"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-300 hover:text-white hover:bg-green-700"
              onClick={() => onEditGame(game)}
              title="Editar jogo"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar jogo</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-green-300 hover:text-white hover:bg-green-700"
              onClick={() => onViewDetails(game)}
              title="Ver detalhes"
            >
              <Info className="h-4 w-4" />
              <span className="sr-only">Ver detalhes</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-300 hover:text-white hover:bg-red-700"
              onClick={() => onDeleteGame(game)}
              title="Excluir jogo"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir jogo</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

