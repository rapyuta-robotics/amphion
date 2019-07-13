import * as THREE from 'three';
import Stats from 'stats-js';
import ROSLIB from 'roslib';
import { EditorControls } from 'three/examples/jsm/controls/EditorControls';

import Scene from '../core/scene';

const excludedObjects = [
  'PerspectiveCamera',
  'OrthographicCamera',
  'AmbientLight',
  'DirectionalLight',
  'HemisphereLight',
  'Light',
  'RectAreaLight',
  'SpotLight',
  'PointLight',
];

const removeExcludedObjects = mesh => {
  const objectArray = [mesh];
  while (Object.keys(objectArray).length > 0) {
    const currentItem = objectArray.shift();
    currentItem.children.forEach(child => {
      if (!child) {
        return;
      }
      if (excludedObjects.indexOf(child.type) > -1) {
        const { parent } = child;
        parent.children = parent.children.filter(c => c !== child);
      } else {
        objectArray.push(child);
      }
    });
  }
};

class Viewer3d {
  constructor(rosInstance) {
    this.scene = new Scene;
    this.robotMeshes = [];
    this.ros = rosInstance;
    this.framesList = [];
    this.selectedFrame = [];
    this.vizWrapper = new THREE.Group();
    this.vizWrapper.rotateX(-Math.PI / 2);
    this.scene.add(this.vizWrapper);
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.previousWidth = 0;
    this.previousHeight = 0;

    this.initLights();
    this.initCamera();
    this.initGrid();
    this.initRosEvents();
    this.scene.background = new THREE.Color(0x000000);
    this.animate = this.animate.bind(this);
    this.getTFMessages = this.getTFMessages.bind(this);
    this.setFrameTransform = this.setFrameTransform.bind(this);
    this.resetFrameTransform = this.resetFrameTransform.bind(this);
    this.addRobot = this.addRobot.bind(this);
  }

  initLights() {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(positions => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      [directionalLight.position.x, directionalLight.position.z] = positions;
      directionalLight.position.y = 1;
      this.scene.add(directionalLight);
    });
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(new THREE.Vector3());

