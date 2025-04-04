import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"
import type { Game } from "@/components/game-library"

// GET - Buscar todos os jogos
export async function GET() {
  try {
    const pool = await getConnection()
    const [rows] = await pool.query("SELECT * FROM games ORDER BY createdAt DESC")

    console.log("Jogos recuperados com sucesso:", rows)
    return NextResponse.json(rows)
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

    console.log("Conectando ao banco de dados...")
    const pool = await getConnection()

    console.log("Inserindo jogo no banco de dados...")
    await pool.query(
      `INSERT INTO games 
       (id, name, description, maxPlayers, availableOnHydra, imageUrl, addedBy, played, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        game.id,
        game.name,
        game.description,
        game.maxPlayers,
        game.availableOnHydra ? 1 : 0,
        game.imageUrl || "",
        game.addedBy,
        game.played ? 1 : 0,
        game.createdAt,
      ],
    )

    console.log("Jogo adicionado com sucesso:", game)
    return NextResponse.json(game, { status: 201 })
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

