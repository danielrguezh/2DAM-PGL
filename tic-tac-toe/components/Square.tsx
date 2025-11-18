import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styles } from '@/styles/styles';
import { NeonSymbol } from './NeonSymbol';

type NullableSquare = string | null;

export function Square({
  value,
  onPress,
  highlighted,
}: {
  value: NullableSquare;
  onPress: () => void;
  highlighted: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.square, neonSquare, highlighted && neonHighlight]}
    >
      {value && <NeonSymbol type={value as 'X' | 'O'} />}
    </TouchableOpacity>
  );
}

// Exportamos createEmptySquares también
export function createEmptySquares(size: number): NullableSquare[] {
  return Array(size * size).fill(null);
}

/* ===========================================================
    ESTILOS NEÓN PARA SQUARE
   =========================================================== */
const neonSquare = {
  width: 80,
  height: 80,
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  margin: 4,
  shadowColor: '#36a3ff',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
};

const neonHighlight = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  shadowColor: '#36a3ff',
  shadowOpacity: 0.7,
  shadowRadius: 16,
};
