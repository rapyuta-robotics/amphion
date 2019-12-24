import { DEFAULT_OPTIONS_MARKER } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from '../utils/markerManager';
import Core2 from '../core/core2';
import { RosTopicDataSource } from '../data/ros';

class Marker extends Core2<RosMessage.Marker> {
  private markerManager: MarkerManager;
  private onNameSpaceChange?: () => void;
  constructor(
    source: RosTopicDataSource<RosMessage.Marker>,
    options = DEFAULT_OPTIONS_MARKER,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_MARKER,
        ...options,
      },
    });

    this.object = new Group();
    this.markerManager = new MarkerManager(
      this.object,
      this.onNameSpaceChange ?? (() => null),
    );
    this.updateOptions({
      ...DEFAULT_OPTIONS_MARKER,
      ...options,
    });
  }

  updateOptions(options: { [k: string]: any }) {
    super.updateOptions(options);
    this.markerManager.updateOptions(this.options);
  }

  update(message: RosMessage.Marker) {
    super.update(message);
    this.markerManager.updateMarker(message);
  }

  reset = () => {
    this.markerManager.reset();
  };
}

export default Marker;
