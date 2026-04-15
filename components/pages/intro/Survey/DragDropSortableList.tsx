/** @jsxImportSource react */
import React, { useState, useRef, memo } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

type ItemType = {
  key: string;
  label: string;
};

const RenderItem = memo(
  ({
    item,
    drag,
    isActive,
    index,
    indexOpacity,
  }: {
    item: ItemType;
    drag: () => void;
    isActive: boolean;
    index: number | undefined;
    indexOpacity: Animated.Value;
  }) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          onPressIn={drag}
          disabled={isActive}
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            padding: 8,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: '#000',
            backgroundColor: isActive ? '#d1d1d1' : '#e6e6e6',
            overflow: 'hidden',
          }}>
          <View
            style={{
              height: 24,
              width: 24,
              marginRight: 16,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#000',
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Animated.Text
              style={{
                opacity: indexOpacity,
                fontWeight: 'bold',
                fontSize: 12,
                color: '#000',
              }}>
              {index !== undefined ? index + 1 : ''}
            </Animated.Text>
          </View>
          <Animated.Text style={{ color: '#000000', fontSize: 14, width: 200 }}>
            {item.label}
          </Animated.Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }
);

export default function DragDropSortableList(props: {
  content: string[];
  requireLongPress?: boolean;
  onOrderChange?: (items: string[]) => void;
}) {
  const [data, setData] = useState<ItemType[]>(
    props.content.map((item, index) => ({
      key: `item-${index}`,
      label: item,
    }))
  );

  const indexOpacity = useRef(new Animated.Value(1)).current;

  const handleDragBegin = () => {
    Animated.timing(indexOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleDragEnd = ({ data }: { data: ItemType[] }) => {
    props.onOrderChange?.(data.map((item) => item.label));
    setData(data);
    Animated.timing(indexOpacity, {
      toValue: 1,
      duration: 150,
      delay: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <DraggableFlatList
      data={data}
      keyExtractor={(item) => item.key}
      onDragBegin={handleDragBegin}
      onDragEnd={handleDragEnd}
      renderItem={(params) => (
        <RenderItem {...params} index={params.getIndex()} indexOpacity={indexOpacity} />
      )}
      containerStyle={{ overflow: 'visible', height: 280 }}
      contentContainerStyle={{ paddingVertical: 4 }}
      scrollEnabled={false}
    />
  );
}
