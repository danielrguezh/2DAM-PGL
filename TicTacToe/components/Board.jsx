import React from "react";
import { View, StyleSheet } from "react-native";
import Square from "./Square";
import WinningLine from "./WinningLine";
import calculateWinner from "./calculateWinner";

export default function Board({ squares, xIsNext, onPlay, winner, winLine }) {
  function handlePress(i) {
    if (winner || squares[i]) return;
    const next = squares.slice();
    next[i] = xIsNext ? "X" : "O";
    const result = calculateWinner(next);
    onPlay(next, result);
  }

  return (
    <View style={styles.board}>
      {squares.map((val, i) => (
        <Square key={i} value={val} onPress={() => handlePress(i)} />
      ))}
      {winner && (
        <WinningLine line={winLine} color={winner === "X" ? "#36a3ff" : "#ff4d4d"} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: 320,
    height: 320,
    flexDirection: "row",
    flexWrap: "wrap",
    position: "relative",
  },
});
