import { type NextRequest, NextResponse } from "next/server"
import { getAllGames, addGameToDb } from "@/lib/db"
import type { Game } from "@/components/game-library"

// GET - Buscar todos os jogos
export async function GET() {
  try {
    const games = await getAllGames()

    // Mapear os nomes das colunas do Supabase para o formato esperado pelo frontend
    const mappedGames = games.map((game) => ({
      id: game.id,
      name: game.name,
      description: game.description,
      maxPlayers: game.max_players,
      availableOnHydra: game.available_on_hydra,
      imageUrl: game.image_url || "",
      addedBy: game.added_by,
      played: game.played,
      createdAt: game.created_at,
    }))

    console.log("Jogos recuperados com sucesso:", mappedGames.length)
    return NextResponse.json(mappedGames)
  } catch (error: any) {
    console.error("Erro ao buscar jogos:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar jogos",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// POST - Adicionar um novo jogo
export async function POST(request: NextRequest) {
  try {
    console.log("Recebendo solicitação POST para adicionar jogo")
    const game = (await request.json()) as Game

    console.log("Dados do jogo recebidos:", game)

    // Validar dados
    if (!game.name || !game.description || !game.addedBy) {
      console.error("Dados incompletos:", game)
      return NextResponse.json(
        { error: "Dados incompletos. Nome, descrição e adicionado por são obrigatórios." },
        { status: 400 },
      )
    }

    // Garantir que o jogo tenha um ID e timestamp
    if (!game.id) {
      game.id = Date.now().toString()
    }

    if (!game.createdAt) {
      game.createdAt = Date.now()
    }

    console.log("Inserindo jogo no banco de dados...")
    const addedGame = await addGameToDb(game)

    if (!addedGame) {
      throw new Error("Falha ao adicionar o jogo no banco de dados")
    }

    // Mapear os nomes das colunas do Supabase para o formato esperado pelo frontend
    const mappedGame = {
      id: addedGame.id,
      name: addedGame.name,
      description: addedGame.description,
      maxPlayers: addedGame.max_players,
      availableOnHydra: addedGame.available_on_hydra,
      imageUrl: addedGame.image_url || "",
      addedBy: addedGame.added_by,
      played: addedGame.played,
      createdAt: addedGame.created_at,
    }

    console.log("Jogo adicionado com sucesso:", mappedGame)
    return NextResponse.json(mappedGame, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao adicionar jogo:", error)
    return NextResponse.json(
      {
        error: "Erro ao adicionar jogo",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
