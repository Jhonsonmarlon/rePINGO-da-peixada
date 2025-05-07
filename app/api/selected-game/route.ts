import { type NextRequest, NextResponse } from "next/server"
import { getSelectedGameFromDb, saveSelectedGameToDb } from "@/lib/db"

// GET - Buscar o jogo sorteado mais recente
export async function GET() {
  try {
    const game = await getSelectedGameFromDb()

    if (!game) {
      return NextResponse.json({ message: "Nenhum jogo sorteado encontrado" }, { status: 404 })
    }

    // Mapear os nomes das colunas do Supabase para o formato esperado pelo frontend
    const mappedGame = {
      id: game.id,
      name: game.name,
      description: game.description,
      maxPlayers: game.max_players,
      availableOnHydra: game.available_on_hydra,
      imageUrl: game.image_url || "",
      addedBy: game.added_by,
      played: game.played,
      createdAt: game.created_at,
    }

    return NextResponse.json(mappedGame)
  } catch (error: any) {
    console.error("Erro ao buscar jogo sorteado:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar jogo sorteado",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// POST - Salvar um novo jogo sorteado
export async function POST(request: NextRequest) {
  try {
    const { gameId } = await request.json()

    if (!gameId) {
      return NextResponse.json({ error: "ID do jogo é obrigatório" }, { status: 400 })
    }

    const savedGame = await saveSelectedGameToDb(gameId)

    if (!savedGame) {
      return NextResponse.json({ error: "Erro ao salvar jogo sorteado" }, { status: 500 })
    }

    return NextResponse.json({ success: true, gameId })
  } catch (error: any) {
    console.error("Erro ao salvar jogo sorteado:", error)
    return NextResponse.json(
      {
        error: "Erro ao salvar jogo sorteado",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
