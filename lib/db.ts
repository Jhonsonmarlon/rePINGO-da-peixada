import { createServerSupabaseClient } from "./supabase"
import type { Game } from "@/components/game-library"

// Função para inicializar o banco de dados (verificar se as tabelas existem)
export async function initDatabase() {
  try {
    const supabase = createServerSupabaseClient()

    // Verificar se as tabelas existem consultando os metadados
    const { data: gamesExists, error: gamesError } = await supabase.from("games").select("id").limit(1)

    if (gamesError && !gamesError.message.includes("does not exist")) {
      console.error("Erro ao verificar tabela games:", gamesError)
      return false
    }

    const { data: selectedGameExists, error: selectedGameError } = await supabase
      .from("selected_game")
      .select("id")
      .limit(1)

    if (selectedGameError && !selectedGameError.message.includes("does not exist")) {
      console.error("Erro ao verificar tabela selected_game:", selectedGameError)
      return false
    }

    console.log("Conexão com o Supabase estabelecida com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error)
    return false
  }
}

// Função para buscar todos os jogos
export async function getAllGames() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Erro ao buscar jogos:", error)
    throw error
  }
}

// Função para adicionar um novo jogo
export async function addGameToDb(game: Game) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("games")
      .insert([
        {
          id: game.id,
          name: game.name,
          description: game.description,
          max_players: game.maxPlayers,
          available_on_hydra: game.availableOnHydra,
          image_url: game.imageUrl || "",
          added_by: game.addedBy,
          played: game.played,
          created_at: game.createdAt,
        },
      ])
      .select()

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error("Erro ao adicionar jogo:", error)
    throw error
  }
}

// Função para atualizar um jogo existente
export async function updateGameInDb(game: Game) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("games")
      .update({
        name: game.name,
        description: game.description,
        max_players: game.maxPlayers,
        available_on_hydra: game.availableOnHydra,
        image_url: game.imageUrl || "",
        added_by: game.addedBy,
        played: game.played,
      })
      .eq("id", game.id)
      .select()

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error)
    throw error
  }
}

// Função para excluir um jogo
export async function deleteGameFromDb(id: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("games").delete().eq("id", id)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Erro ao excluir jogo:", error)
    throw error
  }
}

// Função para atualizar o status "played" de um jogo
export async function updateGamePlayedStatus(id: string, played: boolean) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("games").update({ played }).eq("id", id).select()

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error("Erro ao atualizar status do jogo:", error)
    throw error
  }
}

// Função para salvar o jogo sorteado
export async function saveSelectedGameToDb(gameId: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Primeiro, limpar registros anteriores
    await supabase.from("selected_game").delete().neq("id", 0) // Condição para deletar todos os registros

    // Depois, inserir o novo jogo sorteado
    const { data, error } = await supabase
      .from("selected_game")
      .insert([
        {
          game_id: gameId,
          selected_at: Date.now(),
        },
      ])
      .select()

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error("Erro ao salvar jogo sorteado:", error)
    throw error
  }
}

// Função para buscar o jogo sorteado mais recente
export async function getSelectedGameFromDb() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("selected_game")
      .select("game_id, selected_at")
      .order("selected_at", { ascending: false })
      .limit(1)

    if (error) throw error

    if (!data || data.length === 0) {
      return null
    }

    // Buscar os detalhes do jogo
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", data[0].game_id)
      .limit(1)

    if (gameError) throw gameError

    return gameData?.[0] || null
  } catch (error) {
    console.error("Erro ao buscar jogo sorteado:", error)
    throw error
  }
}

// Função para buscar um jogo específico pelo ID
export async function getGameById(id: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("games").select("*").eq("id", id).limit(1)

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error("Erro ao buscar jogo por ID:", error)
    throw error
  }
}
