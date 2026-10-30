// Datos reales del sistema solar (NASA/JPL, elementos orbitales J2000).
// El árbol reproduce la jerarquía física: cada astro cuelga de aquel al que orbita.
//
// orbita.semiejeMayor        UA para planetas, km para lunas
// orbita.excentricidad       0 = circunferencia
// orbita.inclinacion         (º) respecto a la eclíptica (planetas) o al ecuador del planeta (lunas)
// orbita.nodoAscendente      longitud del nodo ascendente (º)
// orbita.argumentoPeriapsis  ángulo del punto más cercano al padre (º)
// orbita.periodo             periodo orbital (días)
// orbita.fase                posición inicial en la órbita (º)
// rotacion.periodo   periodo de rotación sideral (días)
// rotacion.eje       inclinación del eje (º). Más de 90º = rotación retrógrada (Venus, Urano)
// rotacion.acoplada  rotación síncrona: siempre muestra la misma cara a su planeta
// atmosfera.factorRotacion  vueltas de la capa atmosférica por cada vuelta del astro

import {
  radioVisual,
  distanciaPlaneta,
  distanciaLuna,
  periodoOrbitalVisual,
  periodoRotacionVisual,
  excentricidadVisual,
  inclinacionVisual,
  radioAngularSolVisual,
} from "./escala";

