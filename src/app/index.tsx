import { View, Text, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { templates } from '@/features/video-export/templates';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Lotif Editor</Text>
        <Text className="text-neutral-400 mt-1">Pick a template to start a marketing video</Text>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(t) => t.id}
        numColumns={2}
        contentContainerClassName="p-3"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/editor/${item.id}`)}
            className="flex-1 m-2 bg-surface rounded-2xl aspect-[9/16] items-center justify-end p-3"
            style={{ backgroundColor: item.scene.backgroundColor }}
          >
            <Text className="text-white font-semibold text-center">{item.label}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
