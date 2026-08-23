import ExpoModulesCore
import ExpoUI

public class VideoFrameDecoderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VideoFrameDecoder")

    Events("onChange")

    Constant("PI") {
      Double.pi
    }

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    View(VideoFrameDecoderView.self) {
      Events("onTap")
    }

    Class(VideoFrameDecoderModuleSharedObject.self) {
      Constructor { () -> VideoFrameDecoderModuleSharedObject in
        return VideoFrameDecoderModuleSharedObject()
      }

      Property("count") { (ref: VideoFrameDecoderModuleSharedObject) -> Int in
        return ref.count
      }
      .set { (ref: VideoFrameDecoderModuleSharedObject, count: Int) in
        ref.count = count
      }
    }

    ExpoUIView(VideoFrameDecoderSwiftUIView.self)

    OnCreate {
      ViewModifierRegistry.register("videoFrameDecoderSwiftUIModifier") { params, appContext, _ in
        return try VideoFrameDecoderSwiftUIModifier(from: params, appContext: appContext)
      }
    }

    OnDestroy {
      ViewModifierRegistry.unregister("videoFrameDecoderSwiftUIModifier")
    }
  }
}
