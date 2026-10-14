
const dias = document.getElementById("dias");
const mesAnio = document.getElementById("mes-anio");
const formulario = document.getElementById("form-evento");
const lista = document.getElementById("lista");

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

        tarjeta.append(titulo, detalles, descripcion, botonEliminar);
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
        descripcion: document.getElementById("descripcion").value.trim()
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
});

mostrarCalendario();
mostrarEventos();
