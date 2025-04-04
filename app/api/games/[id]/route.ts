import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/db"
import type { Game } from "@/components/game-library"

// GET - Buscar um jogo específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const pool = await getConnection()

    const [rows] = await pool.query("SELECT * FROM games WHERE id = ?", [id])
    const games = rows as any[]

    if (games.length === 0) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(games[0])
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

    const pool = await getConnection()

    const [result] = await pool.query(
      `UPDATE games 
       SET name = ?, description = ?, maxPlayers = ?, availableOnHydra = ?, 
           imageUrl = ?, addedBy = ?, played = ? 
       WHERE id = ?`,
      [
        game.name,
        game.description,
        game.maxPlayers,
        game.availableOnHydra ? 1 : 0,
        game.imageUrl || "",
        game.addedBy,
        game.played ? 1 : 0,
        id,
      ],
    )

    const updateResult = result as any

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error)
    return NextResponse.json({ error: "Erro ao atualizar jogo" }, { status: 500 })
  }
}

// DELETE - Excluir um jogo
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const pool = await getConnection()

    const [result] = await pool.query("DELETE FROM games WHERE id = ?", [id])
    const deleteResult = result as any

    if (deleteResult.affectedRows === 0) {
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

    const pool = await getConnection()

    const [result] = await pool.query("UPDATE games SET played = ? WHERE id = ?", [played ? 1 : 0, id])

    const updateResult = result as any

    if (updateResult.affectedRows === 0) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, played })
  } catch (error) {
    console.error("Erro ao atualizar status do jogo:", error)
    return NextResponse.json({ error: "Erro ao atualizar status do jogo" }, { status: 500 })
  }
}

