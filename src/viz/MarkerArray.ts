import { DEFAULT_OPTIONS_MARKERARRAY } from '../utils/constants';
import Group from '../primitives/Group';
import MarkerManager from '../utils/markerManager';
import LiveCore from '../core/live';
import { DataSource } from '../data';

class MarkerArray extends LiveCore<RosMessage.MarkerArray, Group> {
  private markerManager: MarkerManager;
  private onNameSpaceChange?: () => void;

  constructor(
    source: DataSource<RosMessage.MarkerArray>,
    options = DEFAULT_OPTIONS_MARKERARRAY,
  ) {
    super({
      sources: [source],
      options: {
        ...DEFAULT_OPTIONS_MARKERARRAY,
        ...options,
      },
    });

    this.object = new Group();
    this.markerManager = new MarkerManager(
      this.object,
      this.onNameSpaceChange ?? (() => null),
    );
  }

  updateOptions(options: { [p: string]: any }) {
    super.updateOptions(options);
    this.markerManager.updateOptions(this.options as any);
  }

  update(message: RosMessage.MarkerArray) {
    super.update(message);
    message.markers.forEach(marker => {
      this.markerManager.updateMarker(marker);
    });
  }

  reset = () => {
    this.markerManager.reset();
  };
}

export default MarkerArray;
