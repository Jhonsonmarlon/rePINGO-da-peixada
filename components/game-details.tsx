"use client"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Game } from "./game-library"

interface GameDetailsProps {
  game: Game
  onClose: () => void
}

export default function GameDetails({ game, onClose }: GameDetailsProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-green-100">{game.name}</DialogTitle>
      </DialogHeader>

      <div className="mt-4">
        <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
          <img
            src={game.imageUrl || "/placeholder.svg?height=192&width=384"}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-green-300">Descrição</h3>
            <p className="text-white mt-1">{game.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-green-300">Máximo de Jogadores</h3>
              <p className="text-white mt-1">{game.maxPlayers}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-green-300">Disponível na Hydra</h3>
              <p className="text-white mt-1">{game.availableOnHydra ? "Sim" : "Não"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-green-300">Status</h3>
              <p className="text-white mt-1">{game.played ? "Já foi jogado" : "Ainda não jogado"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-green-300">Adicionado por</h3>
              <p className="text-white mt-1">{game.addedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

