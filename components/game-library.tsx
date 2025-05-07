"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import {
  Plus,
  Trash2,
  RefreshCcw,
  AlertTriangle,
  Download,
  Upload,
  Settings,
  Lock,
  Gamepad2,
  Info,
  X,
  Globe,
  Github,
  Instagram,
  FileText,
  Linkedin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import GameDetails from "./game-details"
import GameProgress from "./game-progress"
import {
  fetchGames,
  addGame,
  updateGame,
  deleteGame,
  toggleGamePlayed,
  saveSelectedGame,
  fetchSelectedGame,
} from "@/lib/api"
import GameCard from "./game-card"

export type Game = {
  id: string
  name: string
  description: string
  maxPlayers: number
  availableOnHydra: boolean
  imageUrl: string
  addedBy: string
  played: boolean
  createdAt?: number // Timestamp for sorting
}

export default function GameLibrary() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showAddGameModal, setShowAddGameModal] = useState(false)
  const [showEditGameModal, setShowEditGameModal] = useState(false)
  const [showGameDetailsModal, setShowGameDetailsModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false)
  const [showDrawPasswordModal, setShowDrawPasswordModal] = useState(false)
  const [showDeveloperInfoModal, setShowDeveloperInfoModal] = useState(false)
  const [diagnosticPassword, setDiagnosticPassword] = useState("")
  const [drawPassword, setDrawPassword] = useState("")
  const [gameToView, setGameToView] = useState<Game | null>(null)
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [maxPlayersFilter, setMaxPlayersFilter] = useState([10])
  const [showOnlyUnplayed, setShowOnlyUnplayed] = useState(false)
  const [showOnlyHydra, setShowOnlyHydra] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 12

  // Form state
  const [newGame, setNewGame] = useState({
    name: "",
    description: "",
    maxPlayers: 4,
    availableOnHydra: false,
    imageUrl: "",
    addedBy: "",
    played: false,
  })

  // Edit form state
  const [editGame, setEditGame] = useState<Game | null>(null)

  // Filtrar jogos
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Filtro de busca
      if (
        searchQuery &&
        !game.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !game.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Filtro de jogadores máximos
      if (game.maxPlayers > maxPlayersFilter[0]) {
        return false
      }

      // Filtro de jogos não jogados
      if (showOnlyUnplayed && game.played) {
        return false
      }

      // Filtro de jogos disponíveis na Hydra
      if (showOnlyHydra && !game.availableOnHydra) {
        return false
      }

      return true
    })
  }, [games, searchQuery, maxPlayersFilter, showOnlyUnplayed, showOnlyHydra])

  // Paginação
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage)
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * gamesPerPage
    return filteredGames.slice(startIndex, startIndex + gamesPerPage)
  }, [filteredGames, currentPage])

  // Filtrar apenas jogos não jogados para o sorteio
  const unplayedGames = useMemo(() => {
    return games.filter((game) => !game.played)
  }, [games])

  // Inicializar o banco de dados e carregar jogos
  const initializeAndLoadGames = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Inicializar o banco de dados
      await fetch("/api/init")

      // Carregar jogos
      const loadedGames = await fetchGames()
      setGames(loadedGames)

      // Carregar jogo sorteado
      const savedSelectedGame = await fetchSelectedGame()
      if (savedSelectedGame) {
        setSelectedGame(savedSelectedGame)
      }
    } catch (err) {
      console.error("Erro ao inicializar e carregar jogos:", err)
      setError("Não foi possível carregar os jogos. Verifique sua conexão com o banco de dados.")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar jogos ao montar o componente
  useEffect(() => {
    initializeAndLoadGames()
  }, [])

  // Resetar página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, maxPlayersFilter, showOnlyUnplayed, showOnlyHydra])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewGame({ ...newGame, [name]: value })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editGame) return
    const { name, value } = e.target
    setEditGame({ ...editGame, [name]: value })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setNewGame({ ...newGame, availableOnHydra: checked })
  }

  const handleEditCheckboxChange = (field: string, checked: boolean) => {
    if (!editGame) return
    setEditGame({ ...editGame, [field]: checked })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 1
    setNewGame({ ...newGame, maxPlayers: value })
  }

  const handleEditNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editGame) return
    const value = Number.parseInt(e.target.value) || 1
    setEditGame({ ...editGame, maxPlayers: value })
  }

  const handleAddGame = async () => {
    if (!newGame.name || !newGame.description || !newGame.addedBy) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios!",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Tentando adicionar jogo:", newGame)

      // Mostrar toast de carregamento
      toast({
        title: "Adicionando jogo",
        description: "Aguarde enquanto o jogo é adicionado...",
      })

      const addedGame = await addGame(newGame)

      if (addedGame) {
        setGames([addedGame, ...games])
        setShowAddGameModal(false)
        setNewGame({
          name: "",
          description: "",
          maxPlayers: 4,
          availableOnHydra: false,
          imageUrl: "",
          addedBy: "",
          played: false,
        })

        toast({
          title: "Jogo adicionado",
          description: `O jogo "${addedGame.name}" foi adicionado com sucesso!`,
        })
      } else {
        throw new Error("Falha ao adicionar o jogo. Verifique o console para mais detalhes.")
      }
    } catch (err: any) {
      console.error("Erro ao adicionar jogo:", err)
      toast({
        title: "Erro",
        description: `Não foi possível adicionar o jogo: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handleUpdateGame = async () => {
    if (!editGame) return

    if (!editGame.name || !editGame.description || !editGame.addedBy) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios!",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedGame = await updateGame(editGame)

      if (updatedGame) {
        setGames(games.map((game) => (game.id === editGame.id ? updatedGame : game)))

        // If the updated game is the selected game, update it too
        if (selectedGame && selectedGame.id === editGame.id) {
          setSelectedGame(updatedGame)
        }

        // If the updated game is being viewed in details, update it too
        if (gameToView && gameToView.id === editGame.id) {
          setGameToView(updatedGame)
        }

        setShowEditGameModal(false)
        setEditGame(null)

        toast({
          title: "Jogo atualizado",
          description: `O jogo "${updatedGame.name}" foi atualizado com sucesso!`,
        })
      }
    } catch (err) {
      console.error("Erro ao atualizar jogo:", err)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jogo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGame = async () => {
    if (!gameToDelete) return

    try {
      const success = await deleteGame(gameToDelete.id)

      if (success) {
        const newGames = games.filter((game) => game.id !== gameToDelete.id)
        setGames(newGames)

        // If the deleted game is the selected game, clear it
        if (selectedGame && selectedGame.id === gameToDelete.id) {
          setSelectedGame(null)
        }

        // If the deleted game is being viewed in details, close the modal
        if (gameToView && gameToView.id === gameToDelete.id) {
          setShowGameDetailsModal(false)
        }

        toast({
          title: "Jogo excluído",
          description: `O jogo "${gameToDelete.name}" foi excluído com sucesso!`,
        })
      }
    } catch (err) {
      console.error("Erro ao excluir jogo:", err)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o jogo. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteConfirm(false)
      setGameToDelete(null)
    }
  }

  const handleDrawClick = () => {
    if (unplayedGames.length === 0) {
      toast({
        title: "Sem jogos não jogados",
        description: "Não há jogos não jogados disponíveis para sorteio!",
        variant: "destructive",
      })
      return
    }

    setShowDrawPasswordModal(true)
  }

  const handleDrawPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrawPassword(e.target.value)
  }

  const handleDrawPasswordSubmit = () => {
    if (drawPassword === "404") {
      setShowDrawPasswordModal(false)
      setDrawPassword("")
      handleSpin()
    } else {
      toast({
        title: "Senha incorreta",
        description: "A senha informada está incorreta.",
        variant: "destructive",
      })
    }
  }

  const handleSpin = () => {
    if (unplayedGames.length === 0) {
      toast({
        title: "Sem jogos não jogados",
        description: "Não há jogos não jogados disponíveis para sorteio!",
        variant: "destructive",
      })
      return
    }

    setIsSpinning(true)
  }

  const handleSelectionComplete = async (game: Game) => {
    setSelectedGame(game)
    setIsSpinning(false)

    // Salvar o jogo sorteado no banco de dados
    try {
      await saveSelectedGame(game.id)
    } catch (err) {
      console.error("Erro ao salvar jogo sorteado:", err)
    }
  }

  const handleViewGameDetails = (game: Game) => {
    setGameToView(game)
    setShowGameDetailsModal(true)
  }

  const handleEditGame = (game: Game) => {
    setEditGame({ ...game })
    setShowEditGameModal(true)
  }

  const handleConfirmDelete = (game: Game) => {
    setGameToDelete(game)
    setShowDeleteConfirm(true)
  }

  const handleToggleGamePlayed = async (gameId: string) => {
    const gameToToggle = games.find((game) => game.id === gameId)

    if (!gameToToggle) return

    try {
      const newPlayedStatus = !gameToToggle.played
      const success = await toggleGamePlayed(gameId, newPlayedStatus)

      if (success) {
        setGames(games.map((game) => (game.id === gameId ? { ...game, played: newPlayedStatus } : game)))

        // If the toggled game is the selected game, update it too
        if (selectedGame && selectedGame.id === gameId) {
          setSelectedGame({ ...selectedGame, played: newPlayedStatus })
        }

        // If the toggled game is being viewed in details, update it too
        if (gameToView && gameToView.id === gameId) {
          setGameToView({ ...gameToView, played: newPlayedStatus })
        }

        toast({
          title: newPlayedStatus ? "Jogo marcado como jogado" : "Jogo marcado como não jogado",
          description: `O status do jogo foi atualizado com sucesso!`,
        })
      }
    } catch (err) {
      console.error("Erro ao atualizar status do jogo:", err)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do jogo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    initializeAndLoadGames()
    toast({
      title: "Atualizando",
      description: "Buscando jogos do banco de dados...",
    })
  }

  const exportGamesToFile = () => {
    const dataStr = JSON.stringify(games, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `repingo-games-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Exportação concluída",
      description: `${games.length} jogos exportados com sucesso!`,
    })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const importGamesFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const importedGames = JSON.parse(event.target?.result as string) as Game[]

        // Adicionar cada jogo importado ao banco de dados
        let successCount = 0
        for (const game of importedGames) {
          try {
            const addedGame = await addGame({
              name: game.name,
              description: game.description,
              maxPlayers: game.maxPlayers,
              availableOnHydra: game.availableOnHydra,
              imageUrl: game.imageUrl,
              addedBy: game.addedBy,
              played: game.played,
            })

            if (addedGame) {
              successCount++
            }
          } catch (err) {
            console.error("Erro ao importar jogo:", game, err)
          }
        }

        // Recarregar jogos após a importação
        await initializeAndLoadGames()

        toast({
          title: "Importação concluída",
          description: `${successCount} de ${importedGames.length} jogos importados com sucesso!`,
        })
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Erro ao importar jogos. Verifique se o arquivo está no formato correto.",
          variant: "destructive",
        })
        console.error(error)
      }
    }
    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }

  const handleDiagnosticClick = () => {
    setShowDiagnosticModal(true)
  }

  const handleDeveloperInfoClick = () => {
    setShowDeveloperInfoModal(true)
  }

  const handleDiagnosticPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiagnosticPassword(e.target.value)
  }

  const handleDiagnosticSubmit = () => {
    if (diagnosticPassword === "4041") {
      setShowDiagnosticModal(false)
      setDiagnosticPassword("")
      window.location.href = "/diagnostico"
    } else {
      toast({
        title: "Senha incorreta",
        description: "A senha informada está incorreta.",
        variant: "destructive",
      })
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setMaxPlayersFilter([10])
    setShowOnlyUnplayed(false)
    setShowOnlyHydra(false)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
      <header className="text-center py-6 px-4">
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src="/logoofc.png"
              alt="Logo rePINGO da Peixada"
              className="h-20 md:h-24 w-auto filter drop-shadow-lg"
            />
          </motion.div>
        </div>

        <h1 className="text-3xl font-bold text-green-100 mb-2 flex items-center justify-center">
          <Gamepad2 className="w-7 h-7 mr-2 text-green-300" />
          rePINGO da Peixada
          <Gamepad2 className="w-7 h-7 ml-2 text-green-300" />
        </h1>
        <p className="text-green-200 text-lg">Biblioteca de Jogos Sorteáveis</p>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-red-200">Erro de Conexão</h3>
            </div>
            <p className="text-red-200">{error}</p>
            <Button onClick={handleRefresh} variant="destructive" className="mt-2 bg-red-700 hover:bg-red-600">
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar com filtros */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-green-800/40 border border-green-600 rounded-lg p-4 sticky top-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-green-100 mb-3">Filtros</h2>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-green-400" />
                  <Input
                    placeholder="Buscar jogos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-green-900/50 border-green-600 text-white placeholder:text-green-400"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-green-200 mb-2">Máximo de Jogadores</h3>
                <div className="space-y-3">
                  <Slider
                    value={maxPlayersFilter}
                    onValueChange={setMaxPlayersFilter}
                    max={10}
                    min={1}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-green-300">
                    <span>1</span>
                    <span>{maxPlayersFilter[0]}</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="only-unplayed"
                    checked={showOnlyUnplayed}
                    onCheckedChange={(checked) => setShowOnlyUnplayed(!!checked)}
                    className="border-green-500 data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor="only-unplayed" className="text-green-200">
                    Apenas não jogados
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="only-hydra"
                    checked={showOnlyHydra}
                    onCheckedChange={(checked) => setShowOnlyHydra(!!checked)}
                    className="border-green-500 data-[state=checked]:bg-green-500"
                  />
                  <Label htmlFor="only-hydra" className="text-green-200">
                    Disponível na Hydra
                  </Label>
                </div>
              </div>

              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="w-full border-green-500 text-green-200 hover:bg-green-700/50"
              >
                Limpar filtros
              </Button>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleDrawClick}
                  disabled={isSpinning || unplayedGames.length === 0 || isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSpinning ? (
                    "Sorteando..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-1" /> Sortear Jogo
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowAddGameModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-1" /> Adicionar Jogo
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={exportGamesToFile}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                    disabled={isLoading || games.length === 0}
                    title="Exportar Jogos"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleImportClick}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                    disabled={isLoading}
                    title="Importar Jogos"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                    disabled={isLoading}
                    title="Atualizar Jogos"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={importGamesFromFile}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1">
            {/* Jogo sorteado */}
            {selectedGame && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-700/60 rounded-lg border border-green-500 shadow-lg"
              >
                <h3 className="text-xl font-bold text-green-100 mb-2">Jogo da Vez</h3>
                <div className="flex items-center">
                  <div className="w-24 h-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
                    <img
                      src={selectedGame.imageUrl || "/placeholder.svg?height=96&width=96"}
                      alt={selectedGame.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedGame.name}</h4>
                    <p className="text-green-200 line-clamp-2">{selectedGame.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-300 text-sm mr-4">Jogadores: {selectedGame.maxPlayers}</span>
                      {selectedGame.availableOnHydra && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Disponível na Hydra</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Roda de sorteio (visível apenas quando está sorteando) */}
            {isSpinning && (
              <div className="mb-6">
                <GameProgress
                  games={unplayedGames}
                  isSelecting={isSpinning}
                  selectedGame={selectedGame}
                  onSelectionComplete={handleSelectionComplete}
                />
              </div>
            )}

            {/* Grid de jogos */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-100">
                  Biblioteca de Jogos{" "}
                  <span className="text-sm font-normal text-green-300">({filteredGames.length} jogos encontrados)</span>
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-green-500 text-green-200 hover:bg-green-700/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-green-200">
                    Página {currentPage} de {Math.max(1, totalPages)}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-green-500 text-green-200 hover:bg-green-700/50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : paginatedGames.length === 0 ? (
                <div className="flex items-center justify-center h-64 bg-green-800/30 rounded-lg border border-green-700">
                  <p className="text-green-300">Nenhum jogo encontrado com os filtros atuais.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onView={handleViewGameDetails}
                      onEdit={handleEditGame}
                      onDelete={handleConfirmDelete}
                      onTogglePlayed={handleToggleGamePlayed}
                    />
                  ))}
                </div>
              )}

              {/* Paginação inferior */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-200 hover:bg-green-700/50"
                    >
                      Primeira
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-green-500 text-green-200 hover:bg-green-700/50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-green-200">
                      {currentPage} de {totalPages}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-green-500 text-green-200 hover:bg-green-700/50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-200 hover:bg-green-700/50"
                    >
                      Última
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botões de diagnóstico e informações no canto inferior esquerdo */}
      <div className="fixed bottom-4 left-4 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeveloperInfoClick}
          className="bg-green-800/40 hover:bg-green-700/60 text-green-300 rounded-full h-10 w-10"
          title="Informações do Desenvolvedor"
        >
          <Info className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDiagnosticClick}
          className="bg-green-800/40 hover:bg-green-700/60 text-green-300 rounded-full h-10 w-10"
          title="Diagnóstico"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Add Game Modal */}
      <Dialog open={showAddGameModal} onOpenChange={setShowAddGameModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-100">Adicionar Novo Jogo</DialogTitle>
            <DialogDescription className="text-green-300">
              Preencha os detalhes do jogo que deseja adicionar à biblioteca.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-green-200">
                Nome do Jogo *
              </Label>
              <Input
                id="name"
                name="name"
                value={newGame.name}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-green-200">
                Descrição *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newGame.description}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="maxPlayers" className="text-green-200">
                Número Máximo de Jogadores
              </Label>
              <Input
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                min="1"
                value={newGame.maxPlayers}
                onChange={handleNumberChange}
                className="bg-green-800/60 border-green-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="availableOnHydra"
                checked={newGame.availableOnHydra}
                onCheckedChange={handleCheckboxChange}
                className="border-green-500 data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="availableOnHydra" className="text-green-200">
                Disponível na Hydra
              </Label>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-green-200">
                URL da Imagem
              </Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={newGame.imageUrl}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div>
              <Label htmlFor="addedBy" className="text-green-200">
                Adicionado por *
              </Label>
              <Input
                id="addedBy"
                name="addedBy"
                value={newGame.addedBy}
                onChange={handleInputChange}
                className="bg-green-800/60 border-green-600 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="played"
                checked={newGame.played}
                onCheckedChange={(checked) => setNewGame({ ...newGame, played: !!checked })}
                className="border-green-500 data-[state=checked]:bg-green-500"
              />
              <Label htmlFor="played" className="text-green-200">
                Já foi jogado
              </Label>
            </div>

            <Button onClick={handleAddGame} className="w-full bg-green-500 hover:bg-green-600 text-white mt-4">
              Adicionar Jogo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Game Modal */}
      <Dialog open={showEditGameModal} onOpenChange={setShowEditGameModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-100">Editar Jogo</DialogTitle>
            <DialogDescription className="text-green-300">Atualize as informações do jogo.</DialogDescription>
          </DialogHeader>

          {editGame && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name" className="text-green-200">
                  Nome do Jogo *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editGame.name}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-green-200">
                  Descrição *
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editGame.description}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-maxPlayers" className="text-green-200">
                  Número Máximo de Jogadores
                </Label>
                <Input
                  id="edit-maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min="1"
                  value={editGame.maxPlayers}
                  onChange={handleEditNumberChange}
                  className="bg-green-800/60 border-green-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-availableOnHydra"
                  checked={editGame.availableOnHydra}
                  onCheckedChange={(checked) => handleEditCheckboxChange("availableOnHydra", !!checked)}
                  className="border-green-500 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="edit-availableOnHydra" className="text-green-200">
                  Disponível na Hydra
                </Label>
              </div>

              <div>
                <Label htmlFor="edit-imageUrl" className="text-green-200">
                  URL da Imagem
                </Label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  value={editGame.imageUrl}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <Label htmlFor="edit-addedBy" className="text-green-200">
                  Adicionado por *
                </Label>
                <Input
                  id="edit-addedBy"
                  name="addedBy"
                  value={editGame.addedBy}
                  onChange={handleEditInputChange}
                  className="bg-green-800/60 border-green-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-played"
                  checked={editGame.played}
                  onCheckedChange={(checked) => handleEditCheckboxChange("played", !!checked)}
                  className="border-green-500 data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="edit-played" className="text-green-200">
                  Já foi jogado
                </Label>
              </div>

              <DialogFooter className="flex justify-between gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={() => handleConfirmDelete(editGame)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </Button>
                <Button onClick={handleUpdateGame} className="bg-green-500 hover:bg-green-600 text-white">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Game Details Modal */}
      <Dialog open={showGameDetailsModal} onOpenChange={setShowGameDetailsModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          {gameToView && <GameDetails game={gameToView} onClose={() => setShowGameDetailsModal(false)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-green-900 border-red-600 text-green-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-green-200">
              Tem certeza que deseja excluir o jogo "{gameToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="bg-green-800 text-white hover:bg-green-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGame} className="bg-red-600 text-white hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diagnostic Password Modal */}
      <Dialog open={showDiagnosticModal} onOpenChange={setShowDiagnosticModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-100">Acesso ao Diagnóstico</DialogTitle>
            <DialogDescription className="text-green-300">
              Digite a senha para acessar a página de diagnóstico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="diagnostic-password" className="text-green-200">
                Senha
              </Label>
              <Input
                id="diagnostic-password"
                type="password"
                value={diagnosticPassword}
                onChange={handleDiagnosticPasswordChange}
                className="bg-green-800/60 border-green-600 text-white"
                placeholder="Digite a senha"
              />
            </div>

            <Button onClick={handleDiagnosticSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Acessar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draw Password Modal */}
      <Dialog open={showDrawPasswordModal} onOpenChange={setShowDrawPasswordModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-100">Acesso ao Sorteio</DialogTitle>
            <DialogDescription className="text-green-300">
              Digite a senha para realizar o sorteio de jogos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="draw-password" className="text-green-200">
                Senha
              </Label>
              <Input
                id="draw-password"
                type="password"
                value={drawPassword}
                onChange={handleDrawPasswordChange}
                className="bg-green-800/60 border-green-600 text-white"
                placeholder="Digite a senha"
              />
            </div>

            <Button onClick={handleDrawPasswordSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Sortear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Developer Info Modal */}
      <Dialog open={showDeveloperInfoModal} onOpenChange={setShowDeveloperInfoModal}>
        <DialogContent className="bg-green-900 border-green-600 text-green-100 max-w-4xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-bold text-green-100">Sobre o Desenvolvedor</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center mt-6">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-500 mb-4">
              <img src="/perfil.jpg" alt="JJdev - Desenvolvedor" className="w-full h-full object-cover" />
            </div>

            <h2 className="text-2xl font-bold text-green-200 mb-6">JJdev</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
              <a
                href="https://jhonsondev.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-800/60 rounded-lg hover:bg-green-700/80 transition-colors"
              >
                <Globe className="w-5 h-5 mr-3 text-green-300" />
                <span>Portfolio</span>
              </a>

              <a
                href="https://github.com/Jhonsonmarlon"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-800/60 rounded-lg hover:bg-green-700/80 transition-colors"
              >
                <Github className="w-5 h-5 mr-3 text-green-300" />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.instagram.com/jhonson_marlon/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-800/60 rounded-lg hover:bg-green-700/80 transition-colors"
              >
                <Instagram className="w-5 h-5 mr-3 text-green-300" />
                <span>Instagram</span>
              </a>

              <a
                href="http://lattes.cnpq.br/5744713347931747"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-800/60 rounded-lg hover:bg-green-700/80 transition-colors"
              >
                <FileText className="w-5 h-5 mr-3 text-green-300" />
                <span>Lattes</span>
              </a>

              <a
                href="https://www.linkedin.com/in/jhonson-marlon-244908152/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-green-800/60 rounded-lg hover:bg-green-700/80 transition-colors md:col-span-2"
              >
                <Linkedin className="w-5 h-5 mr-3 text-green-300" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setShowDeveloperInfoModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <X className="w-4 h-4 mr-2" /> Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
