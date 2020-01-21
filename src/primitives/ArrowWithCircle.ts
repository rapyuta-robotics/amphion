import { Math as THREEMath, MeshStandardMaterial, TorusGeometry } from 'three';
import Arrow from './Arrow';
import Cone from './Cone';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_OPTIONS_TORUS,
} from '../utils/constants';
import * as TransformUtils from '../utils/transform';
import { assertIsMaterial, assertIsTorusGeometry } from '../utils/helpers';
import Mesh from './Mesh';

class ArrowWithCircle extends Arrow {
  private readonly circleCone = new Cone(DEFAULT_COLOR_X_AXIS);
  public readonly material = new MeshStandardMaterial({
    color: this.cone.material.color,
  });
  private readonly torus: Mesh;

  constructor() {
    super();
    this.add(this.circleCone);
    this.material.transparent = true;

    const torusOptions = DEFAULT_OPTIONS_TORUS;
    const torusGeometry = new TorusGeometry(
      torusOptions.circleRadius,
      torusOptions.tube,
      torusOptions.radialSegments,
      torusOptions.tubularSegments,
      torusOptions.arc,
    );
    this.torus = new Mesh(torusGeometry, this.material);
    this.add(this.torus);

    this.circleCone.rotateX(torusGeometry.parameters.arc);
    this.circleCone.translateZ(
      -Math.cos(-torusGeometry.parameters.arc) *
        torusGeometry.parameters.radius,
    );
    this.circleCone.translateY(
      -Math.sin(-torusGeometry.parameters.arc) *
        torusGeometry.parameters.radius,
    );
    this.circleCone.translateX(this.cylinder.scale.y / 2);
    this.torus.translateX(this.cylinder.scale.y / 2);
    this.torus.rotateY(Math.PI / 2);
  }

  setTorusDimensions(args: { radius: number; tube: number }) {
    const { radius, tube } = args;
    const torusOptions = DEFAULT_OPTIONS_TORUS;
    this.torus.geometry = new TorusGeometry(
      radius,
      tube,
      torusOptions.radialSegments,
      torusOptions.tubularSegments,
      torusOptions.arc,
    );
    this.torus.position.set(0, 0, 0);
    this.torus.rotation.set(0, 0, 0);
    this.torus.translateX(this.cylinder.scale.y / 2);
    this.torus.rotateY(Math.PI / 2);
  }

  setCircleConeDimensions(args: { radius: number; length: number }) {
    const { radius, length } = args;
    const parsedRadius = +`${radius}`;
    const parsedLength = +`${length}`;
    assertIsTorusGeometry(this.torus.geometry);

    if (parsedRadius) {
      const { y } = this.circleCone.scale;
      this.circleCone.setScale({ x: radius, y, z: radius });
    }

    if (parsedLength) {
      const { x, z } = this.circleCone.scale;
      this.circleCone.setScale({ x, y: parsedLength, z });
    }

    this.circleCone.position.set(0, 0, 0);
    this.circleCone.rotation.set(0, 0, 0);
    this.circleCone.translateX(this.cylinder.scale.y / 2);
    this.circleCone.translateZ(
      -Math.cos(-this.torus.geometry.parameters.arc) *
        this.torus.geometry.parameters.radius,
    );
    this.circleCone.translateY(
      -Math.sin(-this.torus.geometry.parameters.arc) *
        this.torus.geometry.parameters.radius,
    );
    this.circleCone.rotateX(this.torus.geometry.parameters.arc);
  }

  setColor(args: { [object: string]: RosMessage.Color | string }) {
    const { cone, cylinder, torus, circleCone } = args;

    if (cone) {
      this.cone.setColor(cone);
    }
    if (cylinder) {
      this.cylinder.setColor(cylinder);
    }
    if (torus) {
      TransformUtils.setColor(this.torus, this.cone.material.color);
    }
    if (circleCone) {
      this.circleCone.setColor(circleCone);
    }
  }

  setAlpha(alpha: number) {
    super.setAlpha(alpha);
    assertIsMaterial(this.torus.material);
    this.torus.material.opacity = THREEMath.clamp(alpha, 0, 1);
    this.circleCone.setAlpha(alpha);
  }
}

export default ArrowWithCircle;
