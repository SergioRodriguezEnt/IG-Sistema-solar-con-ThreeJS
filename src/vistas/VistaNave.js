import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { texturaNave } from "../texturas";

const VELOCIDAD_NAVE = 50;
const VELOCIDAD_GIRO_NAVE = 0.6;
const TAMANO_SPRITE = 0.8;

export class VistaNave {
  constructor(escena, lienzo, aspecto) {
    this.nombre = "Vista de nave";
    this.escena = escena;
    this.lienzo = lienzo;
    this.nave = null;
    this.controles = null;

    this.camara = new THREE.PerspectiveCamera(60, aspecto, 0.05, 6000);
    this.camara.position.set(0, 0.35, 2.6);
    this.camara.rotation.x = -0.06;

    this.materialSprite = new THREE.SpriteMaterial({
      map: texturaNave(),
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
    });
  }

  crear(posicion, cuaternion) {
    this._borrarNave();

    this.nave = new THREE.Object3D();
    this.nave.name = "nave";
    this.nave.position.copy(posicion);
    this.nave.quaternion.copy(cuaternion);

    const sprite = new THREE.Sprite(this.materialSprite);
    sprite.scale.set(TAMANO_SPRITE, TAMANO_SPRITE, 1);
    sprite.renderOrder = 10;
    this.nave.add(sprite);
    this.nave.add(this.camara);
    this.escena.add(this.nave);

    this.controles = new FlyControls(this.nave, this.lienzo);
    this.controles.movementSpeed = VELOCIDAD_NAVE;
    this.controles.rollSpeed = VELOCIDAD_GIRO_NAVE;
    this.controles.dragToLook = true;
  }

  desactivar() {
    if (this.controles) {
      this.controles.dispose();
      this.controles = null;
    }
  }

  _borrarNave() {
    this.desactivar();
    if (this.nave) {
      this.escena.remove(this.nave);
      this.nave = null;
    }
  }

  actualizar(dt) {
    if (this.controles) this.controles.update(dt);
  }
}
