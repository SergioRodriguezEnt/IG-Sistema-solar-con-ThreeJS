import * as THREE from "three";

/*
 * Sombras calculadas en el shader (sin mapa de sombras).
 *
 * Cada superficie conoce las esferas que pueden taparle el Sol (sus "ocultadores").
 * Para cada píxel se mira cuánto del disco solar queda tapado por cada una:
 * vistos desde el píxel, el Sol y el ocultador son dos círculos en el cielo, y la
 * luz que llega es la parte del disco solar que no se solapa con el ocultador.
 * Así aparecen de forma natural la sombra central (umbra) y el borde suave (penumbra),
 * y el resultado es nítido a cualquier distancia, a diferencia de un mapa de sombras.
 *
 * Los anillos de Saturno también hacen sombra sobre el planeta: se busca dónde corta
 * el rayo hacia el Sol el plano del anillo y se consulta su mapa de transparencia.
 */

// Se añade al principio del vertex shader: posición del vértice en el mundo
const VERTEX_DECLARACIONES = `
varying vec3 vPosicionMundo;
`;

const VERTEX_POSICION_MUNDO = `
vPosicionMundo = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;
`;

const FRAGMENT_FUNCIONES = `
varying vec3 vPosicionMundo;
uniform vec3 posicionSol;
uniform float radioAngularSol;

#if NUMERO_OCULTADORES > 0
  // xyz: centro en el mundo, w: radio
  uniform vec4 ocultadores[ NUMERO_OCULTADORES ];
#endif

#ifdef SOMBRA_ANILLO
  uniform sampler2D anilloTransparencia;
  uniform vec3 anilloCentro;
  uniform vec3 anilloNormal;
  uniform vec2 anilloRadios; // interior, exterior
#endif

// Área común de dos círculos de radios radioA y radioB cuyos centros están a 'separacion'
float areaSolapeCirculos( float radioA, float radioB, float separacion ) {
  if ( separacion >= radioA + radioB ) return 0.0;
  float radioMenor = min( radioA, radioB );
  if ( separacion <= abs( radioA - radioB ) ) return PI * radioMenor * radioMenor;

  float cuadradoA = radioA * radioA;
  float cuadradoB = radioB * radioB;
  float cuadradoSeparacion = separacion * separacion;
  float anguloA = acos( clamp( ( cuadradoSeparacion + cuadradoA - cuadradoB ) / ( 2.0 * separacion * radioA ), -1.0, 1.0 ) );
  float anguloB = acos( clamp( ( cuadradoSeparacion + cuadradoB - cuadradoA ) / ( 2.0 * separacion * radioB ), -1.0, 1.0 ) );
  float areaRombo = 0.5 * sqrt( max(
    ( -separacion + radioA + radioB ) * ( separacion + radioA - radioB ) *
    ( separacion - radioA + radioB ) * ( separacion + radioA + radioB ), 0.0 ) );
  return cuadradoA * anguloA + cuadradoB * anguloB - areaRombo;
}

// Fracción de la luz del Sol que llega a este píxel (1 = sin sombra)
float luzSolarVisible() {
  vec3 direccionSol = normalize( posicionSol - vPosicionMundo );
  float areaDiscoSolar = PI * radioAngularSol * radioAngularSol;
  float luzVisible = 1.0;

  #if NUMERO_OCULTADORES > 0
    for ( int indiceOcultador = 0; indiceOcultador < NUMERO_OCULTADORES; indiceOcultador ++ ) {
      vec4 ocultador = ocultadores[ indiceOcultador ];
      vec3 haciaOcultador = ocultador.xyz - vPosicionMundo;
      float distanciaOcultador = length( haciaOcultador );
      vec3 direccionOcultador = haciaOcultador / distanciaOcultador;
      float coseno = dot( direccionOcultador, direccionSol );
      if ( coseno <= 0.0 ) continue; // el ocultador está de espaldas al Sol

      float radioAngularOcultador = asin( min( ocultador.w / distanciaOcultador, 1.0 ) );
      // atan2 es más preciso que acos para ángulos pequeños
      float separacionAngular = atan( length( cross( direccionOcultador, direccionSol ) ), coseno );
      float areaTapada = areaSolapeCirculos( radioAngularSol, radioAngularOcultador, separacionAngular );
      luzVisible *= 1.0 - areaTapada / areaDiscoSolar;
    }
  #endif

  #ifdef SOMBRA_ANILLO
    float alineacion = dot( direccionSol, anilloNormal );
    if ( abs( alineacion ) > 1e-4 ) {
      float distanciaAlPlano = dot( anilloCentro - vPosicionMundo, anilloNormal ) / alineacion;
      if ( distanciaAlPlano > 0.0 ) {
        vec3 puntoCorte = vPosicionMundo + direccionSol * distanciaAlPlano;
        float radioCorte = length( puntoCorte - anilloCentro );
        float posicionEnAnillo = ( radioCorte - anilloRadios.x ) / ( anilloRadios.y - anilloRadios.x );
        if ( posicionEnAnillo >= 0.0 && posicionEnAnillo <= 1.0 ) {
          luzVisible *= 1.0 - texture2D( anilloTransparencia, vec2( posicionEnAnillo, 0.5 ) ).g;
        }
      }
    }
  #endif

  return clamp( luzVisible, 0.0, 1.0 );
}
`;

