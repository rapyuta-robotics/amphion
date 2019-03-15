const CYLINDER_RADIUS = 0.05;
const CYLINDER_HEIGHT = 1;

class Axes {
  constructor(scene) {
    this.scene = scene;
    this.object = new THREE.Group();
    this.init();
  }

  init() {
    this.x = new THREE.Group();
    this.x.add(this.getCylinder(0xff0000));
    this.y = new THREE.Group();
    this.y.add(this.getCylinder(0x008000));
    this.z = new THREE.Group();
    this.z.add(this.getCylinder(0x0000ff));

    this.x.rotation.z = -Math.PI / 2;
    this.z.rotation.x = Math.PI / 2;

    this.object.add(this.x);
    this.object.add(this.y);
    this.object.add(this.z);

    this.scene.add(this.object);
  }

  getCylinder(colorHex) {
    const geometry = new THREE.CylinderGeometry(
      CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT, 16
    );
    const material = new THREE.MeshStandardMaterial({ color: colorHex });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.y = 0.5;
    return cylinder;
  }

  setPose(message) {
    const { x: posX, y: posY, z: posZ } = message.pose.position;
    const {
      x: orientX,
      y: orientY,
      z: orientZ,
      w: orientW
    } = message.pose.orientation;

    this.object.position.set(posX, posY, posZ);
    this.object.quaternion.set(orientX, orientY, orientZ, orientW);
  }
}

export default Axes;
