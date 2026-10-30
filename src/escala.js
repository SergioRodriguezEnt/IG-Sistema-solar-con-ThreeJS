const RADIO_TIERRA_KM = 6371;
const RADIO_VISUAL_MINIMO = 0.22;

const RADIO_ANGULAR_SOL_1UA = 0.00465;
const AUMENTO_PENUMBRA = 4;

export function radioVisual(radioKm) {
  return Math.max(
    RADIO_VISUAL_MINIMO,
    2 * Math.pow(radioKm / RADIO_TIERRA_KM, 0.55)
  );
}

export function distanciaPlaneta(distanciaUA) {
  return 40 + 85 * Math.pow(distanciaUA, 0.75);
}

export function distanciaLuna(
  semiejeMayorKm,
  radioPlanetaKm,
  radioPlanetaVisual
) {
  return (
    radioPlanetaVisual *
    (1.4 + 0.5 * Math.sqrt(semiejeMayorKm / radioPlanetaKm))
  );
}

export function periodoOrbitalVisual(dias) {
  return 20 * Math.pow(dias / 365.25, 0.35);
}

export function periodoRotacionVisual(dias) {
  return 10 * Math.pow(Math.abs(dias), 0.5);
}

export function excentricidadVisual(excentricidad) {
  return Math.min(excentricidad * 1.6, 0.22);
}

export function inclinacionVisual(grados) {
  return grados < 90 ? grados * 1.5 : grados;
}

export function radioAngularSolVisual(distanciaUA) {
  return (RADIO_ANGULAR_SOL_1UA * AUMENTO_PENUMBRA) / distanciaUA;
}
