import * as THREE from 'three';

class Points {
  constructor(options = {}) {
    this.max_pts = options.max_pts || 10000;
    this.pointRatio = options.pointRatio || 1;
    this.messageRatio = options.messageRatio || 1;
    this.messageCount = 0;
    this.rootObject = options.rootObject || new THREE.Object3D();
  }

  setup(frame, pointStep, fields) {
    if (this.rootObject.children.length === 0) {
      // turn fields to a map
      fields = fields || [];
      this.fields = {};
      for (let i = 0; i < fields.length; i++) {
        this.fields[fields[i].name] = fields[i];
      }
      this.geom = new THREE.BufferGeometry();

      this.positions = new THREE.BufferAttribute(new Float32Array(this.max_pts * 3), 3, false);
      this.geom.addAttribute('position', this.positions.setDynamic(true));

      this.material = new THREE.PointsMaterial({ color: 0x888888, size: 0.1 });
      this.object = new THREE.Points(this.geom, this.material);

      this.rootObject.add(this.object);
    }
    return (this.messageCount++ % this.messageRatio) === 0;
  }

  update(data) {
    this.geom.setDrawRange(0, data);

    this.positions.needsUpdate = true;
    this.positions.updateRange.count = data * this.positions.itemSize;
  }
}

export default Points;
