import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

type NeonSymbolProps = {
  type: 'X' | 'O';
  size?: number; // tamaño del cuadro
  color?: string; // color neón
};

export const NeonSymbol: React.FC<NeonSymbolProps> = ({
  type,
  size = 80,
  color,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: type === 'X' ? 400 : 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, []);

  if (type === 'X') {
    const dashOffset = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [size * 1.4, 0], // longitud diagonal aprox
    });

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Line
          x1={0}
          y1={0}
          x2={size}
          y2={size}
          stroke={color || '#36a3ff'}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={size * 1.4}
          strokeDashoffset={dashOffset as any}
        />
        <Line
          x1={0}
          y1={size}
          x2={size}
          y2={0}
          stroke={color || '#36a3ff'}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={size * 1.4}
          strokeDashoffset={dashOffset as any}
        />
      </Svg>
    );
  } else {
    const radius = size / 2 - 6;
    const circumference = 2 * Math.PI * radius;

    const strokeDashoffset = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0],
    });

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || '#ff4d4d'}
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset as any}
        />
      </Svg>
    );
  }
};
