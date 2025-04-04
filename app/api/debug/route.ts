import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db"

export async function GET() {
  try {
    // Tentar estabelecer conexão com o banco de dados
    const pool = await getConnection()

    // Verificar se a conexão está funcionando com uma consulta simples
    const [result] = await pool.query("SELECT 1 as test")

    // Verificar as variáveis de ambiente (sem mostrar senhas)
    const envInfo = {
      DB_HOST: process.env.DB_HOST ? "Configurado" : "Não configurado",
      DB_USER: process.env.DB_USER ? "Configurado" : "Não configurado",
      DB_NAME: process.env.DB_NAME ? "Configurado" : "Não configurado",
      DB_PASSWORD: process.env.DB_PASSWORD ? "Configurado" : "Não configurado",
    }

    return NextResponse.json({
      status: "success",
      message: "Conexão com o banco de dados estabelecida com sucesso",
      dbTest: result,
      envInfo,
    })
  } catch (error: any) {
    console.error("Erro no diagnóstico:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao conectar ao banco de dados",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        envInfo: {
          DB_HOST: process.env.DB_HOST ? "Configurado" : "Não configurado",
          DB_USER: process.env.DB_USER ? "Configurado" : "Não configurado",
          DB_NAME: process.env.DB_NAME ? "Configurado" : "Não configurado",
          DB_PASSWORD: process.env.DB_PASSWORD ? "Configurado" : "Não configurado",
        },
      },
      { status: 500 },
    )
  }
}

