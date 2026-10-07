import React, { useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AnimatedActionButton.styles';

export default function AnimatedActionButton({ icon, label, color, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.button, { backgroundColor: `${color}20` }]}
        onPress={onPress}
        onPressIn={() => animateTo(0.94)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.text, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
