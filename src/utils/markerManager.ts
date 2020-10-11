import getNewPrimitive, { MarkerObjectType } from './markerTypes';
import { DEFAULT_SCALE } from '../utils/constants';
import MarkerLifetime from './markerLifetime';
import { Object3D } from 'three';

export default class MarkerManager {
  public object: Object3D;
  private readonly onChangeCb: () => void;
  private readonly objectMap: { [p: string]: MarkerObjectType } = {};
  private namespaces: { [p: string]: boolean } = {};
  private readonly markerLifetime: MarkerLifetime;

  constructor(rootObject: Object3D, onChangeCb: () => void) {
    this.object = rootObject;
    this.onChangeCb = onChangeCb;
    this.markerLifetime = new MarkerLifetime(
      this.onMarkerLifetimeOver.bind(this),
    );
  }

  onMarkerLifetimeOver(id: string) {
    const marker = this.objectMap[id];
    if (!marker) {
      return;
    }

    this.removeObject(id);
  }

  getMarkerOrCreate(marker: RosMessage.Marker) {
    const id = MarkerManager.getId(marker);
    if (!this.objectMap[id]) {
      const object = getNewPrimitive(marker);
      this.objectMap[id] = object;
      this.object.add(object);
    }

    this.objectMap[id].visible = this.namespaces[marker.ns];
    return this.objectMap[id];
  }

  extractNameSpace(str: string) {
    const tokens = str.split('-');
    return tokens[0];
  }

  updateOptions(options: { namespaces: { [p: string]: boolean } }) {
    const { namespaces } = options;
    this.namespaces = namespaces;
    for (const key in this.objectMap) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.objectMap.hasOwnProperty(key)) {
        const namespace = this.extractNameSpace(key);
        this.objectMap[key].visible = this.namespaces[namespace];
      }
    }
  }

  onChange() {
    this.onChangeCb();
  }

  updateMarker(marker: RosMessage.Marker) {
    const {
      color,
      colors,
      lifetime,
      points,
      pose: { orientation, position },
      scale,
    } = marker;

    // markerObject should be of the type MarkerObjectType
    // certain functions used below are not available on
    // all types, hence any
    const markerObject: any = this.getMarkerOrCreate(marker);
    const markerId = MarkerManager.getId(marker);

    this.markerLifetime.track(markerId, lifetime.sec);

    if (markerObject.updatePoints) {
      markerObject.updatePoints(points, colors, marker);
    }

    markerObject.setTransform({ translation: position, rotation: orientation });

    // To avoid settings these properties for list types: LINE, TRIANGLE, CUBELIST etc
    if (markerObject.setScale && !markerObject.updatePoints) {
      markerObject.setScale({
        x: scale.x || DEFAULT_SCALE,
        y: scale.y || DEFAULT_SCALE,
        z: scale.z || DEFAULT_SCALE,
      });
    }
    if (markerObject.setColor && colors.length <= 0) {
      markerObject.setColor(color);
    }

    const { ns } = marker;
    if (!(ns in this.namespaces)) {
      this.namespaces[ns] = true;
      this.onChange();
    }
  }

  removeObject(id: string) {
    const obj = this.objectMap[id];
    obj.parent?.remove(obj);
    delete this.objectMap[id];
  }

  reset() {
    this.namespaces = {};
    this.markerLifetime.destroy();
    this.onChange();

    Object.keys(this.objectMap).forEach(id => {
      this.removeObject(id);
    });
  }

  static getId(marker: RosMessage.Marker) {
    const { ns, id } = marker;
    return `${ns}-${id}`;
  }
}
