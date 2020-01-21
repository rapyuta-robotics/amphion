import {
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
  MARKER_OBJECT_TYPES,
} from './constants';
import Cube from '../primitives/Cube';
import Sphere from '../primitives/Sphere';
import Group from '../primitives/Group';
import Cylinder from '../primitives/Cylinder';
import LineSegments from '../primitives/LineSegment';
import Line from '../primitives/Line';
import SphereList from '../primitives/SphereList';
import Points from '../primitives/Points';
import TriangleList from '../primitives/TriangleList';
import CubeList from '../primitives/CubeList';
import Arrow from '../primitives/Arrow';
import ViewFacingText from '../primitives/ViewFacingText';

export type MarkerObjectType =
  | Cube
  | Sphere
  | Group
  | LineSegments
  | Line
  | SphereList
  | Points
  | TriangleList
  | CubeList
  | ViewFacingText
  | Arrow;

const getNewPrimitive: (marker: RosMessage.Marker) => MarkerObjectType = (
  marker: RosMessage.Marker,
) => {
  switch (marker.type) {
    case MARKER_OBJECT_TYPES.CUBE:
      return new Cube();
    case MARKER_OBJECT_TYPES.SPHERE:
      return new Sphere();
    case MARKER_OBJECT_TYPES.CYLINDER: {
      const group = new Group();
      group.add(new Cylinder());
      return group;
    }
    case MARKER_OBJECT_TYPES.LINE_LIST:
      return new LineSegments();
    case MARKER_OBJECT_TYPES.LINE_STRIP:
      return new Line();
    case MARKER_OBJECT_TYPES.SPHERE_LIST:
      return new SphereList();
    case MARKER_OBJECT_TYPES.POINTS:
      return new Points();
    case MARKER_OBJECT_TYPES.TRIANGLE_LIST:
      return new TriangleList();
    case MARKER_OBJECT_TYPES.CUBE_LIST:
      return new CubeList();
    case MARKER_OBJECT_TYPES.TEXT_VIEW_FACING:
      return new ViewFacingText(marker.text);
    case MARKER_OBJECT_TYPES.ARROW:
    default: {
      const arrow = new Arrow();
      arrow.setHeadDimensions({
        radius: DEFAULT_CONE_RADIUS * 0.1,
        length: DEFAULT_CONE_HEIGHT * 0.3,
      });
      arrow.setShaftDimensions({
        radius: DEFAULT_CYLINDER_RADIUS * 0.05,
        length: DEFAULT_CYLINDER_HEIGHT * 0.7,
      });
      return arrow;
    }
  }
};

export default getNewPrimitive;
