import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

// GET - Buscar o jogo sorteado mais recente
export async function GET() {
  try {
    const pool = await getConnection()

    // Buscar o jogo sorteado mais recente
    const [rows] = await pool.query(`
      SELECT g.* FROM games g
      JOIN selected_game sg ON g.id = sg.game_id
      ORDER BY sg.selected_at DESC
      LIMIT 1
    `)

    const games = rows as any[]

    if (games.length === 0) {
      return NextResponse.json({ message: "Nenhum jogo sorteado encontrado" }, { status: 404 })
    }

    return NextResponse.json(games[0])
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

    const pool = await getConnection()

    // Verificar se o jogo existe
    const [gameRows] = await pool.query("SELECT * FROM games WHERE id = ?", [gameId])
    const games = gameRows as any[]

    if (games.length === 0) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    // Limpar registros anteriores e inserir o novo jogo sorteado
    await pool.query("DELETE FROM selected_game")
    await pool.query("INSERT INTO selected_game (game_id, selected_at) VALUES (?, ?)", [gameId, Date.now()])

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

