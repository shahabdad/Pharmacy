import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold';
}

export function ThemedText({ type = 'default', style, ...props }: ThemedTextProps) {
  const typeStyles = {
    default: { fontSize: 14, color: '#333' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#000' },
    subtitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    link: { fontSize: 14, color: '#4A90E2', textDecorationLine: 'underline' as any },
    defaultSemiBold: { fontSize: 14, fontWeight: '600', color: '#333' },
  };

  return <Text style={[typeStyles[type], style]} {...props} />;
}

