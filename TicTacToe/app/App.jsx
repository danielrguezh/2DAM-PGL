import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Board from "../components/Board";

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [message, setMessage] = useState("");

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

  const bgInterpolation = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,50,1)", "rgba(80,0,80,1)"],
  });

  const bgOverlay = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,0,255,0.2)", "rgba(0,255,255,0.2)"],
  });

  function handlePlay(nextSquares, winnerData) {
    setSquares(nextSquares);
    if (winnerData) {
      const player = winnerData.player;
      setWinner(player);
      setWinLine(winnerData.line);
      setScore((prev) => ({
        ...prev,
        [player]: prev[player] + 1,
      }));
    } else {
      setWinner(null);
      setWinLine(null);
    }
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    // ⚠️ Si la partida no terminó, se da la victoria al oponente
    if (!winner && squares.some((sq) => sq !== null)) {
      const opponent = xIsNext ? "O" : "X";
      setScore((prev) => ({
        ...prev,
        [opponent]: prev[opponent] + 1,
      }));
      setMessage(`${opponent} gana por abandono 😢`);
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("");
    }

    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinLine(null);
  }

  function resetStats() {
    setScore({ X: 0, O: 0 });
    setMessage("Estadísticas reiniciadas ✨");
    setTimeout(() => setMessage(""), 2000);
    resetGame();
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgInterpolation }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["rgba(0,255,255,0.15)", "rgba(255,0,255,0.15)"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: bgOverlay, opacity: 0.4 }]}
      />

      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>Tic Tac Toe</Text>

        {/* 🧮 Marcador */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>X: {score.X}</Text>
          <Text style={styles.scoreText}>O: {score.O}</Text>
        </View>

        {/* 🆕 Mensaje de estado especial */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Text style={styles.status}>
          {winner ? `Ganador: ${winner}` : ""}
        </Text>

        <Board
          squares={squares}
          xIsNext={xIsNext}
          onPlay={handlePlay}
          winner={winner}
          winLine={winLine}
        />

        {/* 🔘 Botón de reiniciar partida (posición original) */}
        <Pressable onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.resetText}>Reiniciar Partida</Text>
        </Pressable>

        {/* 🔘 Botón de resetear estadísticas — más alejado abajo */}
        <Pressable onPress={resetStats} style={styles.statsButton}>
          <Text style={styles.resetText}>Resetear Estadísticas</Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#fff", fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  status: { color: "#ccc", marginTop: 15, fontSize: 16 },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: 10,
  },
  scoreText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    color: "#FFD700",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  resetButton: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  resetText: { color: "#fff", fontSize: 15 },
  // ⬇️ Botón de estadísticas más separado y con color de advertencia
  statsButton: {
    marginTop: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,0,0,0.25)",
  },
});
