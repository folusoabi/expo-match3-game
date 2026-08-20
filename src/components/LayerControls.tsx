import { View, Text, TextInput, Pressable } from 'react-native';
import type { Layer } from '@/features/video-export/scene';

const SWATCHES = ['#FFFFFF', '#FF5A5F', '#4C6FFF', '#26D07C', '#FFC53D'];

interface Props {
  layer: Layer;
  onChange: (next: Layer) => void;
}

export function LayerControls({ layer, onChange }: Props) {
  if (layer.type === 'text') {
    return (
      <View className="bg-surface rounded-xl p-3 mb-3">
        <Text className="text-neutral-400 text-xs mb-2">{layer.id}</Text>
        <TextInput
          value={layer.text}
          onChangeText={(text) => onChange({ ...layer, text })}
          className="text-white text-base bg-card rounded-lg px-3 py-2 mb-3"
          placeholder="Layer text"
          placeholderTextColor="#666"
        />
        <View className="flex-row gap-2">
          {SWATCHES.map((color) => (
            <Pressable
              key={color}
              onPress={() => onChange({ ...layer, color })}
              style={{ backgroundColor: color }}
              className={`w-8 h-8 rounded-full ${layer.color === color ? 'border-2 border-white' : ''}`}
            />
          ))}
        </View>
      </View>
    );
  }

  // Image layers are edited via the "Choose photo" button on the layer
  // itself in the editor screen, so there's nothing extra to show here yet.
  return (
    <View className="bg-surface rounded-xl p-3 mb-3">
      <Text className="text-neutral-400 text-xs">{layer.id} (image layer)</Text>
      <Text className="text-neutral-500 text-xs mt-1">
        {layer.uri ? 'Photo selected' : 'Using placeholder — tap the image on the canvas to replace'}
      </Text>
    </View>
  );
}
