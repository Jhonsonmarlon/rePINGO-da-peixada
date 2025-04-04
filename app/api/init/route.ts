import { NextResponse } from "next/server"
import { initDatabase } from "@/lib/db"

// GET - Inicializar o banco de dados
export async function GET() {
  try {
    const success = await initDatabase()

    if (success) {
      return NextResponse.json({ message: "Banco de dados inicializado com sucesso" })
    } else {
      return NextResponse.json({ error: "Erro ao inicializar o banco de dados" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error)
    return NextResponse.json({ error: "Erro ao inicializar o banco de dados" }, { status: 500 })
  }
}