export const SISTEMA_SOLAR = {
  nombre: "Sol",
  id: "sol",
  tipo: "Estrella",
  radioKm: 696340,
  emisivo: true,
  luz: true,
  rotacion: { periodo: 25.4, eje: 7.25 },
  atmosfera: { escala: 1.03, factorRotacion: 0.6, aditiva: true },
  bumpEscala: 0,
  hijos: [
    {
      nombre: "Mercurio",
      id: "mercurio",
      tipo: "Planeta",
      radioKm: 2440,
      color: 0xb5b0a8,
      orbita: {
        semiejeMayor: 0.387,
        excentricidad: 0.2056,
        inclinacion: 7.0,
        nodoAscendente: 48.3,
        argumentoPeriapsis: 29.1,
        periodo: 87.97,
        fase: 252,
      },
      rotacion: { periodo: 58.65, eje: 0.03 },
    },
    {
      nombre: "Venus",
      id: "venus",
      tipo: "Planeta",
      radioKm: 6052,
      color: 0xe6c27a,
      orbita: {
        semiejeMayor: 0.723,
        excentricidad: 0.0068,
        inclinacion: 3.39,
        nodoAscendente: 76.7,
        argumentoPeriapsis: 54.9,
        periodo: 224.7,
        fase: 182,
      },
      rotacion: { periodo: 243.0, eje: 177.4 },
      atmosfera: { escala: 1.025, factorRotacion: 60 },
    },
    {
      nombre: "Tierra",
      id: "tierra",
      tipo: "Planeta",
      radioKm: 6371,
      color: 0x5b9bff,
      orbita: {
        semiejeMayor: 1.0,
        excentricidad: 0.0167,
        inclinacion: 0.0,
        nodoAscendente: 0,
        argumentoPeriapsis: 114.2,
        periodo: 365.26,
        fase: 100,
      },
      rotacion: { periodo: 0.997, eje: 23.44 },
      atmosfera: { escala: 1.015, factorRotacion: 1.2 },
      especular: true,
      hijos: [
        {
          nombre: "Luna",
          id: "luna",
          tipo: "Luna",
          radioKm: 1737,
          color: 0xcccccc,
          bumpEscala: 0.25,
          enEcuador: false,
          orbita: {
            semiejeMayor: 384400,
            excentricidad: 0.0549,
            inclinacion: 5.145,
            nodoAscendente: 125,
            argumentoPeriapsis: 318,
            periodo: 27.32,
            fase: 30,
          },
          rotacion: { acoplada: true },
        },
      ],
    },
    {
      nombre: "Marte",
      id: "marte",
      tipo: "Planeta",
      radioKm: 3390,
      color: 0xd9734a,
      orbita: {
        semiejeMayor: 1.524,
        excentricidad: 0.0934,
        inclinacion: 1.85,
        nodoAscendente: 49.6,
        argumentoPeriapsis: 286.5,
        periodo: 686.98,
        fase: 355,
      },
      rotacion: { periodo: 1.026, eje: 25.19 },
      atmosfera: { escala: 1.012, factorRotacion: 1.1 },
      hijos: [
        {
          nombre: "Fobos",
          id: "fobos",
          tipo: "Luna",
          radioKm: 11.3,
          color: 0xa09080,
          orbita: {
            semiejeMayor: 9376,
            excentricidad: 0.0151,
            inclinacion: 1.09,
            nodoAscendente: 0,
            argumentoPeriapsis: 150,
            periodo: 0.3189,
            fase: 0,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Deimos",
          id: "deimos",
          tipo: "Luna",
          radioKm: 6.2,
          color: 0xb0a090,
          orbita: {
            semiejeMayor: 23463,
            excentricidad: 0.0003,
            inclinacion: 0.93,
            nodoAscendente: 80,
            argumentoPeriapsis: 260,
            periodo: 1.263,
            fase: 140,
          },
          rotacion: { acoplada: true },
        },
      ],
    },
    {
      nombre: "Júpiter",
      id: "jupiter",
      tipo: "Planeta",
      radioKm: 69911,
      color: 0xd8b48c,
      orbita: {
        semiejeMayor: 5.203,
        excentricidad: 0.0489,
        inclinacion: 1.3,
        nodoAscendente: 100.5,
        argumentoPeriapsis: 273.9,
        periodo: 4332.6,
        fase: 34,
      },
      rotacion: { periodo: 0.4135, eje: 3.13 },
      atmosfera: { escala: 1.01, factorRotacion: 1.05 },
      bumpEscala: 0.04,
      hijos: [
        {
          nombre: "Ío",
          id: "io",
          tipo: "Luna",
          radioKm: 1821.6,
          color: 0xe8d36a,
          orbita: {
            semiejeMayor: 421700,
            excentricidad: 0.0041,
            inclinacion: 0.05,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 1.769,
            fase: 0,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Europa",
          id: "europa",
          tipo: "Luna",
          radioKm: 1560.8,
          color: 0xd9cbb0,
          orbita: {
            semiejeMayor: 671034,
            excentricidad: 0.009,
            inclinacion: 0.47,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 3.551,
            fase: 90,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Ganímedes",
          id: "ganimedes",
          tipo: "Luna",
          radioKm: 2634.1,
          color: 0xa89c8c,
          orbita: {
            semiejeMayor: 1070412,
            excentricidad: 0.0013,
            inclinacion: 0.2,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 7.155,
            fase: 200,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Calisto",
          id: "calisto",
          tipo: "Luna",
          radioKm: 2410.3,
          color: 0x7d7468,
          orbita: {
            semiejeMayor: 1882709,
            excentricidad: 0.0074,
            inclinacion: 0.19,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 16.689,
            fase: 300,
          },
          rotacion: { acoplada: true },
        },
      ],
    },
    {
      nombre: "Saturno",
      id: "saturno",
      tipo: "Planeta",
      radioKm: 58232,
      color: 0xe3cf9a,
      orbita: {
        semiejeMayor: 9.537,
        excentricidad: 0.0565,
        inclinacion: 2.49,
        nodoAscendente: 113.7,
        argumentoPeriapsis: 339.4,
        periodo: 10759,
        fase: 50,
      },
      rotacion: { periodo: 0.444, eje: 26.73 },
      atmosfera: { escala: 1.01, factorRotacion: 1.05 },
      bumpEscala: 0.04,
      anillo: { interior: 1.24, exterior: 2.27 },
      hijos: [
        {
          nombre: "Encélado",
          id: "encelado",
          tipo: "Luna",
          radioKm: 252.1,
          color: 0xf2f2f2,
          orbita: {
            semiejeMayor: 237948,
            excentricidad: 0.0047,
            inclinacion: 0.02,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 1.37,
            fase: 0,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Rea",
          id: "rea",
          tipo: "Luna",
          radioKm: 763.8,
          color: 0xcfcac2,
          orbita: {
            semiejeMayor: 527108,
            excentricidad: 0.001,
            inclinacion: 0.35,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 4.518,
            fase: 120,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Titán",
          id: "titan",
          tipo: "Luna",
          radioKm: 2574.7,
          color: 0xe0a85a,
          orbita: {
            semiejeMayor: 1221870,
            excentricidad: 0.0288,
            inclinacion: 0.35,
            nodoAscendente: 0,
            argumentoPeriapsis: 180,
            periodo: 15.945,
            fase: 240,
          },
          rotacion: { acoplada: true },
          atmosfera: { escala: 1.05, factorRotacion: 1.0 },
        },
      ],
    },
    {
      nombre: "Urano",
      id: "urano",
      tipo: "Planeta",
      radioKm: 25362,
      color: 0x9fdbe3,
      orbita: {
        semiejeMayor: 19.19,
        excentricidad: 0.0457,
        inclinacion: 0.77,
        nodoAscendente: 74.0,
        argumentoPeriapsis: 96.9,
        periodo: 30687,
        fase: 314,
      },
      rotacion: { periodo: 0.718, eje: 97.77 },
      atmosfera: { escala: 1.012, factorRotacion: 1.05 },
      bumpEscala: 0.015,
      hijos: [
        {
          nombre: "Miranda",
          id: "miranda",
          tipo: "Luna",
          radioKm: 235.8,
          color: 0xb8b8b8,
          orbita: {
            semiejeMayor: 129390,
            excentricidad: 0.0013,
            inclinacion: 4.23,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 1.413,
            fase: 60,
          },
          rotacion: { acoplada: true },
        },
        {
          nombre: "Titania",
          id: "titania",
          tipo: "Luna",
          radioKm: 788.4,
          color: 0xb0a8a0,
          orbita: {
            semiejeMayor: 435910,
            excentricidad: 0.0011,
            inclinacion: 0.34,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 8.706,
            fase: 210,
          },
          rotacion: { acoplada: true },
        },
      ],
    },
    {
      nombre: "Neptuno",
      id: "neptuno",
      tipo: "Planeta",
      radioKm: 24622,
      color: 0x5b7bff,
      orbita: {
        semiejeMayor: 30.07,
        excentricidad: 0.0113,
        inclinacion: 1.77,
        nodoAscendente: 131.8,
        argumentoPeriapsis: 273.2,
        periodo: 60190,
        fase: 304,
      },
      rotacion: { periodo: 0.671, eje: 28.32 },
      atmosfera: { escala: 1.012, factorRotacion: 1.05 },
      bumpEscala: 0.015,
      hijos: [
        {
          nombre: "Tritón",
          id: "triton",
          tipo: "Luna",
          radioKm: 1353.4,
          color: 0xd8c8c0,
          orbita: {
            semiejeMayor: 354759,
            excentricidad: 0.00002,
            inclinacion: 156.9,
            nodoAscendente: 0,
            argumentoPeriapsis: 0,
            periodo: 5.877,
            fase: 0,
          },
          rotacion: { acoplada: true },
          atmosfera: { escala: 1.02, factorRotacion: 1.0 },
        },
      ],
    },
  ],
};

const valorPorDefecto = (valor, porDefecto) =>
  valor === undefined || valor === null ? porDefecto : valor;

export function parametrosVisuales(datosAstro, datosPadre = null) {
  const radio = radioVisual(datosAstro.radioKm);
  const esLuna = datosPadre !== null && datosPadre.tipo !== "Estrella";
  let orbita = null;

  if (datosAstro.orbita) {
    const orbitaReal = datosAstro.orbita;
    const semiejeMayor = esLuna
      ? distanciaLuna(
          orbitaReal.semiejeMayor,
          datosPadre.radioKm,
          radioVisual(datosPadre.radioKm)
        )
      : distanciaPlaneta(orbitaReal.semiejeMayor);
    orbita = {
      semiejeMayor,
      excentricidad: excentricidadVisual(orbitaReal.excentricidad),
      inclinacion: inclinacionVisual(orbitaReal.inclinacion),
      nodoAscendente: orbitaReal.nodoAscendente,
      argumentoPeriapsis: orbitaReal.argumentoPeriapsis,
      periodo: periodoOrbitalVisual(orbitaReal.periodo),
      fase: orbitaReal.fase,
    };
  }

  const rotacionReal = datosAstro.rotacion || {};
  const rotacion = {
    periodo:
      rotacionReal.acoplada && orbita
        ? orbita.periodo
        : periodoRotacionVisual(valorPorDefecto(rotacionReal.periodo, 1)),
    eje: valorPorDefecto(rotacionReal.eje, 0),
    acoplada: !!rotacionReal.acoplada,
  };

  let radioAngularSol = 0;
  if (datosAstro.orbita) {
    const distanciaAlSolUA = esLuna
      ? datosPadre.orbita.semiejeMayor
      : datosAstro.orbita.semiejeMayor;
    radioAngularSol = radioAngularSolVisual(distanciaAlSolUA);
  }

  return {
    id: datosAstro.id,
    nombre: datosAstro.nombre,
    tipo: datosAstro.tipo,
    radio,
    orbita,
    rotacion,
    radioAngularSol,
    color: valorPorDefecto(datosAstro.color, 0xffffff),
    emisivo: !!datosAstro.emisivo,
    luz: !!datosAstro.luz,
    especular: !!datosAstro.especular,
    bumpEscala: valorPorDefecto(
      datosAstro.bumpEscala,
      datosAstro.tipo === "Luna" ? 0.12 : 0.15
    ),
    enEcuador: valorPorDefecto(datosAstro.enEcuador, true),
    anillo: valorPorDefecto(datosAstro.anillo, null),
    atmosfera: {
      escala: 1.015,
      factorRotacion: 1.0,
      aditiva: false,
      ...(datosAstro.atmosfera || {}),
    },
  };
}
