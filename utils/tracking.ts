// Define a estrutura para as estatísticas
export interface Stats {
  images: number;
  videos: number;
  stickers: number;
}

// Define a estrutura para cada entrada de log
export interface LogEntry {
  timestamp: number;
  event: string;
}

const STATS_KEY = 'gremioAppStats';
const LOGS_KEY = 'gremioAppLogs';

/**
 * Retorna as estatísticas atuais do localStorage.
 * @returns {Stats} O objeto de estatísticas.
 */
export function getStats(): Stats {
  try {
    const storedStats = localStorage.getItem(STATS_KEY);
    if (storedStats) {
      return JSON.parse(storedStats);
    }
  } catch (error) {
    console.error("Failed to parse stats from localStorage:", error);
  }
  return { images: 0, videos: 0, stickers: 0 };
}

/**
 * Salva o objeto de estatísticas no localStorage.
 * @param {Stats} stats - O objeto de estatísticas a ser salvo.
 */
function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats to localStorage:", error);
  }
}

/**
 * Retorna os logs de eventos do localStorage.
 * @returns {LogEntry[]} Um array de entradas de log, ordenado do mais recente para o mais antigo.
 */
export function getLogs(): LogEntry[] {
  try {
    const storedLogs = localStorage.getItem(LOGS_KEY);
    if (storedLogs) {
      // Retorna em ordem reversa para mostrar os mais recentes primeiro
      return JSON.parse(storedLogs).reverse();
    }
  } catch (error) {
    console.error("Failed to parse logs from localStorage:", error);
  }
  return [];
}

/**
 * Salva o array de logs de eventos no localStorage.
 * @param {LogEntry[]} logs - O array de logs a ser salvo.
 */
function saveLogs(logs: LogEntry[]): void {
  try {
    // Mantém o log em ordem cronológica no armazenamento
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.sort((a, b) => a.timestamp - b.timestamp)));
  } catch (error) {
    console.error("Failed to save logs to localStorage:", error);
  }
}

/**
 * Registra um novo evento no histórico.
 * @param {string} eventName - O nome do evento a ser registrado.
 */
export function logEvent(eventName: string): void {
  const currentLogs = getLogs().reverse(); // reverte para ordem cronológica
  const newLog: LogEntry = {
    timestamp: Date.now(),
    event: eventName,
  };
  // Limita o log a 100 entradas para não sobrecarregar o localStorage
  const updatedLogs = [...currentLogs, newLog].slice(-100);
  saveLogs(updatedLogs);
}

/**
 * Incrementa uma estatística específica.
 * @param {keyof Stats} statName - O nome da estatística a ser incrementada ('images', 'videos', 'stickers').
 */
export function incrementStat(statName: keyof Stats): void {
  const currentStats = getStats();
  currentStats[statName] += 1;
  saveStats(currentStats);
}

/**
 * Limpa todas as estatísticas e logs armazenados.
 */
export function clearData(): void {
  try {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(LOGS_KEY);
  } catch (error) {
    console.error("Failed to clear data from localStorage:", error);
  }
}