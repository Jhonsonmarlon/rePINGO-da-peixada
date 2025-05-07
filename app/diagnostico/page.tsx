"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database, RefreshCw } from "lucide-react"

export default function DiagnosticoPage() {
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const executarDiagnostico = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug")
      const data = await response.json()
      setDiagnostico(data)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao executar diagnóstico")
      console.error("Erro no diagnóstico:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    executarDiagnostico()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Diagnóstico do Sistema</h1>

        <Card className="bg-green-800/40 border-green-600 shadow-xl backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-green-100 flex items-center">
              <Database className="mr-2 h-6 w-6" />
              Status da Conexão com o Supabase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-8 w-8 text-green-400 animate-spin" />
                <span className="ml-3 text-green-200">Verificando conexão...</span>
              </div>
            ) : error ? (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-200">Erro ao executar diagnóstico</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className={`p-4 rounded-lg mb-4 ${diagnostico?.status === "success" ? "bg-green-700/30 border border-green-500" : "bg-red-900/30 border border-red-500"}`}
                >
                  <div className="flex items-start">
                    {diagnostico?.status === "success" ? (
                      <CheckCircle className="h-6 w-6 text-green-400 mr-2 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-400 mr-2 mt-0.5" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {diagnostico?.status === "success" ? "Conexão bem-sucedida" : "Falha na conexão"}
                      </h3>
                      <p className={diagnostico?.status === "success" ? "text-green-200" : "text-red-200"}>
                        {diagnostico?.message}
                      </p>
                      {diagnostico?.error && (
                        <div className="mt-2 p-2 bg-red-900/50 rounded text-red-200 text-sm">
                          <p className="font-semibold">Detalhes do erro:</p>
                          <p>{diagnostico.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-200 mb-2">Variáveis de Ambiente</h3>
                  <ul className="space-y-2">
                    {diagnostico?.envInfo &&
                      Object.entries(diagnostico.envInfo).map(([key, value]: [string, any]) => (
                        <li key={key} className="flex items-center">
                          <span className="text-green-300 font-mono mr-2">{key}:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${value === "Configurado" ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"}`}
                          >
                            {value}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button onClick={executarDiagnostico} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verificar Novamente
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-800/40 border-green-600 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-green-100">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-green-200">
            <p>Se o diagnóstico mostrar problemas de conexão com o Supabase, verifique:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Se as variáveis de ambiente do Supabase estão configuradas corretamente no Vercel</li>
              <li>Se o projeto do Supabase está ativo e acessível</li>
              <li>Se as credenciais do Supabase estão corretas</li>
              <li>Se as tabelas necessárias foram criadas no banco de dados</li>
            </ol>
            <p className="mt-4">
              Após corrigir os problemas, clique em "Verificar Novamente" para atualizar o diagnóstico.
            </p>
            <div className="pt-4">
              <Button onClick={() => (window.location.href = "/")} className="w-full bg-green-600 hover:bg-green-700">
                Voltar para a Página Principal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
