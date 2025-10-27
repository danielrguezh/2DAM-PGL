import React, { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Line } from "react-native-svg";

export default function WinningLine({ line, color }) {
  if (!line) return null;

  const [a, , c] = line;
  const pos = {
    0: [0, 0], 1: [1, 0], 2: [2, 0],
    3: [0, 1], 4: [1, 1], 5: [2, 1],
    6: [0, 2], 7: [1, 2], 8: [2, 2],
  };
  const [ax, ay] = pos[a];
  const [cx, cy] = pos[c];
  const x1 = ax * 100 + 50;
  const y1 = ay * 100 + 50;
  const x2 = cx * 100 + 50;
  const y2 = cy * 100 + 50;

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.ease, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.ease, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glow = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Svg width="320" height="320" style={{ position: "absolute", top: 0, left: 0 }}>
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="20" strokeLinecap="round" opacity={0.1 * glow} />
      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="10" strokeLinecap="round" opacity={glow} />
    </Svg>
  );
}
