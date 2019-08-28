import {
  DEFAULT_CONE_HEIGHT,
  DEFAULT_CONE_RADIUS,
  DEFAULT_CYLINDER_HEIGHT,
  DEFAULT_CYLINDER_RADIUS,
  DEFAULT_COLOR_X_AXIS,
  OBJECT_TYPE_ARROW,
  DEFAULT_OPTIONS_ARROW,
  DEFAULT_OPTIONS_ARROW_WITH_CIRCLE,
  DEFAULT_OPTIONS_TORUS
} from '../utils/constants';
import * as THREE from 'three';
import Arrow from './Arrow';
import Cylinder from './Cylinder';
import Cone from './Cone';
import Group from './Group';
import * as TransformUtils from '../utils/transform';

class ArrowWithCircle extends Arrow {
  constructor() {
   	super();

   	var torusOptions = DEFAULT_OPTIONS_TORUS;

    this.material = new THREE.MeshStandardMaterial({color: this.cone.material.color});

    this.circleCone = new Cone(DEFAULT_COLOR_X_AXIS);
    this.add(this.circleCone);

    var torusGeometry = new THREE.TorusGeometry(
    	torusOptions.circleRadius, 
    	torusOptions.tube, 
    	torusOptions.radialSegments, 
    	torusOptions.tubularSegments, 
    	torusOptions.arc
    	)

	this.torus = new THREE.Mesh(torusGeometry, this.material );
	this.add(this.torus);

	this.circleCone.rotateX(-Math.PI/2);
	this.circleCone.translateZ(this.torus.geometry.parameters.radius);
	this.circleCone.translateX(this.cylinder.scale.y / 2);

    this.torus.translateX(this.cylinder.scale.y / 2);
    this.torus.rotateY(Math.PI/2);
}

    setTorusDimensions({radius, tube}) {
    	const parsedRadius = parseFloat(radius);
    	const parsedTube = parseFloat(tube);

    	var torusOptions = DEFAULT_OPTIONS_TORUS;

    	this.torus.geometry = new THREE.TorusGeometry(
    		radius, 
    		tube, 
    		torusOptions.radialSegments, 
    		torusOptions.tubularSegments, 
    		torusOptions.arc
    	)

    	this.torus.position.set(0,0,0);
    	this.torus.rotation.set(0,0,0);
    	this.torus.translateX(this.cylinder.scale.y / 2);
    	this.torus.rotateY(Math.PI/2);
    }

    setCircleConeDimensions({radius, length}) {
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

      	this.circleCone.position.set(0,0,0);
      	this.circleCone.translateX(this.cylinder.scale.y / 2);
      	this.circleCone.translateZ(-this.torus.geometry.parameters.radius);
    }

    setColor({cone, cylinder, torus, circleCone}) {
    	if (cone) {
    		this.cone.setColor(cone);
    	}
    	
    	if (cylinder) {
    		this.cylinder.setColor(cylinder);
    	}

    	if(torus) {
    		TransformUtils.setColor(this.torus, this.cone.material.color);
    	}

    	if(circleCone) {
    		this.circleCone.setColor(circleCone);
    	}
    }

    setAlpha({cone, cylinder, torus, circleCone}) {
    	if (cone) {
    		this.cone.setALpha(cone);
    	}
    	
    	if (cylinder) {
    		this.cylinder.setAlpha(cylinder);
    	}

    	if(torus) {
    		TransformUtils.setAlpha(this.torus, this.cone.material.color);
    	}

    	if(circleCone) {
    		this.circleCone.setAlpha(circleCone);
    	}
    }
}

export default ArrowWithCircle;

	