    this.scene.add(this.camera);
  }

  initGrid() {
    const grid = new THREE.GridHelper(30, 30, 0x333333, 0x222222);

    this.scene.add(grid);
    const { array } = grid.geometry.attributes.color;
    for (let i = 0; i < array.length; i += 60) {
      for (let j = 0; j < 12; j += 1) {
        array[i + j] = 0.26;
      }
    }
  }

  setContainer(domNode) {
    this.container = domNode;
    this.initRenderer(domNode);
    this.controls = new EditorControls(this.camera, this.container);
    this.controls.enableDamping = true;
    window.addEventListener('resize', this.onWindowResize);
    requestAnimationFrame(this.animate);
    this.onWindowResize();
  }

  initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.autoUpdateScene = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer = renderer;
    this.container.appendChild(renderer.domElement);
  }

  animate() {
    this.stats.begin();
    this.scene.updateMatrixWorld();

    this.renderer.render(this.scene, this.camera);
    this.stats.end();
    requestAnimationFrame(this.animate);
  }

  destroy() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    const { camera } = this;
    const { offsetWidth, offsetHeight } = this.container;
    if (
      Math.abs(offsetWidth - this.previousWidth) > 10 ||
      Math.abs(offsetHeight - this.previousHeight) > 10
    ) {
      camera.aspect = offsetWidth / offsetHeight;
      camera.updateProjectionMatrix();
      this.renderer.setSize(offsetWidth, offsetHeight);
      this.previousWidth = offsetWidth;
      this.previousHeight = offsetHeight;
    }
  }
  initRosEvents() {
    this.ros.on('connection', () => {
      this.ros.getTopics(rosTopics => {
        ['/tf', '/tf_static'].forEach(name => {
          const topic = new ROSLIB.Topic({
            ros: this.ros,
            name,
            messageType: rosTopics.types[rosTopics.topics.indexOf(name)],
          });
          topic.subscribe(this.getTFMessages);
        });
      });
    });
  }

  resetFrameTransform() {
    const { vizWrapper } = this;

    vizWrapper.position.set(0, 0, 0);
    vizWrapper.quaternion.set(0, 0, 0, 1);
  }

  getTFMessages({ transforms }) {
    const { selectedFrame } = this;

    transforms.forEach(
      ({
         header: { frame_id: parentFrameId },
         child_frame_id: childFrameId,
        transform: {
          translation: {x, y, z},
          rotation: {
             x: rx, y: ry, z: rz, w: rw,
          },
        }
       }) => {
        const [childObject, parentObject] = [
          this.getObjectOrCreate(childFrameId),
          this.getObjectOrCreate(parentFrameId),
        ];

        parentObject.add(childObject);
        childObject.position.set(x, y, z);
        childObject.quaternion.set(rx, ry, rz, rw);

        [parentFrameId, childFrameId].forEach(frame => {
          if (this.framesList.indexOf(frame) === -1) {
            this.framesList.push(frame);
          }
        });

        if (selectedFrame === '') {
          return;
        }

        if (selectedFrame === childFrameId || selectedFrame === parentFrameId) {
          this.setFrameTransform();
          return;
        }

        if (
          parentObject.getObjectByName(selectedFrame) ||
          childObject.getObjectByName(selectedFrame)
        ) {
          this.setFrameTransform();
        }
      },
    );
  }

  getObjectOrCreate(frameId) {
    const existingFrame = this.vizWrapper.getObjectByName(frameId);
    if (existingFrame) {
      return existingFrame;
    }

    const newFrame = new THREE.Group();
    newFrame.name = frameId;
    this.vizWrapper.add(newFrame);
    return newFrame;
  }

  setFrameTransform(selectedFrame) {
    const { vizWrapper } = this;
    const currentFrameObject = vizWrapper.getObjectByName(selectedFrame);

    if (currentFrameObject) {
      this.resetFrameTransform();
      vizWrapper.updateMatrixWorld();

      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();

      currentFrameObject.getWorldQuaternion(worldQuat);
      const { x: quatx, y: quaty, z: quatz, w: quatw } = worldQuat;
      vizWrapper.quaternion.set(-quatx, -quaty, -quatz, quatw);

      vizWrapper.updateMatrixWorld();

      currentFrameObject.getWorldPosition(worldPos);
      const oppPos = worldPos.negate();
      vizWrapper.position.set(oppPos.x, oppPos.y, oppPos.z);
    }
  }

  addVisualization(vizObject) {
    const { object } = vizObject;
    if (!this.vizWrapper.getObjectById(object.id)) {
      this.vizWrapper.add(object);
    }

    vizObject.onHeaderChange = newFrameId => {
      let frameObject = this.getObjectOrCreate(newFrameId);
      frameObject.add(vizObject.object);
    };
  }
  addRobot(robotModel, options) {
    const packages = {};
    for(let i = 0; i < options.packages.length; i++) {
      packages[options.packages[i].name] = options.packages[i].value;
    }
    robotModel.load(
      object => {
        removeExcludedObjects(object);
        this.vizWrapper.add(robotModel.object);
        for(let linkName in object.children[0].links) {
          const o = object.children[0].links[linkName];
          const existingObject = this.vizWrapper.getObjectByName(o.name);
          if (existingObject) {
            o.children.forEach(child => {
              existingObject.add(child);
            });
          }
        }
      },
      {
        packages,
        loadMeshCb: (path, ext, done) => {
          robotModel.defaultMeshLoader(path, ext, mesh => {
            removeExcludedObjects(mesh);
            this.robotMeshes.push(mesh);
            done(mesh);
          });
        },
        fetchOptions: { mode: 'cors', credentials: 'same-origin' },
      },
    );
  }

  setFixedFrame() {

  }

  setBackgroundColor() {

  }

  setGridSize() {

  }
}

export default Viewer3d;
