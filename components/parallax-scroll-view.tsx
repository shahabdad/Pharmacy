import React from 'react';
import { ScrollView, StyleSheet, View, ViewProps } from 'react-native';

interface ParallaxScrollViewProps extends ViewProps {
  headerImage?: React.ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
  children?: React.ReactNode;
}

export default function ParallaxScrollView({
  headerImage,
  headerBackgroundColor,
  children,
  style,
  ...props
}: ParallaxScrollViewProps) {
  return (
    <ScrollView {...props} style={[styles.container, style]}>
      {headerImage && <View style={styles.header}>{headerImage}</View>}
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A1CEDC',
  },
  content: {
    padding: 20,
  },
});

