import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';

/**
 * VoiceButton - Large circular button that changes color based on state
 * States: idle (gray), listening (blue), processing (green), speaking (orange)
 */
const VoiceButton = ({ state, onPress, disabled }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Get button color based on state
  const getButtonColor = () => {
    switch (state) {
      case 'listening':
        return '#2196F3'; // Blue
      case 'processing':
        return '#4CAF50'; // Green
      case 'speaking':
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Gray (idle)
    }
  };

  // Pulse animation for active states
  React.useEffect(() => {
    if (state === 'listening' || state === 'processing' || state === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [state, scaleAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: getButtonColor(), transform: [{ scale: scaleAnim }] },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default VoiceButton;
