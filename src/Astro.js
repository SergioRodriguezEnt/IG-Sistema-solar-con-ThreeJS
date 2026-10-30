import * as THREE from "three";
import { ReceptorSombras } from "./sombras";

const GRADOS_A_RADIANES = Math.PI / 180;
const EJE_X = new THREE.Vector3(1, 0, 0);
const EJE_Y = new THREE.Vector3(0, 1, 0);
const PUNTOS_LINEA_ORBITA = 256;

function calcularAnomaliaExcentrica(anomaliaMedia, excentricidad) {
  let anomaliaExcentrica = anomaliaMedia;
  for (let iteracion = 0; iteracion < 6; iteracion++) {
    anomaliaExcentrica -=
      (anomaliaExcentrica -
        excentricidad * Math.sin(anomaliaExcentrica) -
        anomaliaMedia) /
      (1 - excentricidad * Math.cos(anomaliaExcentrica));
  }
  return anomaliaExcentrica;
}

function puntoEnElipse(orbita, anomaliaExcentrica, destino) {
  const semiejeMenor =
    orbita.semiejeMayor *
    Math.sqrt(1 - orbita.excentricidad * orbita.excentricidad);
  return destino.set(
    orbita.semiejeMayor * (Math.cos(anomaliaExcentrica) - orbita.excentricidad),
    0,
    -semiejeMenor * Math.sin(anomaliaExcentrica)
  );
}

export class Astro {
  constructor(parametros, texturas) {
    this.parametros = parametros;
    this.texturas = texturas;
    this.id = parametros.id;
    this.nombre = parametros.nombre;
    this.tipo = parametros.tipo;
    this.radio = parametros.radio;
    this.padre = null;
    this.hijos = [];
    this.anomaliaVerdadera = 0;

    this.planoOrbital = new THREE.Object3D();
    this.planoOrbital.name = `${parametros.nombre}:planoOrbital`;
    this.centro = new THREE.Group();
    this.centro.name = `${parametros.nombre}:centro`;
    this.eje = new THREE.Group();
    this.eje.name = `${parametros.nombre}:eje`;
    this.planoOrbital.add(this.centro);
    this.centro.add(this.eje);

    this._crearOrbita();
    this.eje.rotation.z = parametros.rotacion.eje * GRADOS_A_RADIANES;
    this._crearCuerpo();
    this._crearAtmosfera();
    if (parametros.anillo) this._crearAnillo();
    if (parametros.luz) this._crearLuz();
  }

  _crearOrbita() {
    const orbita = this.parametros.orbita;
    this.lineaOrbita = null;
    if (!orbita) return;

    const rotacionNodo = new THREE.Quaternion().setFromAxisAngle(
      EJE_Y,
      orbita.nodoAscendente * GRADOS_A_RADIANES
    );
    const rotacionInclinacion = new THREE.Quaternion().setFromAxisAngle(
      EJE_X,
      orbita.inclinacion * GRADOS_A_RADIANES
    );
    const rotacionPeriapsis = new THREE.Quaternion().setFromAxisAngle(
      EJE_Y,
      orbita.argumentoPeriapsis * GRADOS_A_RADIANES
    );
    this.planoOrbital.quaternion
      .copy(rotacionNodo)
      .multiply(rotacionInclinacion)
      .multiply(rotacionPeriapsis);

    const puntos = [];
    for (
      let indicePunto = 0;
      indicePunto < PUNTOS_LINEA_ORBITA;
      indicePunto++
    ) {
      const anomaliaExcentrica =
        (indicePunto / PUNTOS_LINEA_ORBITA) * Math.PI * 2;
      puntos.push(
        puntoEnElipse(orbita, anomaliaExcentrica, new THREE.Vector3())
      );
    }
    const geometria = new THREE.BufferGeometry().setFromPoints(puntos);
    const material = new THREE.LineBasicMaterial({
      color: this.parametros.color,
      transparent: true,
      opacity: this.tipo === "Luna" ? 0.3 : 0.4,
      depthWrite: false,
    });
    this.lineaOrbita = new THREE.LineLoop(geometria, material);
    this.lineaOrbita.name = `${this.nombre}:orbita`;
    this.planoOrbital.add(this.lineaOrbita);
  }

  _crearCuerpo() {
    const parametros = this.parametros;
    const texturas = this.texturas;
    const segmentos = parametros.tipo === "Luna" ? 48 : 96;
    const geometria = new THREE.SphereGeometry(
      parametros.radio,
      segmentos,
      segmentos / 2
    );
    let material;

    if (parametros.emisivo) {
      material = new THREE.MeshPhongMaterial({
        color: 0x000000,
        emissive: 0xffd9a0,
        emissiveMap: texturas.color,
        map: texturas.color,
        bumpMap: texturas.relieve,
        bumpScale: parametros.bumpEscala,
      });
    } else {
      material = new THREE.MeshPhongMaterial({
        map: texturas.color,
        bumpMap: texturas.relieve,
        bumpScale: parametros.bumpEscala,
        specular: 0x111111,
        shininess: 12,
      });
      if (parametros.especular && texturas.especular) {
        material.specularMap = texturas.especular;
        material.specular = new THREE.Color(0x555555);
        material.shininess = 25;
      }
    }

    this.cuerpo = new THREE.Mesh(geometria, material);
    this.cuerpo.name = this.nombre;
    this.cuerpo.userData.astro = this;
    this.eje.add(this.cuerpo);
  }

