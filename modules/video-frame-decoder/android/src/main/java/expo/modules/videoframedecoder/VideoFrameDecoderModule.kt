package expo.modules.videoframedecoder

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.ui.ExpoUIView
import expo.modules.kotlin.records.recordFromMap
import expo.modules.ui.ModifierRegistry

class VideoFrameDecoderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VideoFrameDecoder")

    Events("onChange")

    Constant("PI") {
      Math.PI
    }

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    View(VideoFrameDecoderView::class) {
      // Defines an event that the view can send to JavaScript.
      Events("onTap")
    }

    Class(VideoFrameDecoderModuleSharedObject::class) {
      Constructor {
        val instance = VideoFrameDecoderModuleSharedObject(appContext)
        return@Constructor instance
      }

      Property("count")
        .get { ref: VideoFrameDecoderModuleSharedObject ->
          ref.count
        }
        .set { ref: VideoFrameDecoderModuleSharedObject, count: Int ->
          ref.count = count
        }
    }

    ExpoUIView<VideoFrameDecoderComposeViewProps>("VideoFrameDecoderComposeView") {
      Content { props ->
        VideoFrameDecoderComposeViewContent(props)
      }
    }

    OnCreate {
      ModifierRegistry.register("videoFrameDecoderComposeModifier") { params, _, _, _ ->
        recordFromMap<VideoFrameDecoderComposeModifierParams>(params).toModifier()
      }
    }
  }
}
