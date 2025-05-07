import { type NextRequest, NextResponse } from "next/server"
import { getGameById, updateGameInDb, deleteGameFromDb, updateGamePlayedStatus } from "@/lib/db"
import type { Game } from "@/components/game-library"

// GET - Buscar um jogo específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const game = await getGameById(id)

    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
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
  } catch (error) {
    console.error("Erro ao buscar jogo:", error)
    return NextResponse.json({ error: "Erro ao buscar jogo" }, { status: 500 })
  }
}

// PUT - Atualizar um jogo
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const game = (await request.json()) as Game

    // Validar dados
    if (!game.name || !game.description || !game.addedBy) {
      return NextResponse.json(
        { error: "Dados incompletos. Nome, descrição e adicionado por são obrigatórios." },
        { status: 400 },
      )
    }

    const updatedGame = await updateGameInDb(game)

    if (!updatedGame) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    // Mapear os nomes das colunas do Supabase para o formato esperado pelo frontend
    const mappedGame = {
      id: updatedGame.id,
      name: updatedGame.name,
      description: updatedGame.description,
      maxPlayers: updatedGame.max_players,
      availableOnHydra: updatedGame.available_on_hydra,
      imageUrl: updatedGame.image_url || "",
      addedBy: updatedGame.added_by,
      played: updatedGame.played,
      createdAt: updatedGame.created_at,
    }

    return NextResponse.json(mappedGame)
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error)
    return NextResponse.json({ error: "Erro ao atualizar jogo" }, { status: 500 })
  }
}

// DELETE - Excluir um jogo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = await deleteGameFromDb(id)

    if (!success) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir jogo:", error)
    return NextResponse.json({ error: "Erro ao excluir jogo" }, { status: 500 })
  }
}

// PATCH - Atualizar apenas o status "played" de um jogo
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { played } = (await request.json()) as { played: boolean }

    const updatedGame = await updateGamePlayedStatus(id, played)

    if (!updatedGame) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, played })
  } catch (error) {
    console.error("Erro ao atualizar status do jogo:", error)
    return NextResponse.json({ error: "Erro ao atualizar status do jogo" }, { status: 500 })
  }
}
