import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { styles } from '@/styles/styles';
import { LocalGame } from '@/components/LocalGame';
import { OnlineGame } from '@/components/OnlineGame';

/**
 * Componente principal que permite elegir entre modo local u online
 */
export default function App() {
  const [gameMode, setGameMode] = useState<'menu' | 'local' | 'online'>('menu');

  //  Animación del fondo
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Interpolación → simula tu radial-gradient entre dos colores oscuros
  const animatedBackground = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#05060a'],
  });

  if (gameMode === 'local') {
    return <LocalGame onBackToMenu={() => setGameMode('menu')} />;
  }

  if (gameMode === 'online') {
    return <OnlineGame onBackToMenu={() => setGameMode('menu')} />;
  }

  /* Menú principal */
  return (
    <Animated.View style={[styles.safe, { backgroundColor: animatedBackground }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: '#fff', textShadowRadius: 12 }]}>
          TicTacToe
        </Text>

        <Text style={[styles.subtitle, { color: '#ccc' }]}>
          Selecciona el modo de juego
        </Text>

        <View style={styles.menuContainer}>
          {/* Botón 1 */}
          <TouchableOpacity
            style={[styles.menuButton, neonButton]}
            onPress={() => setGameMode('local')}
          >
            <Text style={neonButtonText}> Juego Local</Text>
            <Text style={{ color: '#aaa' }}>
              Jugar en un mismo dispositivo
            </Text>
          </TouchableOpacity>

          {/* Botón 2 */}
          <TouchableOpacity
            style={[styles.menuButton, neonButton]}
            onPress={() => setGameMode('online')}
          >
            <Text style={neonButtonText}> Juego Online</Text>
            <Text style={{ color: '#aaa' }}>
              Conecta contra otro dispositivo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

/* --- Estilo neón tipo el CSS que enviaste --- */
const neonButton = {
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
  borderRadius: 14,
  padding: 20,
  marginVertical: 10,
};

const neonButtonText = {
  color: '#36a3ff',
  fontSize: 20,
  fontWeight: '600',
  textShadowColor: '#36a3ff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 12,
};
