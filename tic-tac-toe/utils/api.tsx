import { API_BASE_URL } from '@/config/config';

type Stats = { xWins: number; oWins: number };

/**
 * Función auxiliar para realizar peticiones fetch seguras
 */
async function safeFetch(url: string, options: RequestInit = {}) {
  const full = `${API_BASE_URL}${url}`;
  try {
    const res = await fetch(full, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('API fetch error', full, err);
    throw err;
  }
}

/* ==================== ENDPOINTS LOCALES ==================== */

export async function fetchStats(): Promise<Stats> {
  return (await safeFetch('/stats')) as Stats;
}

export async function reportWin(winner: 'X' | 'O'): Promise<Stats> {
  return (await safeFetch('/stats/win', {
    method: 'POST',
    body: JSON.stringify({ winner }),
  })) as Stats;
}

export async function resetStats(): Promise<Stats> {
  return (await safeFetch('/stats/reset', {
    method: 'POST',
  })) as Stats;
}

export async function saveGame(payload: {
  boardSize: number;
  moves: (null | 'X' | 'O')[];
  winner: null | 'X' | 'O';
  createdAt?: string;
}) {
  return await safeFetch('/games', {
    method: 'POST',
    body: JSON.stringify({ 
      ...payload, 
      createdAt: payload.createdAt ?? new Date().toISOString() 
    }),
  });
}

/* ==================== ENDPOINTS ONLINE ==================== */

/**
 * Registra un nuevo dispositivo en el servidor
 */
export async function registerDevice(alias?: string): Promise<string> {
  const response = await safeFetch('/devices', {
    method: 'POST',
    body: JSON.stringify({ alias }),
  });
  return response.device_id;
}

/**
 * Obtiene la lista de dispositivos conectados
 */
export async function getConnectedDevices(): Promise<string[]> {
  const response = await safeFetch('/devices');
  return response.connected_devices;
}

/**
 * Obtiene información y estadísticas de un dispositivo
 */
export async function getDeviceInfo(deviceId: string): Promise<{
  connected: boolean;
  wins: number;
  losses: number;
  ratio: number;
}> {
  return await safeFetch(`/devices/${deviceId}/info`);
}

/**
 * Reinicia las estadísticas de un dispositivo
 */
export async function resetDeviceStats(deviceId: string): Promise<{
  message: string;
  wins: number;
  losses: number;
}> {
  return await safeFetch(`/devices/${deviceId}/stats/reset`, {
    method: 'POST',
  });
}

/**
 * Crea una nueva partida o entra en el lobby de espera
 * Retorna la partida si se empareja con otro jugador
 * Lanza un error 202 si está esperando oponente
 */
export async function createMatch(size?: number, deviceId?: string): Promise<{
  match_id: string;
  players: { [deviceId: string]: 'X' | 'O' };
  board_size: number;
}> {
  return await safeFetch('/matches', {
    method: 'POST',
    body: JSON.stringify({ size, device_id: deviceId }),
  });
}

/**
 * Realiza un movimiento en la partida
 */
export async function makeMove(
  matchId: string,
  deviceId: string,
  x: number,
  y: number
): Promise<{
  board: string[][];
  next_turn: string | null;
  winner: string | null;
}> {
  return await safeFetch(`/matches/${matchId}/moves`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId, x, y }),
  });
}

/**
 * Obtiene el estado actual de una partida
 */
export async function getMatchState(matchId: string): Promise<{
  board: string[][];
  turn: string;
  winner: string | null;
  size: number;
  players: { [deviceId: string]: string };
}> {
  return await safeFetch(`/matches/${matchId}`);
}

/**
 * Se rinde en la partida actual
 */
export async function surrenderMatch(
  matchId: string,
  deviceId: string
): Promise<{ message: string }> {
  return await safeFetch(`/matches/${matchId}/surrender`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}

/**
 * Busca si existe una partida activa para este dispositivo
 */
export async function findMatchForDevice(deviceId: string): Promise<{
  match_id: string;
  players: { [deviceId: string]: 'X' | 'O' };
  board_size: number;
} | null> {
  try {
    return await safeFetch(`/devices/${deviceId}/match`);
  } catch (err) {
    return null;
  }
}

/**
 * Abandona una partida (el oponente gana automáticamente)
 */
export async function leaveMatch(
  matchId: string,
  deviceId: string
): Promise<{ message: string }> {
  return await safeFetch(`/matches/${matchId}/leave`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}