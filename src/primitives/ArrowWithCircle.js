import {
  Math as THREEMath,
  Mesh,
  MeshStandardMaterial,
  TorusGeometry,
} from 'three';
import Arrow from './Arrow';
import Cone from './Cone';
import {
  DEFAULT_COLOR_X_AXIS,
  DEFAULT_OPTIONS_TORUS,
} from '../utils/constants';
import * as TransformUtils from '../utils/transform';

class ArrowWithCircle extends Arrow {
  constructor() {
    super();

    this.circleCone = new Cone(DEFAULT_COLOR_X_AXIS);
    this.add(this.circleCone);

    const torusOptions = DEFAULT_OPTIONS_TORUS;

    this.material = new MeshStandardMaterial({
      color: this.cone.material.color,
    });
    this.material.transparent = true;

    const torusGeometry = new TorusGeometry(
      torusOptions.circleRadius,
      torusOptions.tube,
      torusOptions.radialSegments,
      torusOptions.tubularSegments,
      torusOptions.arc,
    );

    this.torus = new Mesh(torusGeometry, this.material);
    this.add(this.torus);

    this.circleCone.rotateX(this.torus.geometry.parameters.arc);
    this.circleCone.translateZ(
      -Math.cos(-this.torus.geometry.parameters.arc) *
        this.torus.geometry.parameters.radius,
    );
    this.circleCone.translateY(
      -Math.sin(-this.torus.geometry.parameters.arc) *
        this.torus.geometry.parameters.radius,
    );
    this.circleCone.translateX(this.cylinder.scale.y / 2);

    this.torus.translateX(this.cylinder.scale.y / 2);
    this.torus.rotateY(Math.PI / 2);
  }

  setTorusDimensions({ radius, tube }) {
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

  setCircleConeDimensions({ radius, length }) {
    const parsedRadius = parseFloat(radius);
    const parsedLength = parseFloat(length);

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

  setColor({ cone, cylinder, torus, circleCone }) {
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

  setAlpha({ cone, cylinder, torus, circleCone }) {
    if (cone) {
      this.cone.setAlpha(cone);
    }

    if (cylinder) {
      this.cylinder.setAlpha(cylinder);
    }

    if (torus) {
      this.torus.material.opacity = THREEMath.clamp(torus, 0, 1);
    }

    if (circleCone) {
      this.circleCone.setAlpha(circleCone);
    }
  }
}

export default ArrowWithCircle;
