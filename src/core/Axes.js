const CYLINDER_RADIUS = 0.05;
const CYLINDER_HEIGHT = 1;

class Axes {
  constructor(scene) {
    this.scene = scene;
    this.object = new THREE.Group();
    this.Init();
  }

  Init() {
    this.x = new THREE.Group();
    this.x.add(this.GetCylinder(0xff0000));
    this.y = new THREE.Group();
    this.y.add(this.GetCylinder(0x008000));
    this.z = new THREE.Group();
    this.z.add(this.GetCylinder(0x0000ff));

    this.x.rotation.z = -Math.PI / 2;
    this.z.rotation.x = Math.PI / 2;

    this.object.add(this.x);
    this.object.add(this.y);
    this.object.add(this.z);

    this.scene.add(this.object);
  }

  GetCylinder(colorHex) {
    const geometry = new THREE.CylinderGeometry(
      CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT, 16
    );
    const material = new THREE.MeshStandardMaterial({ color: colorHex });
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.y = 0.5;
    return cylinder;
  }
}

export default Axes;
