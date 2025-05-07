import type { Game } from "@/components/game-library"

// Função para buscar todos os jogos
export async function fetchGames(): Promise<Game[]> {
  try {
    console.log("Buscando jogos da API...")
    const response = await fetch("/api/games", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao buscar jogos: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Jogos recebidos:", data)
    return data
  } catch (error) {
    console.error("Erro ao buscar jogos:", error)
    return []
  }
}

// Função para adicionar um novo jogo
export async function addGame(game: Omit<Game, "id" | "createdAt">): Promise<Game | null> {
  try {
    console.log("Adicionando novo jogo:", game)
    const gameWithTimestamp = {
      ...game,
      id: Date.now().toString(),
      createdAt: Date.now(),
    }

    console.log("Enviando jogo para API:", gameWithTimestamp)
    const response = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameWithTimestamp),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao adicionar jogo: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Jogo adicionado com sucesso:", data)
    return data
  } catch (error) {
    console.error("Erro ao adicionar jogo:", error)
    return null
  }
}

// Função para atualizar um jogo existente
export async function updateGame(game: Game): Promise<Game | null> {
  try {
    console.log("Atualizando jogo:", game)
    const response = await fetch(`/api/games/${game.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(game),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao atualizar jogo: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Jogo atualizado com sucesso:", data)
    return data
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error)
    return null
  }
}

// Função para excluir um jogo
export async function deleteGame(id: string): Promise<boolean> {
  try {
    console.log("Excluindo jogo:", id)
    const response = await fetch(`/api/games/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao excluir jogo: ${response.status} ${response.statusText}`)
    }

    console.log("Jogo excluído com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao excluir jogo:", error)
    return false
  }
}

// Função para atualizar apenas o status "played" de um jogo
export async function toggleGamePlayed(id: string, played: boolean): Promise<boolean> {
  try {
    console.log("Alterando status do jogo:", id, played)
    const response = await fetch(`/api/games/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ played }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao atualizar status do jogo: ${response.status} ${response.statusText}`)
    }

    console.log("Status do jogo alterado com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao atualizar status do jogo:", error)
    return false
  }
}

// Função para salvar o jogo sorteado
export async function saveSelectedGame(gameId: string): Promise<boolean> {
  try {
    console.log("Salvando jogo sorteado:", gameId)
    const response = await fetch("/api/selected-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao salvar jogo sorteado: ${response.status} ${response.statusText}`)
    }

    console.log("Jogo sorteado salvo com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao salvar jogo sorteado:", error)
    return false
  }
}

// Função para carregar o jogo sorteado
export async function fetchSelectedGame(): Promise<Game | null> {
  try {
    console.log("Buscando jogo sorteado...")
    const response = await fetch("/api/selected-game", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      console.log("Nenhum jogo sorteado encontrado")
      return null
    }

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Erro na resposta da API:", errorData)
      throw new Error(`Erro ao buscar jogo sorteado: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Jogo sorteado recebido:", data)
    return data
  } catch (error) {
    console.error("Erro ao buscar jogo sorteado:", error)
    return null
  }
}
