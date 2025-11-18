import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { styles } from '@/styles/styles';
import { Board, calculateWinnerGeneric } from '@/components/Board';
import * as API from '@/utils/api';

type GameState = 'waiting' | 'playing' | 'finished';

/**
 * Componente del juego en modo online (conectado al backend)
 */
export function OnlineGame({ onBackToMenu }: { onBackToMenu: () => void }) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [board, setBoard] = useState<(string | null)[][]>([]);
  const [boardSize, setBoardSize] = useState(3);
  const [mySymbol, setMySymbol] = useState<'X' | 'O' | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingMatch, setSearchingMatch] = useState(false); // Nuevo estado para búsqueda
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const searchInterval = useRef<NodeJS.Timeout | null>(null); // Nuevo intervalo para búsqueda

  /**
   * Registra el dispositivo al montar el componente
   */
  useEffect(() => {
    registerDevice();
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (searchInterval.current) {
        clearInterval(searchInterval.current);
      }
    };
  }, []);

  /**
   * Inicia el polling del estado de la partida cuando hay un matchId
   */
  useEffect(() => {
    if (matchId && gameState === 'playing') {
      pollingInterval.current = setInterval(() => {
        syncMatchState();
      }, 2000);
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [matchId, gameState]);

  /**
   * Registra el dispositivo en el servidor
   */
  const registerDevice = async () => {
    try {
      setLoading(true);
      const id = await API.registerDevice();
      setDeviceId(id);
      setError(null);
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga las estadísticas del dispositivo
   */
  const loadStats = async () => {
    if (!deviceId) return;
    try {
      const deviceStats = await API.getDeviceInfo(deviceId);
      setStats({ wins: deviceStats.wins, losses: deviceStats.losses });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  /**
   * Busca una partida existente para este dispositivo
   */
  const checkExistingMatch = async () => {
    if (!deviceId) return null;
    try {
      const existingMatch = await API.findMatchForDevice(deviceId);
      if (existingMatch) {
        setMatchId(existingMatch.match_id);
        const myAssignedSymbol = existingMatch.players[deviceId];
        setMySymbol(myAssignedSymbol);
        setGameState('playing');
        await syncMatchState(existingMatch.match_id);
        setSearchingMatch(false);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  /**
   * Crea una nueva partida y espera emparejamiento
   * Intenta continuamente hasta encontrar un oponente
   */
  const createMatch = async () => {
    if (!deviceId) return;
    
    setSearchingMatch(true);
    setError('Buscando oponente...');
    
    /* Intentar crear/unirse a partida */
    const tryMatch = async () => {
      try {
        /* Primero verificar si ya hay una partida creada para mí */
        const hasMatch = await checkExistingMatch();
        if (hasMatch) {
          if (searchInterval.current) {
            clearInterval(searchInterval.current);
            searchInterval.current = null;
          }
          return true;
        }
        
        /* Si no, intentar crear/unirse a una nueva */
        const match = await API.createMatch(boardSize, deviceId);
        
        /* ¡Emparejamiento exitoso! */
        setMatchId(match.match_id);
        
        /* Identificar mi símbolo correctamente */
        const myAssignedSymbol = match.players[deviceId];
        setMySymbol(myAssignedSymbol);
        
        setGameState('playing');
        await syncMatchState(match.match_id);
        setError(null);
        setSearchingMatch(false);
        
        /* Detener búsqueda */
        if (searchInterval.current) {
          clearInterval(searchInterval.current);
          searchInterval.current = null;
        }
        
        return true;
      } catch (err: any) {
        /* Si es error 202, significa que está en lobby esperando */
        if (err.message && err.message.includes('202')) {
          return false; // Seguir intentando
        }
        /* Otro error */
        setError(err.message || 'Error al crear la partida');
        setSearchingMatch(false);
        if (searchInterval.current) {
          clearInterval(searchInterval.current);
          searchInterval.current = null;
        }
        return true; // Detener búsqueda por error
      }
    };
    
    /* Primer intento */
    const matched = await tryMatch();
    
    if (!matched) {
      /* No se emparejó, seguir intentando cada 2 segundos */
      searchInterval.current = setInterval(async () => {
        const result = await tryMatch();
        if (result && searchInterval.current) {
          clearInterval(searchInterval.current);
          searchInterval.current = null;
        }
      }, 2000);
    }
  };
  
  /**
   * Cancela la búsqueda de partida
   */
  const cancelSearch = () => {
    if (searchInterval.current) {
      clearInterval(searchInterval.current);
      searchInterval.current = null;
    }
    setSearchingMatch(false);
    setError(null);
  };

  /**
   * Sincroniza el estado de la partida con el servidor
   */
  const syncMatchState = async (mId?: string) => {
    const id = mId || matchId;
    if (!id) return;
    
    try {
      const state = await API.getMatchState(id);
      setBoard(state.board);
      setBoardSize(state.size);
      setCurrentTurn(state.turn);
      setWinner(state.winner);
      
      if (state.winner) {
        setGameState('finished');
        await loadStats();
      }
      
      /* Verificar si el oponente abandonó */
      if (state.opponent_left) {
        setWinner(mySymbol);
        setGameState('finished');
        setError('Tu oponente abandonó la partida. ¡Ganaste!');
        await loadStats();
      }
    } catch (err: any) {
      /* Si la partida no existe o fue eliminada */
      if (err.message && (err.message.includes('404') || err.message.includes('no encontrada'))) {
        if (gameState === 'playing') {
          setWinner(mySymbol);
          setGameState('finished');
          setError('Tu oponente abandonó la partida. ¡Ganaste!');
          await loadStats();
        }
      } else {
        console.error('Error sincronizando:', err);
      }
    }
  };

  /**
   * Realiza un movimiento en el tablero
   */
  const handleSquarePress = async (index: number) => {
    if (!deviceId || !matchId || !mySymbol || gameState !== 'playing') return;
    if (currentTurn !== deviceId) {
      setError('No es tu turno');
      return;
    }

    const x = Math.floor(index / boardSize);
    const y = index % boardSize;

    if (board[x][y] !== '') {
      setError('Casilla ocupada');
      return;
    }

    try {
      setLoading(true);
      const result = await API.makeMove(matchId, deviceId, x, y);
      setBoard(result.board);
      setCurrentTurn(result.next_turn);
      setWinner(result.winner);
      
      if (result.winner) {
        setGameState('finished');
        await loadStats();
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al hacer el movimiento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Se rinde y otorga la victoria al oponente
   */
  const surrender = async () => {
    if (!deviceId || !matchId) return;
    
    try {
      setLoading(true);
      await API.surrenderMatch(matchId, deviceId);
      await loadStats();
      resetMatch();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al rendirse');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reinicia la partida local y notifica al servidor sobre el abandono
   */
  const resetMatch = async () => {
    /* Notificar al servidor que este jugador abandona */
    if (matchId && deviceId && gameState === 'playing') {
      try {
        await API.leaveMatch(matchId, deviceId);
      } catch (err) {
        console.error('Error al abandonar:', err);
      }
    }
    
    setMatchId(null);
    setBoard([]);
    setMySymbol(null);
    setCurrentTurn(null);
    setWinner(null);
    setGameState('waiting');
    setError(null);
  };

  /**
   * Reinicia las estadísticas del jugador
   */
  const resetStats = async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      await API.resetDeviceStats(deviceId);
      setStats({ wins: 0, losses: 0 });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al reiniciar estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* Convertir board 2D a array plano para el componente Board */
  const flatSquares = useMemo(() => {
    return board.flat().map(cell => cell === '' ? null : cell);
  }, [board]);

  /* Calcular línea ganadora */
  const result = useMemo(
    () => calculateWinnerGeneric(flatSquares, boardSize),
    [flatSquares, boardSize]
  );

  const isMyTurn = currentTurn === deviceId;
  const status = winner
    ? `Ganador: ${winner}${winner === mySymbol ? ' (¡Tú!)' : ''}`
    : gameState === 'playing'
      ? isMyTurn
        ? `Tu turno (${mySymbol})`
        : `Turno del oponente (${mySymbol === 'X' ? 'O' : 'X'})`
      : 'Esperando partida...';

  if (!deviceId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Conectando al servidor...</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            onPress={async () => {
              await resetMatch();
              onBackToMenu();
            }} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Volver al menú</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Modo Online</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.mainRow}>
          <View style={styles.leftColumn}>
            <Text style={styles.status}>{status}</Text>

            {gameState === 'waiting' ? (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>Listo para jugar</Text>
                <Text style={styles.infoText}>
                  Device ID: {deviceId.substring(0, 8)}...
                </Text>
                
                <View style={styles.sizeSelector}>
                  <Text style={styles.controlsTitle}>Tamaño del tablero</Text>
                  <View style={styles.sizeRow}>
                    {[3, 4, 5, 6, 7].map((size) => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => {
                          if (!loading) setBoardSize(size);
                        }}
                        style={[
                          styles.sizeOption,
                          boardSize === size && styles.sizeOptionActive,
                          loading && { opacity: 0.5 },
                        ]}
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.sizeOptionText,
                            boardSize === size && styles.sizeOptionTextActive,
                          ]}
                        >
                          {size}x{size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={searchingMatch ? cancelSearch : createMatch}
                  style={[
                    searchingMatch ? styles.secondaryBtn : styles.primaryBtn,
                    loading && { opacity: 0.6 }
                  ]}
                  disabled={loading && !searchingMatch}
                >
                  <Text style={searchingMatch ? styles.secondaryBtnText : styles.primaryBtnText}>
                    {searchingMatch ? 'Cancelar búsqueda' : 'Buscar partida'}
                  </Text>
                </TouchableOpacity>
                
                {searchingMatch && (
                  <View style={styles.searchingContainer}>
                    <ActivityIndicator size="small" color="#3498db" />
                    <Text style={styles.infoText}>
                      Buscando oponente con tablero {boardSize}x{boardSize}...
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <>
                <Board
                  size={boardSize}
                  squares={flatSquares}
                  onSquarePress={handleSquarePress}
                  highlightLine={result.line}
                />

                <View style={styles.infoRow}>
                  {gameState === 'playing' && (
                    <TouchableOpacity
                      onPress={surrender}
                      style={styles.smallBtnAlt}
                      disabled={loading}
                    >
                      <Text style={styles.smallBtnText}>Rendirse</Text>
                    </TouchableOpacity>
                  )}

                  {gameState === 'finished' && (
                    <TouchableOpacity
                      onPress={resetMatch}
                      style={styles.primaryBtn}
                    >
                      <Text style={styles.primaryBtnText}>Nueva partida</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>

          <View style={styles.controls}>
            <View style={styles.stats}>
              <Text style={styles.controlsTitle}>Estadísticas Online</Text>
              <Text style={styles.statText}>Victorias: {stats.wins}</Text>
              <Text style={styles.statText}>Derrotas: {stats.losses}</Text>
              <Text style={styles.statText}>
                Ratio: {stats.wins + stats.losses > 0
                  ? (stats.wins / (stats.wins + stats.losses)).toFixed(2)
                  : '0.00'}
              </Text>
              <TouchableOpacity 
                onPress={resetStats} 
                style={styles.resetStatsBtn}
                disabled={loading}
              >
                <Text style={styles.resetStatsBtnText}>Reiniciar estadísticas</Text>
              </TouchableOpacity>
            </View>

            {gameState === 'playing' && (
              <View style={styles.gameInfo}>
                <Text style={styles.controlsTitle}>Info de la partida</Text>
                <View style={styles.symbolIndicator}>
                  <Text style={styles.infoTextBold}>
                    Eres: <Text style={styles.symbolText}>{mySymbol}</Text>
                  </Text>
                </View>
                <Text style={styles.infoText}>
                  Tablero: {boardSize}x{boardSize}
                </Text>
                <Text style={styles.infoText}>
                  {boardSize >= 5 ? '4 en raya' : '3 en raya'}
                </Text>
                <Text style={[styles.infoText, { marginTop: 10 }]}>
                  {isMyTurn ? '🟢 Es tu turno' : '⏳ Esperando al oponente'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}