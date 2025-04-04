import mysql from "mysql2/promise"

// Configuração para conexão com o MySQL do Railway
const dbConfig = {
  // Usar o host público do Railway em vez do interno
  host: process.env.DB_HOST || "switchback.proxy.rlwy.net",
  // Usar a porta pública do Railway (15964 no seu caso)
  port: Number.parseInt(process.env.DB_PORT || "15964", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "yPZMIrSPYXypuUfvbcIscAkLMpXfEATo",
  database: process.env.DB_NAME || "railway",
}

// Função para criar um pool de conexões com o banco de dados
export async function getConnection() {
  try {
    console.log("Conectando ao banco de dados com as seguintes configurações:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      // Não logamos a senha por motivos de segurança
    })

    const pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        // Necessário para conexões seguras com o Railway
        rejectUnauthorized: false,
      },
    })

    return pool
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error)
    throw new Error("Não foi possível conectar ao banco de dados")
  }
}

// Função para inicializar o banco de dados (criar tabela se não existir)
export async function initDatabase() {
  try {
    const pool = await getConnection()

    // Criar tabela de jogos se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        maxPlayers INT NOT NULL,
        availableOnHydra BOOLEAN NOT NULL DEFAULT false,
        imageUrl TEXT,
        addedBy VARCHAR(255) NOT NULL,
        played BOOLEAN NOT NULL DEFAULT false,
        createdAt BIGINT NOT NULL
      )
    `)

    // Criar tabela para armazenar o jogo sorteado
    await pool.query(`
      CREATE TABLE IF NOT EXISTS selected_game (
        id INT PRIMARY KEY AUTO_INCREMENT,
        game_id VARCHAR(36) NOT NULL,
        selected_at BIGINT NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      )
    `)

    console.log("Banco de dados inicializado com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error)
    return false
  }
}

