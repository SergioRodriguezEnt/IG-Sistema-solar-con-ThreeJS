import * as THREE from "three";

const TOLERANCIA_PX = 12;

const raycaster = new THREE.Raycaster();
const punteroNormalizado = new THREE.Vector2();
const centroProyectado = new THREE.Vector3();
const bordeProyectado = new THREE.Vector3();
const derechaCamara = new THREE.Vector3();

export function astroBajoPuntero(evento, lienzo, camara, astros) {
  const rectanguloLienzo = lienzo.getBoundingClientRect();
  const punteroX = evento.clientX - rectanguloLienzo.left;
  const punteroY = evento.clientY - rectanguloLienzo.top;
  punteroNormalizado.set(
    (punteroX / rectanguloLienzo.width) * 2 - 1,
    -(punteroY / rectanguloLienzo.height) * 2 + 1
  );

  raycaster.setFromCamera(punteroNormalizado, camara);
  const cuerpos = astros.map((astro) => astro.cuerpo);
  const primerImpacto = raycaster.intersectObjects(cuerpos, false)[0];
  if (primerImpacto) return primerImpacto.object.userData.astro;

  derechaCamara.set(1, 0, 0).applyQuaternion(camara.quaternion);
  let astroMasCercano = null;
  let menorDistancia = Infinity;
  for (const astro of astros) {
    astro.posicionMundo(centroProyectado);
    bordeProyectado
      .copy(centroProyectado)
      .addScaledVector(derechaCamara, astro.radio);
    centroProyectado.project(camara);
    if (centroProyectado.z > 1) continue;
    bordeProyectado.project(camara);

    const centroX = ((centroProyectado.x + 1) / 2) * rectanguloLienzo.width;
    const centroY = ((1 - centroProyectado.y) / 2) * rectanguloLienzo.height;
    const radioPx = Math.abs(
      ((bordeProyectado.x - centroProyectado.x) / 2) * rectanguloLienzo.width
    );
    const distanciaAlDisco =
      Math.hypot(centroX - punteroX, centroY - punteroY) - radioPx;
    if (distanciaAlDisco < TOLERANCIA_PX && distanciaAlDisco < menorDistancia) {
      astroMasCercano = astro;
      menorDistancia = distanciaAlDisco;
    }
  }
  return astroMasCercano;
}
