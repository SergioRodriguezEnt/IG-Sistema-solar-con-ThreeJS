import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const direccionFrontal = new THREE.Vector3();

export class VistaGlobal {
  constructor(camara, lienzo) {
    this.nombre = "Vista global";
    this.camara = camara;
    this.controles = new OrbitControls(camara, lienzo);
    this.controles.enableDamping = true;
    this.controles.dampingFactor = 0.08;
    this.controles.screenSpacePanning = true;
    this.controles.minDistance = 1;
    this.controles.maxDistance = 3000;
    this.controles.zoomSpeed = 1.2;
    this.controles.enabled = false;
  }

  activar(posicion, cuaternion, distanciaPuntoGiro) {
    const camara = this.camara;
    camara.up.set(0, 1, 0);
    camara.position.copy(posicion);
    camara.quaternion.copy(cuaternion);
    direccionFrontal.set(0, 0, -1).applyQuaternion(cuaternion);
    this.controles.target
      .copy(posicion)
      .addScaledVector(direccionFrontal, distanciaPuntoGiro);
    this.controles.enabled = true;
    this.controles.update();
  }

  desactivar() {
    this.controles.enabled = false;
  }

  actualizar() {
    this.controles.update();
  }
}
