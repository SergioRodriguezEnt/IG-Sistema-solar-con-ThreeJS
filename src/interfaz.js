import GUI from "lil-gui";

const AYUDA = {
  global: [
    ["Arrastrar", "girar"],
    ["Rueda", "zoom"],
    ["Ctrl + arrastrar", "desplazar"],
    ["Clic en un astro", "seguirlo"],
    ["N", "pilotar una nave"],
  ],
  astro: [
    ["Arrastrar", "girar alrededor"],
    ["Rueda", "acercar / alejar"],
    ["Clic en otro astro", "cambiar"],
    ["M", "vista global"],
    ["N", "pilotar una nave"],
  ],
  nave: [
    ["W / S", "avanzar / retroceder"],
    ["A / D · R / F", "lateral · subir / bajar"],
    ["Flechas · Q / E", "girar · alabear"],
    ["Arrastrar", "mirar"],
    ["Mayús", "modo lento"],
    ["M", "vista global"],
    ["N", "nave nueva aquí"],
  ],
};

const TITULOS = {
  global: "Vista global",
  astro: "Siguiendo",
  nave: "Vista de nave",
};

export class Interfaz {
  constructor(parametros, { alCambiarOrbitas }) {
    this.gui = new GUI({ title: "Sistema solar" });
    this.gui
      .add(parametros, "mostrarOrbitas")
      .name("Mostrar órbitas")
      .onChange(alCambiarOrbitas);
    this.gui
      .add(parametros, "velocidad", 0, 5, 0.1)
      .name("Velocidad simulación");

    this.panel = document.getElementById("panel");
    this.titulo = document.getElementById("panel-titulo");
    this.subtitulo = document.getElementById("panel-subtitulo");
    this.ayuda = document.getElementById("panel-ayuda");
    this.etiqueta = document.getElementById("etiqueta");
  }

  mostrarVista(vista, astro = null) {
    this.titulo.textContent =
      vista === "astro" ? `${TITULOS.astro}: ${astro.nombre}` : TITULOS[vista];
    this.subtitulo.textContent =
      astro && vista === "astro" ? this._descripcion(astro) : "";
    this.subtitulo.style.display = this.subtitulo.textContent
      ? "block"
      : "none";
    this.ayuda.innerHTML = AYUDA[vista]
      .map(
        ([tecla, accion]) =>
          `<li><kbd>${tecla}</kbd><span>${accion}</span></li>`
      )
      .join("");
  }

  _descripcion(astro) {
    if (astro.tipo === "Luna") return `Luna de ${astro.padre.nombre}`;
    if (astro.tipo === "Planeta")
      return `Planeta · ${astro.hijos.length} luna${
        astro.hijos.length === 1 ? "" : "s"
      } en la escena`;
    return "Estrella";
  }

  mostrarEtiqueta(astro, x, y) {
    if (!astro) {
      this.etiqueta.style.opacity = 0;
      return;
    }
    this.etiqueta.textContent = astro.nombre;
    this.etiqueta.style.transform = `translate(${x + 14}px, ${y + 10}px)`;
    this.etiqueta.style.opacity = 1;
  }
}
