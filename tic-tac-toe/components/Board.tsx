import React from 'react';
import { View } from 'react-native';
import { Square } from './Square';
import { styles } from '@/styles/styles';

type NullableSquare = string | null;
type WinnerResult = { winner: NullableSquare; line: number[] | null };

/**
 * Componente Board
 */
export function Board({
  size,
  squares,
  onSquarePress,
  highlightLine,
}: {
  size: number;
  squares: NullableSquare[];
  onSquarePress: (idx: number) => void;
  highlightLine: number[] | null;
}) {
  const rows = [];
  for (let r = 0; r < size; r++) {
    const cols = [];
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      const isHighlighted = highlightLine ? highlightLine.includes(idx) : false;

      cols.push(
        <Square
          key={idx}
          value={squares[idx]}
          onPress={() => onSquarePress(idx)}
          highlighted={isHighlighted}
        />
      );
    }

    rows.push(
      <View key={r} style={[styles.boardRow, neonRow]}>
        {cols}
      </View>
    );
  }

  return <View style={[styles.board, neonBoard]}>{rows}</View>;
}

/**
 * Calcula ganador genérico
 */
export function calculateWinnerGeneric(
  squares: NullableSquare[],
  size: number
): WinnerResult {
  const needed = size >= 5 ? 4 : 3;
  const lines: number[][] = [];

  // Horizontal
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - needed; c++) {
      lines.push(Array.from({ length: needed }, (_, k) => r * size + c + k));
    }
  }

  // Vertical
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - needed; r++) {
      lines.push(Array.from({ length: needed }, (_, k) => (r + k) * size + c));
    }
  }

  // Diagonal \
  for (let r = 0; r <= size - needed; r++) {
    for (let c = 0; c <= size - needed; c++) {
      lines.push(Array.from({ length: needed }, (_, k) => (r + k) * size + c + k));
    }
  }

  // Diagonal /
  for (let r = 0; r <= size - needed; r++) {
    for (let c = needed - 1; c < size; c++) {
      lines.push(Array.from({ length: needed }, (_, k) => (r + k) * size + c - k));
    }
  }

  for (const line of lines) {
    const [a] = line;
    const symbol = squares[a];
    if (symbol && line.every((idx) => squares[idx] === symbol)) {
      return { winner: symbol, line };
    }
  }

  return { winner: null, line: null };
}

/* ===========================================================
   ESTILOS VISUALES NEÓN PARA EL TABLERO
   =========================================================== */
const neonBoard = {
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 16,
  padding: 10,
  shadowColor: '#36a3ff',
  shadowOpacity: 0.35,
  shadowRadius: 12,
};

const neonRow = {
  shadowColor: '#36a3ff',
  shadowOpacity: 0.15,
  shadowRadius: 8,
};
