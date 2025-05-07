import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    // Tentar estabelecer conexão com o Supabase
    const supabase = createServerSupabaseClient()

    // Verificar se a conexão está funcionando com uma consulta simples
    const { data, error } = await supabase.from("games").select("id").limit(1)

    if (error) throw error

    // Verificar as variáveis de ambiente (sem mostrar senhas)
    const envInfo = {
      SUPABASE_URL: process.env.SUPABASE_URL ? "Configurado" : "Não configurado",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Não configurado",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
    }

    return NextResponse.json({
      status: "success",
      message: "Conexão com o Supabase estabelecida com sucesso",
      dbTest: data,
      envInfo,
    })
  } catch (error: any) {
    console.error("Erro no diagnóstico:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao conectar ao Supabase",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        envInfo: {
          SUPABASE_URL: process.env.SUPABASE_URL ? "Configurado" : "Não configurado",
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurado" : "Não configurado",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado" : "Não configurado",
        },
      },
      { status: 500 },
    )
  }
}
