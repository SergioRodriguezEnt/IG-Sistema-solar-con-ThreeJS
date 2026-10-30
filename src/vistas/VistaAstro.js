import * as THREE from "three";

const DISTANCIA_MINIMA = 1.25;
const DISTANCIA_MAXIMA = 40;
const DISTANCIA_MAXIMA_AL_ENTRAR = 3.5;
const SENSIBILIDAD_GIRO = 0.006;
const FACTOR_ZOOM = 1.12;
const RAPIDEZ_ACERCAMIENTO = 4;

const centroAstro = new THREE.Vector3();
const rotacionAstro = new THREE.Quaternion();
const rotacionInversa = new THREE.Quaternion();
const desplazamientoCamara = new THREE.Vector3();

export class VistaAstro {
  constructor(camara, lienzo) {
    this.nombre = "Vista de astro";
    this.camara = camara;
    this.lienzo = lienzo;
    this.astro = null;
    this.activa = false;
    this.coordenadasEsfericas = new THREE.Spherical();
    this.distanciaObjetivo = 1;
    this.arrastrando = false;
    this.ultimaPosicionPuntero = { x: 0, y: 0 };

    lienzo.addEventListener("pointerdown", (evento) => this._alPulsar(evento));
    window.addEventListener("pointermove", (evento) => this._alMover(evento));
    window.addEventListener("pointerup", () => (this.arrastrando = false));
    lienzo.addEventListener("wheel", (evento) => this._alGirarRueda(evento), {
      passive: false,
    });
  }

  get distanciaMinima() {
    return this.astro.radio * DISTANCIA_MINIMA;
  }

  get distanciaMaxima() {
    return this.astro.radio * DISTANCIA_MAXIMA;
  }

  activar(astro) {
    this.astro = astro;
    this.activa = true;
    astro.posicionMundo(centroAstro);
    astro.cuerpo.getWorldQuaternion(rotacionAstro);
    desplazamientoCamara.copy(this.camara.position).sub(centroAstro);
    const distancia = desplazamientoCamara.length();
    desplazamientoCamara.applyQuaternion(
      rotacionInversa.copy(rotacionAstro).invert()
    );

    this.coordenadasEsfericas.setFromVector3(desplazamientoCamara);
    this.coordenadasEsfericas.makeSafe();
    this.coordenadasEsfericas.radius = distancia;
    this.distanciaObjetivo = THREE.MathUtils.clamp(
      distancia,
      this.distanciaMinima,
      astro.radio * DISTANCIA_MAXIMA_AL_ENTRAR
    );
  }

  desactivar() {
    this.activa = false;
    this.arrastrando = false;
  }

  actualizar(dt) {
    if (!this.astro) return;

    const factorSuavizado = 1 - Math.exp(-dt * RAPIDEZ_ACERCAMIENTO);
    this.coordenadasEsfericas.radius +=
      (this.distanciaObjetivo - this.coordenadasEsfericas.radius) *
      factorSuavizado;

    this.astro.posicionMundo(centroAstro);
    this.astro.cuerpo.getWorldQuaternion(rotacionAstro);
    desplazamientoCamara
      .setFromSpherical(this.coordenadasEsfericas)
      .applyQuaternion(rotacionAstro);

    const camara = this.camara;
    camara.position.copy(centroAstro).add(desplazamientoCamara);
    camara.up.set(0, 1, 0).applyQuaternion(rotacionAstro);
    camara.lookAt(centroAstro);
  }

  _alPulsar(evento) {
    if (!this.activa || evento.button !== 0) return;
    this.arrastrando = true;
    this.ultimaPosicionPuntero.x = evento.clientX;
    this.ultimaPosicionPuntero.y = evento.clientY;
  }

  _alMover(evento) {
    if (!this.activa || !this.arrastrando) return;
    const movimientoX = evento.clientX - this.ultimaPosicionPuntero.x;
    const movimientoY = evento.clientY - this.ultimaPosicionPuntero.y;
    this.ultimaPosicionPuntero.x = evento.clientX;
    this.ultimaPosicionPuntero.y = evento.clientY;
    this.coordenadasEsfericas.theta -= movimientoX * SENSIBILIDAD_GIRO;
    this.coordenadasEsfericas.phi = THREE.MathUtils.clamp(
      this.coordenadasEsfericas.phi - movimientoY * SENSIBILIDAD_GIRO,
      0.05,
      Math.PI - 0.05
    );
  }

  _alGirarRueda(evento) {
    if (!this.activa) return;
    evento.preventDefault();
    const factor = Math.pow(FACTOR_ZOOM, Math.sign(evento.deltaY));
    this.distanciaObjetivo = THREE.MathUtils.clamp(
      this.distanciaObjetivo * factor,
      this.distanciaMinima,
      this.distanciaMaxima
    );
  }
}
