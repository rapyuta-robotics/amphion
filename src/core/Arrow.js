// Given a unit, the cylinder to cone ratio is 0.75: 0.25
const defaultConfig = {
  cone: {
    radius: 1,
    height: 0.25
  },
  cylinder: {
    radius: 0.5,
    height: 0.75
  }
};

class Arrow {
  constructor(scene) {
    this.scene = scene;
    this.object = new THREE.Group();
    this.scene.add(this.object);

    this.init();
  }

  init() {
    const { cone, cylinder } = defaultConfig;

    // cone setup
    const geometry = new THREE.ConeBufferGeometry(cone.radius, cone.height, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xf0ff00 });
    this.coneMesh = new THREE.Mesh(geometry, material);
    this.coneMesh.position.y = 0.875;
    this.coneMesh.castShadow = true;
    this.coneMesh.receiveShadow = true;
    this.object.add(this.coneMesh);

    // Cylinder setup
    const cyGeometry = new THREE.CylinderGeometry(
      cylinder.radius, cylinder.radius, cylinder.height, 16
    );
    const cyMaterial = new THREE.MeshStandardMaterial({ color: 0xf0ff00 });
    this.cylinderMesh = new THREE.Mesh(cyGeometry, cyMaterial);
    this.cylinderMesh.position.y = 0.375;
    this.cylinderMesh.castShadow = true;
    this.cylinderMesh.receiveShadow = true;

    this.object.add(this.cylinderMesh);
    this.object.add(this.coneMesh);
  }

  update(message) {
    const { x: posX, y: posY, z: posZ } = message.pose.position;
    const { x: scaleX, y: scaleY, z: scaleZ } = message.scale;

    this.object.position.set(posX, posY, posZ);
    this.object.scale.set(scaleX, scaleY, scaleZ);

    this.coneMesh.material.color = new THREE.Color(
      message.color.r, message.color.g, message.color.b
    );

    this.cylinderMesh.material.color = new THREE.Color(
      message.color.r, message.color.g, message.color.b
    );
  }

  // Config(config) {

  // }
}

export default Arrow;
