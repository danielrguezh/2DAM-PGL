import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { styles } from '@/styles/styles';

/**
 * componente con los controles del juego
 */
export function Controls({
    boardSize,
    setBoardSize,
    onRestartGame,
    onRestartMidGame,
    xWins,
    oWins,
    onResetStats,
    disableSizeChange,
    disableRestart,
}) {
    function inc() {
        setBoardSize(Math.min(7, boardSize + 1));
    }
    function dec() {
        setBoardSize(Math.max(3, boardSize - 1));
    }

    return (
        <View style={[styles.controls, panel]}>
            <Text style={[styles.controlsTitle, neonTitle]}>
                Tamaño del tablero
            </Text>

            <View style={styles.sizeRow}>
                <TouchableOpacity
                    onPress={dec}
                    disabled={disableSizeChange}
                    style={[styles.sizeBtn, neonButton]}
                >
                    <Text style={neonButtonText}>-</Text>
                </TouchableOpacity>

                <TextInput
                    keyboardType="number-pad"
                    style={[styles.sizeInput, neonInput]}
                    value={String(boardSize)}
                    onChangeText={(t) => {
                        const v = parseInt(t || '', 10);
                        if (!isNaN(v)) {
                            const clamped = Math.max(3, Math.min(7, v));
                            setBoardSize(clamped);
                        }
                    }}
                    editable={!disableSizeChange}
                />

                <TouchableOpacity
                    onPress={inc}
                    disabled={disableSizeChange}
                    style={[styles.sizeBtn, neonButton]}
                >
                    <Text style={neonButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonsRow}>
                <TouchableOpacity
                    onPress={onRestartGame}
                    style={[
                        styles.primaryBtn,
                        neonButton,
                        disableRestart && { opacity: 0.4 },
                    ]}
                    disabled={disableRestart}
                >
                    <Text style={neonButtonText}>Reiniciar partida</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onRestartMidGame}
                    style={[styles.secondaryBtn, neonButtonSecondary]}
                >
                    <Text style={neonButtonSubText}>
                        Reiniciar (mid-game → punto al oponente)
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.stats}>
                <Text style={[styles.controlsTitle, neonTitle]}>
                    Estadísticas
                </Text>

                <Text style={neonStatText}>Victorias X: {xWins}</Text>
                <Text style={neonStatText}>Victorias O: {oWins}</Text>

                <TouchableOpacity
                    onPress={onResetStats}
                    style={[styles.resetStatsBtn, neonButton]}
                >
                    <Text style={neonButtonText}>Reiniciar estadísticas</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ===========================================================
   🔥 ESTILOS VISUALES NEÓN (como en tu menú principal)
   =========================================================== */

const panel = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
};

const neonTitle = {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: '#36a3ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
};

const neonButton = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
};

const neonButtonSecondary = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
};

const neonButtonText = {
    color: '#36a3ff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: '#36a3ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
};

const neonButtonSubText = {
    color: '#ff4d4d',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: '#ff4d4d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
};

const neonInput = {
    color: '#36a3ff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    textShadowColor: '#36a3ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
};

const neonStatText = {
    color: '#fff',
    fontSize: 16,
    marginVertical: 3,
    textShadowColor: '#ff4d4d',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
};
