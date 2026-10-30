
const dias = document.getElementById("dias");
const mesAnio = document.getElementById("mes-anio");
const formulario = document.getElementById("form-evento");
const lista = document.getElementById("lista");

const fotoCamara = document.getElementById("foto-camara");
const fotoArchivo = document.getElementById("foto-archivo");
const vistaFoto = document.getElementById("vista-foto");

let imagenEvento = "";

function procesarFoto(archivo) {
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
        alert("Selecciona un archivo de imagen.");
        return;
    }

    const lector = new FileReader();

    lector.onload = function () {
        const imagen = new Image();

        imagen.onload = function () {
            const maximo = 1000;
            const escala = Math.min(
                1,
                maximo / Math.max(imagen.width, imagen.height)
            );

            const canvas = document.createElement("canvas");
            canvas.width = Math.round(imagen.width * escala);
            canvas.height = Math.round(imagen.height * escala);

            const contexto = canvas.getContext("2d");
            contexto.drawImage(
                imagen, 0, 0, canvas.width, canvas.height
            );

            imagenEvento = canvas.toDataURL("image/jpeg", 0.7);

            vistaFoto.src = imagenEvento;
            vistaFoto.style.display = "block";
        };

        imagen.onerror = function () {
            alert("No se pudo abrir esa imagen. Prueba con otra.");
        };

        imagen.src = lector.result;
    };

    lector.onerror = function () {
        alert("No se pudo leer el archivo.");
    };

    lector.readAsDataURL(archivo);
}

fotoCamara.addEventListener("change", function () {
    if (this.files[0]) {
        fotoArchivo.value = "";
        procesarFoto(this.files[0]);
    }
});

fotoArchivo.addEventListener("change", function () {
    if (this.files[0]) {
        fotoCamara.value = "";
        procesarFoto(this.files[0]);
    }
});


let fechaActual = new Date();

let eventos = JSON.parse(
    localStorage.getItem("eventosEscolares") || "[]"
);

const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function guardarEventos() {
    localStorage.setItem(
        "eventosEscolares",
        JSON.stringify(eventos)
    );
}

function mostrarCalendario() {
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    mesAnio.textContent = `${nombresMeses[mes]} ${anio}`;
    dias.innerHTML = "";

    const primerDia = new Date(anio, mes, 1);
    const desplazamiento = (primerDia.getDay() + 6) % 7;
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    for (let i = 0; i < desplazamiento; i++) {
        dias.appendChild(document.createElement("div"));
    }

    for (let numero = 1; numero <= totalDias; numero++) {
        const celda = document.createElement("div");
        celda.className = "dia";

        const fecha = [
            anio,
            String(mes + 1).padStart(2, "0"),
            String(numero).padStart(2, "0")
        ].join("-");

        const numeroDia = document.createElement("strong");
        numeroDia.textContent = numero;
        celda.appendChild(numeroDia);

        const hoy = new Date();
        if (
            numero === hoy.getDate() &&
            mes === hoy.getMonth() &&
            anio === hoy.getFullYear()
        ) {
            celda.classList.add("hoy");
        }

        eventos.filter(e => e.fecha === fecha).forEach(e => {
            const etiqueta = document.createElement("div");
            etiqueta.className = "evento-mini";
            etiqueta.textContent = e.titulo;
            celda.appendChild(etiqueta);
        });

        dias.appendChild(celda);
    }
}


function mostrarEventos() {
    lista.innerHTML = "";

    const ordenados = eventos
        .map((evento, indice) => ({ evento, indice }))
        .sort((a, b) =>
            (a.evento.fecha + a.evento.hora).localeCompare(
                b.evento.fecha + b.evento.hora
            )
        );

    if (ordenados.length === 0) {
        lista.textContent = "Todavía no hay eventos registrados.";
        return;
    }

    ordenados.forEach(({ evento: e, indice }) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "evento-card";

        const titulo = document.createElement("h3");
        titulo.textContent = e.titulo;

        const detalles = document.createElement("p");
        detalles.textContent =
            `${e.fecha} · ${e.hora} · ${e.categoria}`;

        const descripcion = document.createElement("p");
        descripcion.textContent = e.descripcion || "";

        
        let fotoTarjeta = null;

        if (e.imagen) {
        fotoTarjeta = document.createElement("img");
        fotoTarjeta.src = e.imagen;
        fotoTarjeta.alt = "Foto del evento: " + e.titulo;
        fotoTarjeta.className = "foto-evento";
}


        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "🗑️ Eliminar evento";
        botonEliminar.className = "btn-eliminar";

        botonEliminar.addEventListener("click", () => {
            const confirmar = confirm(
                `¿Quieres eliminar el evento "${e.titulo}"?`
            );

            if (confirmar) {
                eventos.splice(indice, 1);
                guardarEventos();
                mostrarCalendario();
                mostrarEventos();
            }
        });

        tarjeta.append(titulo, detalles, descripcion);

        if (fotoTarjeta) {
    tarjeta.appendChild(fotoTarjeta);
}

    tarjeta.appendChild(botonEliminar);
        lista.appendChild(tarjeta);
    });
}


document.getElementById("anterior").addEventListener("click", () => {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    mostrarCalendario();
});

document.getElementById("siguiente").addEventListener("click", () => {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    mostrarCalendario();
});

formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const evento = {
        titulo: document.getElementById("titulo").value.trim(),
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        categoria: document.getElementById("categoria").value,
        descripcion: document.getElementById("descripcion").value.trim(),
        imagen: imagenEvento
    };

    if (!evento.titulo || !evento.fecha || !evento.hora) {
        return;
    }

    eventos.push(evento);
    guardarEventos();

    fechaActual = new Date(evento.fecha + "T12:00:00");

    mostrarCalendario();
    mostrarEventos();
    formulario.reset();


    imagenEvento = "";
    vistaFoto.src = "";
    vistaFoto.style.display = "none";

    fotoCamara.value = "";
    fotoArchivo.value = "";
});

mostrarCalendario();
mostrarEventos();



function mostrarAviso(mensaje) {
    let aviso = document.getElementById("aviso-evento");

    if (!aviso) {
        aviso = document.createElement("div");
        aviso.id = "aviso-evento";

        aviso.style.backgroundColor = "#dff3ff";
        aviso.style.color = "#24516b";
        aviso.style.padding = "15px";
        aviso.style.margin = "15px";
        aviso.style.borderRadius = "12px";
        aviso.style.border = "2px solid #a8dcf5";

        document.body.prepend(aviso);
    }

    aviso.textContent = "📢 " + mensaje;

    const boton = document.createElement("button");
    boton.textContent = "✖";
    boton.style.marginLeft = "12px";
    boton.addEventListener("click", cerrarAviso);

    aviso.appendChild(boton);
}

function cerrarAviso() {
    const aviso = document.getElementById("aviso-evento");

    if (aviso) {
        aviso.remove();
    }
}

function revisarEventosProximos() {
    const ahora = new Date();

    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);

    const fechaManana = [
        manana.getFullYear(),
        String(manana.getMonth() + 1).padStart(2, "0"),
        String(manana.getDate()).padStart(2, "0")
    ].join("-");

    const proximos = eventos.filter(
        evento => evento.fecha === fechaManana
    );

    if (proximos.length > 0) {
        const nombres = proximos
            .map(evento => evento.titulo)
            .join(", ");

        mostrarAviso(
            "¡Mañana tienes un evento escolar! " + nombres
        );
    }
}

revisarEventosProximos();
