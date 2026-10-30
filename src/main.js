import * as THREE from "three";
import { Astro } from "./Astro";
import { SISTEMA_SOLAR, parametrosVisuales } from "./datos";
import { texturasAstro, texturaFondo } from "./texturas";
import { VistaGlobal } from "./vistas/VistaGlobal";
import { VistaAstro } from "./vistas/VistaAstro";
import { VistaNave } from "./vistas/VistaNave";
import { astroBajoPuntero } from "./seleccion";
import { Interfaz } from "./interfaz";

const FACTOR_TIEMPO_SIMULACION = 0.1;
const TOLERANCIA_CLIC_PX = 5;

const parametros = { mostrarOrbitas: true, velocidad: 1 };

let escena, renderer, camara, reloj;
let sol;
const astros = [];
let vistaGlobal, vistaAstro, vistaNave;
let vistaActiva = "global";
let interfaz;
let tiempoSimulacion = 0;
const posicionSol = new THREE.Vector3();

init();
bucle();

function init() {
  escena = new THREE.Scene();
  escena.background = texturaFondo();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("app").appendChild(renderer.domElement);

  escena.add(new THREE.AmbientLight(0xffffff, 0.03));

  sol = construirAstro(SISTEMA_SOLAR, null);
  escena.add(sol.planoOrbital);
  sol.recorrer((astro) => astros.push(astro));
  sol.configurarSombras();

  camara = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.05,
    6000
  );
  vistaGlobal = new VistaGlobal(camara, renderer.domElement);
  vistaAstro = new VistaAstro(camara, renderer.domElement);
  vistaNave = new VistaNave(escena, renderer.domElement, camara.aspect);

  interfaz = new Interfaz(parametros, {
    alCambiarOrbitas: (visibles) =>
      astros.forEach(
        (astro) => astro.lineaOrbita && (astro.lineaOrbita.visible = visibles)
      ),
  });

  const posicionInicial = new THREE.Vector3(0, 170, 300);
  const orientacionInicial = new THREE.PerspectiveCamera();
  orientacionInicial.position.copy(posicionInicial);
  orientacionInicial.lookAt(0, 0, 0);
  vistaGlobal.activar(
    posicionInicial,
    orientacionInicial.quaternion,
    posicionInicial.length()
  );
  interfaz.mostrarVista("global");

  reloj = new THREE.Clock();
  registrarEventos();
}

function construirAstro(datosAstro, datosPadre) {
  const astro = new Astro(
    parametrosVisuales(datosAstro, datosPadre),
    texturasAstro(datosAstro.id)
  );
  for (const datosHijo of datosAstro.hijos || []) {
    astro.agregarHijo(construirAstro(datosHijo, datosAstro));
  }
  return astro;
}

function camaraActiva() {
  return vistaActiva === "nave" ? vistaNave.camara : camara;
}

function poseCamaraActiva() {
  const camaraActual = camaraActiva();
  return {
    posicion: camaraActual.getWorldPosition(new THREE.Vector3()),
    cuaternion: camaraActual.getWorldQuaternion(new THREE.Quaternion()),
  };
}

function salirDeVista() {
  if (vistaActiva === "global") vistaGlobal.desactivar();
  if (vistaActiva === "astro") vistaAstro.desactivar();
  if (vistaActiva === "nave") vistaNave.desactivar();
}

function irAVistaGlobal() {
  if (vistaActiva === "global") return;
  const { posicion, cuaternion } = poseCamaraActiva();
  const distanciaPuntoGiro =
    vistaActiva === "astro"
      ? posicion.distanceTo(vistaAstro.astro.posicionMundo())
      : 40;
  salirDeVista();
  vistaActiva = "global";
  vistaGlobal.activar(posicion, cuaternion, distanciaPuntoGiro);
  interfaz.mostrarVista("global");
}

function irAVistaAstro(astro) {
  if (vistaActiva === "nave") return;
  salirDeVista();
  vistaActiva = "astro";
  vistaAstro.activar(astro);
  interfaz.mostrarVista("astro", astro);
}

function irAVistaNave() {
  const { posicion, cuaternion } = poseCamaraActiva();
  salirDeVista();
  vistaActiva = "nave";
  vistaNave.crear(posicion, cuaternion);
  interfaz.mostrarVista("nave");
}

function registrarEventos() {
  const lienzo = renderer.domElement;

  window.addEventListener("keydown", (evento) => {
    if (evento.target.tagName === "INPUT") return;
    if (evento.code === "KeyN") irAVistaNave();
    if (evento.code === "KeyM") irAVistaGlobal();
  });

  let inicioPulsacion = null;
  lienzo.addEventListener("pointerdown", (evento) => {
    inicioPulsacion = { x: evento.clientX, y: evento.clientY };
  });
  lienzo.addEventListener("pointerup", (evento) => {
    if (!inicioPulsacion || evento.button !== 0) return;
    const distanciaArrastre = Math.hypot(
      evento.clientX - inicioPulsacion.x,
      evento.clientY - inicioPulsacion.y
    );
    inicioPulsacion = null;
    if (distanciaArrastre > TOLERANCIA_CLIC_PX || vistaActiva === "nave")
      return;
    const astro = astroBajoPuntero(evento, lienzo, camara, astros);
    const yaSeSigue = vistaActiva === "astro" && astro === vistaAstro.astro;
    if (astro && !yaSeSigue) irAVistaAstro(astro);
  });

  lienzo.addEventListener("pointermove", (evento) => {
    if (vistaActiva === "nave" || evento.buttons) {
      interfaz.mostrarEtiqueta(null);
      return;
    }
    const astro = astroBajoPuntero(evento, lienzo, camara, astros);
    interfaz.mostrarEtiqueta(astro, evento.clientX, evento.clientY);
    lienzo.style.cursor = astro ? "pointer" : "";
  });
  lienzo.addEventListener("pointerleave", () => interfaz.mostrarEtiqueta(null));

  window.addEventListener("resize", () => {
    const aspecto = window.innerWidth / window.innerHeight;
    for (const camaraVista of [camara, vistaNave.camara]) {
      camaraVista.aspect = aspecto;
      camaraVista.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function bucle() {
  requestAnimationFrame(bucle);
  const dt = Math.min(reloj.getDelta(), 0.1);
  tiempoSimulacion += dt * parametros.velocidad * FACTOR_TIEMPO_SIMULACION;

  sol.actualizar(tiempoSimulacion);
  escena.updateMatrixWorld();
  sol.actualizarSombras(sol.posicionMundo(posicionSol));

  if (vistaActiva === "global") vistaGlobal.actualizar(dt);
  if (vistaActiva === "astro") vistaAstro.actualizar(dt);
  if (vistaActiva === "nave") vistaNave.actualizar(dt);

  renderer.render(escena, camaraActiva());
}

window.sistemaSolar = {
  astros,
  irAVistaAstro: (nombre) =>
    irAVistaAstro(
      astros.find((astro) => astro.nombre === nombre || astro.id === nombre)
    ),
  irAVistaGlobal,
  irAVistaNave,
  get vista() {
    return vistaActiva;
  },
  get camara() {
    return camaraActiva();
  },
  parametros,
  setTiempo: (tiempo) => (tiempoSimulacion = tiempo),
};