const LUCES_CON_SOMBRA = THREE.ShaderChunk.lights_fragment_begin.replace(
  "getPointLightInfo( pointLight, geometry, directLight );",
  "getPointLightInfo( pointLight, geometry, directLight );\n\t\tdirectLight.color *= luzSolar;"
);

const posicionOcultador = new THREE.Vector3();

// Uniforms de sombra compartidos por todos los materiales de una superficie
// (por ejemplo, el cuerpo y la atmósfera de un mismo astro).
export class ReceptorSombras {
  // astrosOcultadores: astros cuya esfera puede tapar el Sol a esta superficie
  // radioAngularSol: tamaño aparente del Sol desde este sistema (radianes)
  // anillo: { malla, radioInterior, radioExterior, transparencia } si un anillo le hace sombra
  constructor(astrosOcultadores, radioAngularSol, anillo = null) {
    this.astrosOcultadores = astrosOcultadores;
    this.anillo = anillo;
    this.uniforms = {
      posicionSol: { value: new THREE.Vector3() },
      radioAngularSol: { value: radioAngularSol },
      ocultadores: { value: astrosOcultadores.map(() => new THREE.Vector4()) },
    };
    if (anillo) {
      this.uniforms.anilloTransparencia = { value: anillo.transparencia };
      this.uniforms.anilloCentro = { value: new THREE.Vector3() };
      this.uniforms.anilloNormal = { value: new THREE.Vector3() };
      this.uniforms.anilloRadios = {
        value: new THREE.Vector2(anillo.radioInterior, anillo.radioExterior),
      };
    }
  }

  get tieneSombras() {
    return this.astrosOcultadores.length > 0 || this.anillo !== null;
  }

  aplicarA(material) {
    if (!this.tieneSombras) return;
    material.defines = {
      ...(material.defines || {}),
      NUMERO_OCULTADORES: this.astrosOcultadores.length,
    };
    if (this.anillo) material.defines.SOMBRA_ANILLO = "";

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\n" + VERTEX_DECLARACIONES
        )
        .replace(
          "#include <project_vertex>",
          "#include <project_vertex>\n" + VERTEX_POSICION_MUNDO
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\n" + FRAGMENT_FUNCIONES
        )
        .replace(
          "#include <lights_fragment_begin>",
          "float luzSolar = luzSolarVisible();\n" + LUCES_CON_SOMBRA
        );
    };
    material.needsUpdate = true;
  }

  actualizar(posicionSol) {
    if (!this.tieneSombras) return;
    this.uniforms.posicionSol.value.copy(posicionSol);
    this.astrosOcultadores.forEach((astro, indice) => {
      astro.posicionMundo(posicionOcultador);
      this.uniforms.ocultadores.value[indice].set(
        posicionOcultador.x,
        posicionOcultador.y,
        posicionOcultador.z,
        astro.radio
      );
    });
    if (this.anillo) {
      const malla = this.anillo.malla;
      malla.getWorldPosition(this.uniforms.anilloCentro.value);
      this.uniforms.anilloNormal.value
        .set(0, 0, 1)
        .transformDirection(malla.matrixWorld);
    }
  }
}
