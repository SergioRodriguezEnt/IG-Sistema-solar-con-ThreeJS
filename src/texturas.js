import * as THREE from "three";
import { RUTAS, RUTA_FONDO, RUTA_NAVE } from "./rutasTexturas";

const cargador = new THREE.TextureLoader();
const texturasCargadas = new Map();

function cargar(ruta, esColor) {
  if (!ruta) return null;
  if (!texturasCargadas.has(ruta)) {
    const textura = cargador.load(ruta);
    if (esColor) textura.colorSpace = THREE.SRGBColorSpace;
    textura.anisotropy = 4;
    texturasCargadas.set(ruta, textura);
  }
  return texturasCargadas.get(ruta);
}

export function texturasAstro(idAstro) {
  const rutasAstro = RUTAS[idAstro];
  if (!rutasAstro)
    throw new Error(`No hay texturas para el astro "${idAstro}"`);
  return {
    color: cargar(rutasAstro.color, true),
    relieve: cargar(rutasAstro.relieve, false),
    atmosfera: cargar(rutasAstro.atmosfera, true),
    atmosferaAlfa: cargar(rutasAstro.atmosferaAlfa, false),
    especular: cargar(rutasAstro.especular, false),
    anilloColor: cargar(rutasAstro.anilloColor, true),
    anilloAlfa: cargar(rutasAstro.anilloAlfa, false),
  };
}

export function texturaFondo() {
  const textura = cargar(RUTA_FONDO, true);
  textura.mapping = THREE.EquirectangularReflectionMapping;
  return textura;
}

export function texturaNave() {
  return cargar(RUTA_NAVE, true);
}
