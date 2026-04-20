import { Text, View } from 'react-native';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string | null;
  children: React.ReactNode;
}

export default function Card(props: CardProps) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 10,
        width: '80%',
        borderWidth: 1,
        borderColor: '#000',
      }}>
      <View style={{ alignItems: 'center' }}>
        {props.icon}
        <View
          style={{
            marginTop: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center',
              color: '#000',
            }}>
            {props.title}
          </Text>
          {props.subtitle && (
            <Text
              style={{ fontSize: 13, fontStyle: 'italic', textAlign: 'center', color: '#374151' }}>
              {props.subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        {props.children}
      </View>
    </View>
  );
}
