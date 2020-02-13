import { DEFAULT_OPTIONS_MARKER } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from '../utils/markerManager';
import LiveCore from '../core/live';
import { RosTopicDataSource } from '../data/rosTopic';

class Marker extends LiveCore<RosMessage.Marker, Group> {
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
    this.markerManager.updateOptions(this.options as any);
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