  _crearAtmosfera() {
    const parametros = this.parametros;
    const atmosfera = parametros.atmosfera;
    const geometria = new THREE.SphereGeometry(
      parametros.radio * atmosfera.escala,
      64,
      32
    );
    const opciones = {
      map: this.texturas.atmosfera,
      alphaMap: this.texturas.atmosferaAlfa,
      transparent: true,
      depthWrite: false,
    };
    const material = atmosfera.aditiva
      ? new THREE.MeshBasicMaterial({
          ...opciones,
          blending: THREE.AdditiveBlending,
        })
      : new THREE.MeshPhongMaterial({
          ...opciones,
          specular: 0x000000,
          shininess: 1,
        });

    this.atmosfera = new THREE.Mesh(geometria, material);
    this.atmosfera.name = `${this.nombre}:atmosfera`;
    this.atmosfera.userData.astro = this;
    this.atmosfera.renderOrder = 1;
    this.eje.add(this.atmosfera);
  }

  _crearAnillo() {
    const { interior, exterior } = this.parametros.anillo;
    this.radioInteriorAnillo = this.radio * interior;
    this.radioExteriorAnillo = this.radio * exterior;
    const anchoAnillo = this.radioExteriorAnillo - this.radioInteriorAnillo;
    const geometria = new THREE.RingGeometry(
      this.radioInteriorAnillo,
      this.radioExteriorAnillo,
      160,
      1
    );

    const posiciones = geometria.attributes.position;
    const coordenadasUV = geometria.attributes.uv;
    const vertice = new THREE.Vector3();
    for (
      let indiceVertice = 0;
      indiceVertice < posiciones.count;
      indiceVertice++
    ) {
      vertice.fromBufferAttribute(posiciones, indiceVertice);
      coordenadasUV.setXY(
        indiceVertice,
        (vertice.length() - this.radioInteriorAnillo) / anchoAnillo,
        0.5
      );
    }

    const material = new THREE.MeshPhongMaterial({
      map: this.texturas.anilloColor,
      alphaMap: this.texturas.anilloAlfa,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
      specular: 0x000000,
    });
    this.anillo = new THREE.Mesh(geometria, material);
    this.anillo.name = `${this.nombre}:anillo`;
    this.anillo.rotation.x = -Math.PI / 2;
    this.anillo.renderOrder = 2;
    this.eje.add(this.anillo);
  }

  _crearLuz() {
    this.luz = new THREE.PointLight(0xffffff, 1.6, 0, 0);
    this.centro.add(this.luz);
  }

  agregarHijo(hijo) {
    hijo.padre = this;
    this.hijos.push(hijo);
    const nodoAncla = hijo.parametros.enEcuador ? this.eje : this.centro;
    nodoAncla.add(hijo.planoOrbital);
  }

  configurarSombras() {
    const radioAngularSol = this.parametros.radioAngularSol;
    let ocultadores = [];
    if (this.tipo === "Planeta") ocultadores = [...this.hijos];
    if (this.tipo === "Luna") {
      ocultadores = [
        this.padre,
        ...this.padre.hijos.filter((hermana) => hermana !== this),
      ];
    }

    const sombraAnillo = this.anillo
      ? {
          malla: this.anillo,
          radioInterior: this.radioInteriorAnillo,
          radioExterior: this.radioExteriorAnillo,
          transparencia: this.texturas.anilloAlfa,
        }
      : null;

    this.receptorSombras = new ReceptorSombras(
      ocultadores,
      radioAngularSol,
      sombraAnillo
    );
    if (!this.parametros.emisivo) {
      this.receptorSombras.aplicarA(this.cuerpo.material);
      if (this.atmosfera.material.isMeshPhongMaterial) {
        this.receptorSombras.aplicarA(this.atmosfera.material);
      }
    }

    this.receptoresSombras = [this.receptorSombras];
    if (this.anillo) {
      const receptorAnillo = new ReceptorSombras(
        [this, ...this.hijos],
        radioAngularSol
      );
      receptorAnillo.aplicarA(this.anillo.material);
      this.receptoresSombras.push(receptorAnillo);
    }

    for (const hijo of this.hijos) hijo.configurarSombras();
  }

  actualizarSombras(posicionSol) {
    for (const receptor of this.receptoresSombras)
      receptor.actualizar(posicionSol);
    for (const hijo of this.hijos) hijo.actualizarSombras(posicionSol);
  }

  actualizar(tiempo) {
    const parametros = this.parametros;
    const orbita = parametros.orbita;

    if (orbita) {
      const anomaliaMedia =
        (2 * Math.PI * tiempo) / orbita.periodo +
        orbita.fase * GRADOS_A_RADIANES;
      const anomaliaExcentrica = calcularAnomaliaExcentrica(
        anomaliaMedia,
        orbita.excentricidad
      );
      puntoEnElipse(orbita, anomaliaExcentrica, this.centro.position);
      this.anomaliaVerdadera = Math.atan2(
        -this.centro.position.z,
        this.centro.position.x
      );
    }

    if (parametros.rotacion.acoplada) {
      this.cuerpo.rotation.y = this.anomaliaVerdadera + Math.PI;
    } else {
      this.cuerpo.rotation.y =
        (2 * Math.PI * tiempo) / parametros.rotacion.periodo;
    }
    this.atmosfera.rotation.y =
      (2 * Math.PI * tiempo * parametros.atmosfera.factorRotacion) /
      parametros.rotacion.periodo;

    for (const hijo of this.hijos) hijo.actualizar(tiempo);
  }

  posicionMundo(destino = new THREE.Vector3()) {
    return this.centro.getWorldPosition(destino);
  }

  recorrer(funcion) {
    funcion(this);
    for (const hijo of this.hijos) hijo.recorrer(funcion);
  }
}
