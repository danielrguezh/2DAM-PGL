import React, { useRef, useEffect } from "react";
import { Animated, Pressable, StyleSheet, Easing } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";

export default function Square({ value, onPress }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: false }),
            Animated.timing(glowAnim, { toValue: 0, duration: 800, easing: Easing.ease, useNativeDriver: false }),
          ])
        ),
      ]).start();
    }
  }, [value]);

  const glow = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const color = value === "X" ? "#36a3ff" : "#ff4d4d";

  return (
    <Pressable style={styles.square} onPress={onPress}>
      {value && (
        <Animated.View style={{ opacity: opacityAnim }}>
          <Svg width="80" height="80">
            {value === "X" && (
              <>
                <Line x1="15" y1="15" x2="65" y2="65" stroke={color} strokeWidth={20} strokeLinecap="round" opacity={0.15 * glow} />
                <Line x1="65" y1="15" x2="15" y2="65" stroke={color} strokeWidth={20} strokeLinecap="round" opacity={0.15 * glow} />
                <Line x1="15" y1="15" x2="65" y2="65" stroke={color} strokeWidth={8} strokeLinecap="round" opacity={glow} />
                <Line x1="65" y1="15" x2="15" y2="65" stroke={color} strokeWidth={8} strokeLinecap="round" opacity={glow} />
              </>
            )}
            {value === "O" && (
              <>
                {/* anillo exterior brillante */}
                <Circle cx="40" cy="40" r="28" stroke={color} strokeWidth={18} opacity={0.12 * glow} fill="none" />
                {/* trazo principal sin fondo */}
                <Circle cx="40" cy="40" r="25" stroke={color} strokeWidth={8} fill="none" opacity={glow} />
              </>
            )}
          </Svg>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  square: {
    width: 100,
    height: 100,
    margin: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: 12,
  },
});
