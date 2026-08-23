import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import { AnimatedPreview } from '@/features/video-export/AnimatedPreview';
import { exportSceneToVideo } from '@/features/video-export/exportScene';
import { cloneScene, type Scene } from '@/features/video-export/scene';
import { getTemplateById } from '@/features/video-export/templates';
import { LayerControls } from '@/components/LayerControls';
import { getVideoInfo } from '../../../modules/video-frame-decoder';

const screenWidth = Dimensions.get('window').width;
const PREVIEW_WIDTH = screenWidth - 32;

export default function EditorScreen() {
  const { sceneId } = useLocalSearchParams<{ sceneId: string }>();
  const router = useRouter();
  const template = getTemplateById(sceneId);

  const [scene, setScene] = useState<Scene | null>(() =>
    template ? cloneScene(template.scene) : null
  );
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!scene) {
    return (
      <SafeAreaView className="flex-1 bg-canvas items-center justify-center">
        <Text className="text-white">Template not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-indigo-400">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const previewHeight = PREVIEW_WIDTH * (scene.height / scene.width);

  async function pickImageForLayer(layerId: string) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setScene((prev) =>
      prev
        ? {
            ...prev,
            layers: prev.layers.map((l) => (l.id === layerId ? { ...l, uri } : l)),
          }
        : prev
    );
  }

  async function pickVideoForLayer(layerId: string) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;

    // Default to using the first N seconds of the source clip, clamped to
    // however long it actually is.
    let trimEnd = 3;
    try {
      const info = await getVideoInfo(uri);
      trimEnd = Math.min(3, info.durationSeconds);
    } catch (err) {
      console.warn('Could not read video info, using default trim', err);
    }

    setScene((prev) =>
      prev
        ? {
            ...prev,
            layers: prev.layers.map((l) =>
              l.id === layerId && l.type === 'video' ? { ...l, uri, trimStart: 0, trimEnd } : l
            ),
          }
        : prev
    );
  }

  async function handleExport() {
    if (!scene) return;
    setExporting(true);
    setProgress(0);
    try {
      const outPath = await exportSceneToVideo(scene, (p) => setProgress(p.fractionComplete));
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (mediaPermission.granted) {
        await MediaLibrary.saveToLibraryAsync(outPath);
        Alert.alert('Saved', 'Your video was saved to your camera roll.');
      } else {
        Alert.alert('Exported', `Video rendered to:\n${outPath}`);
      }
    } catch (err) {
      console.error('Export failed', err);
      Alert.alert('Export failed', 'Check the console for details.');
    } finally {
      setExporting(false);
    }
  }

  const imageLayers = scene.layers.filter((l) => l.type === 'image');
  const videoLayers = scene.layers.filter((l) => l.type === 'video');

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <ScrollView contentContainerClassName="px-4 pt-4 pb-10">
        <Pressable onPress={() => router.back()} className="mb-3">
          <Text className="text-indigo-400">{'< Templates'}</Text>
        </Pressable>

        <View
          style={{ width: PREVIEW_WIDTH, height: previewHeight }}
          className="rounded-2xl overflow-hidden mb-4 self-center"
        >
          <AnimatedPreview scene={scene} displayWidth={PREVIEW_WIDTH} displayHeight={previewHeight} />
        </View>

        {videoLayers.map((layer) => (
          <Pressable
            key={layer.id}
            onPress={() => pickVideoForLayer(layer.id)}
            className="bg-surface rounded-xl px-4 py-3 mb-3 items-center"
          >
            <Text className="text-white font-medium">
              {layer.uri ? 'Change video' : 'Choose video'} for {layer.id}
            </Text>
          </Pressable>
        ))}

        {imageLayers.map((layer) => (
          <Pressable
            key={layer.id}
            onPress={() => pickImageForLayer(layer.id)}
            className="bg-surface rounded-xl px-4 py-3 mb-3 items-center"
          >
            <Text className="text-white font-medium">
              {layer.uri ? 'Change photo' : 'Choose photo'} for {layer.id}
            </Text>
          </Pressable>
        ))}

        <Text className="text-white font-semibold mt-2 mb-2">Text & shape layers</Text>
        {scene.layers
          .filter((l) => l.type === 'text' || l.type === 'shape')
          .map((layer) => (
            <LayerControls
              key={layer.id}
              layer={layer}
              onChange={(next) =>
                setScene((prev) =>
                  prev
                    ? { ...prev, layers: prev.layers.map((l) => (l.id === next.id ? next : l)) }
                    : prev
                )
              }
            />
          ))}

        <Pressable
          onPress={handleExport}
          disabled={exporting}
          className="bg-indigo-500 rounded-xl px-4 py-3 items-center mt-3"
        >
          {exporting ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="white" />
              <Text className="text-white font-medium">{Math.round(progress * 100)}%</Text>
            </View>
          ) : (
            <Text className="text-white font-medium">Export &amp; save to camera roll</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
