import SwiftUI
import ExpoModulesCore
import ExpoUI

final class VideoFrameDecoderSwiftUIViewProps: UIBaseViewProps {
  @Field var title: String = ""
}

struct VideoFrameDecoderSwiftUIView: ExpoSwiftUI.View {
  @ObservedObject public var props: VideoFrameDecoderSwiftUIViewProps

  var body: some View {
    VStack {
      Text(props.title)
        .font(.headline)
      Children()
    }
  }
}
