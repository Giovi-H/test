import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

export default function GridBackground(props: { color1: string; color2: string }) {
  const { color1, color2 } = props;
  const { width, height } = useWindowDimensions();

  const columns = 4;
  const lineWidth = 3;

  // Calculate grid size based on screen width
  const gridSize = width / columns;

  // Calculate how many horizontal lines we need
  const horizontalLines = Math.ceil(height / gridSize) + 1;

  return (
    <View style={styles.container}>
      {/* Background color */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: color1 }]} />

      {/* Grid lines */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Vertical lines - always 5 lines for 4 columns */}
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.verticalLine,
              {
                left: i * gridSize,
                width: lineWidth,
                backgroundColor: color2,
              },
            ]}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: horizontalLines }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.horizontalLine,
              {
                top: i * gridSize,
                height: lineWidth,
                backgroundColor: color2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -100,
  },
  verticalLine: {
    position: 'absolute',
    height: '100%',
  },
  horizontalLine: {
    position: 'absolute',
    width: '100%',
  },
});
