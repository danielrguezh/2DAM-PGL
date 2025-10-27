import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Board from "../components/Board";

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState(null);

  // Animación del fondo
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
      setWinner(winnerData.player);
      setWinLine(winnerData.line);
    } else {
      setWinner(null);
      setWinLine(null);
    }
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinLine(null);
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
        <Text style={styles.status}>
          {winner
            ? ` Winner: ${winner}`
            : ``}
        </Text>

        <Board
          squares={squares}
          xIsNext={xIsNext}
          onPlay={handlePlay}
          winner={winner}
          winLine={winLine}
        />

        <Pressable onPress={resetGame} style={styles.resetButton}>
          <Text style={styles.resetText}>Restart</Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#fff", fontSize: 22, marginBottom: 10 },
  status: { color: "#ccc", marginBottom: 20 },
  resetButton: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  resetText: { color: "#fff", fontSize: 16 },
});
