const numeroFichasSelect = document.getElementById("numeroFichas");
const oponenteSelect = document.getElementById("oponente");
const empezarPartidaBtn = document.getElementById("empezarPartida");
const tablero = document.getElementById("tablero");
const mensaje = document.getElementById("mensaje");
const mensajeTurno = document.getElementById("mensajeTurno");
const estadisticasContainer = document.getElementById("estadisticas");
const tiempoPartidaContainer = document.getElementById("tiempoPartida");
const tiempoTurnoContainer = document.getElementById("tiempoTurno");
const reiniciarStatsBtn = document.getElementById("reiniciarStats");
const reiniciarPaginaBtn = document.getElementById("reiniciarPagina");
const combinacionesGanadoras = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];


let jugador1 = "X";
let jugador2 = "O";
let estadoTablero = ["", "", "", "", "", "", "", "", ""];
let juegoActivo = false;
let tiempoPartida = 180; // 3 minutos en segundos
let tiempoTurno = 30; // 30 segundos en segundos
let tiempoRestantePartida;
let tiempoRestanteTurno;
let turnoJugador = true; // Indica si es el turno del jugador1 (true) o jugador2 (false)
let intervaloTurno;
let intervaloPartida;
let intervalIA;
let contadorVictoriasJugador1 = 0;
let contadorVictoriasJugador2 = 0;
let contadorEmpates = 0;
let turnoIA;
let movimientosRealizados = 0;
let fichaEliminada = false;

// Manejador de eventos para el botón de empezar partida
empezarPartidaBtn.addEventListener("click", iniciarPartida);
reiniciarStatsBtn.addEventListener("click", reiniciarEstadisticas);


// Función para iniciar la partida
function iniciarPartida() {
    movimientosRealizados=0;
    turnoIA = false;
    juegoActivo = true;
    estadoTablero = ["", "", "", "", "", "", "", "", ""];
    limpiarTablero();


    // Mostrar el tablero y activar la interactividad
    tablero.classList.remove("oculto");
    tablero.addEventListener("click", manejarClick);
    reiniciarCuentasAtras();
    reiniciarCuentaAtrasTurno();
    iniciarCuentaAtrasPartida();

    // Desactivar los controles de modos de juego
   
}

// Función para limpiar el tablero
function limpiarTablero() {
    tablero.innerHTML = "";
    // Crea las casillas del tablero según la cantidad de fichas
    for (let i = 0; i < estadoTablero.length; i++) {
        const casilla = document.createElement("div");
        casilla.classList.add("casilla");
        casilla.dataset.index = i;
        tablero.appendChild(casilla);
    }
}

// Función para reiniciar cuentas atrás
function reiniciarCuentasAtras() {
    clearInterval(tiempoRestantePartida);
    clearInterval(tiempoRestanteTurno);
    tiempoRestantePartida = tiempoPartida;
    tiempoRestanteTurno = tiempoTurno;
    mostrarTiempoRestantePartida();
    mostrarTiempoRestanteTurno();
}

// Funciones para mostrar el tiempo restante
function mostrarTiempoRestantePartida() {
    tiempoPartidaContainer.textContent = `Tiempo restante de la partida: ${formatTime(tiempoRestantePartida)}`;
}

function mostrarTiempoRestanteTurno() {
    tiempoTurnoContainer.textContent = `Tiempo restante del turno: ${formatTime(tiempoRestanteTurno)}`;
}

// Función para manejar clics en el tablero
function manejarClick(event) {
    const numeroFichas = parseInt(numeroFichasSelect.value);
    const oponente = oponenteSelect.value;

    if (numeroFichas === 9) {

        const casillaIndex = event.target.dataset.index;
        if (estadoTablero[casillaIndex] === "" && juegoActivo) {
            if (oponente === "otroJugador") {
                // Modo dos jugadores
                const jugadorActual = turnoJugador ? jugador1 : jugador2;
                realizarMovimiento(casillaIndex, jugadorActual);
                reiniciarCuentaAtrasTurno();
            } else if (oponente === "iaAleatoria") {
                // Modo jugador contra IA aleatoria
                const jugadorActual = turnoJugador ? jugador1 : jugador2;
                realizarMovimiento(casillaIndex, jugadorActual);
                reiniciarCuentaAtrasTurno();
                realizarMovimientoIaAleatoria();
                reiniciarCuentaAtrasTurno();
                cambiarTurno();

            } else if (oponente === "iaEstrategica") {
                const jugadorActual = turnoJugador ? jugador1 : jugador2;
                realizarMovimiento(casillaIndex, jugadorActual);
                reiniciarCuentaAtrasTurno();
                // Llama a la función para que la IA realice su movimiento estratégico
                setTimeout(realizarMovimientoIaInteligente, 500);

                // Después de que la IA juegue, cambia de turno
                reiniciarCuentaAtrasTurno();
                cambiarTurno();

            }
        }
    } else if (numeroFichas === 6) {
        const casillaIndex = event.target.dataset.index;
        if (oponente === "otroJugador") {
            const jugadorActual = turnoJugador ? jugador1 : jugador2;
            if (movimientosRealizados < 6) {
                if (estadoTablero[casillaIndex] === "") {
                    realizarMovimiento(casillaIndex, jugadorActual);
                    movimientosRealizados++;
                    reiniciarCuentaAtrasTurno();
                }
            } else {
                eliminarFicha(casillaIndex, jugadorActual);
            }

        } else if (oponente === "iaAleatoria") {
            const jugadorActual = turnoJugador ? jugador1 : jugador2;
            if (movimientosRealizados < 6) {
                if (estadoTablero[casillaIndex] === "") {
                    realizarMovimiento(casillaIndex, jugadorActual);
                    movimientosRealizados++;
                    reiniciarCuentaAtrasTurno();
                    realizarMovimientoIaAleatoria();
                    movimientosRealizados++;
                    reiniciarCuentaAtrasTurno();
                    cambiarTurno();
                }
            } else if (movimientosRealizados >= 6) {
                // Se ejecutará esta parte si ya se han realizado 6 movimientos
                if (jugadorActual == jugador1) {
                    movimientosRealizados++;
                    movimientosRealizados++;
                    movimientosRealizados++;
                    if (!fichaEliminada) {
                        if (eliminarFicha(casillaIndex, jugadorActual)) {
                            // Si se elimina una ficha, marca la variable como verdadera
                            fichaEliminada = true;
                        }
                    } else {
                        if (estadoTablero[casillaIndex] === "") {
                            // Si ya se eliminó una ficha, realiza el movimiento
                            realizarMovimiento(casillaIndex, jugadorActual);
                            reiniciarCuentaAtrasTurno();
                            // Reinicia la variable para el próximo turno
                            fichaEliminada = false;
                            setTimeout(() => {
                                eliminarFichaIA();
                                realizarMovimientoIaAleatoria(); // Llama a la función para que la IA coloque una ficha
                            }, 1000);
                            reiniciarCuentaAtrasTurno();
                            cambiarTurno();
                        }
                    }
                }
            }
        } else if (oponente === "iaEstrategica") {
            const jugadorActual = turnoJugador ? jugador1 : jugador2;
            if (movimientosRealizados < 6) {
                if (estadoTablero[casillaIndex] === "") {
                    realizarMovimiento(casillaIndex, jugadorActual);
                    movimientosRealizados++;
                    reiniciarCuentaAtrasTurno();
                    realizarMovimientoIaInteligente();
                    movimientosRealizados++;
                    reiniciarCuentaAtrasTurno();
                    cambiarTurno();
                }
            } else if (movimientosRealizados >= 6) {
                // Se ejecutará esta parte si ya se han realizado 6 movimientos
                if (jugadorActual == jugador1) {
                    movimientosRealizados++;
                    movimientosRealizados++;
                    movimientosRealizados++;
                    if (!fichaEliminada) {
                        if (eliminarFicha(casillaIndex, jugadorActual)) {
                            // Si se elimina una ficha, marca la variable como verdadera
                            fichaEliminada = true;
                        }
                    } else {
                        if (estadoTablero[casillaIndex] === "") {
                            // Si ya se eliminó una ficha, realiza el movimiento
                            realizarMovimiento(casillaIndex, jugadorActual);
                            reiniciarCuentaAtrasTurno();
                            // Reinicia la variable para el próximo turno
                            fichaEliminada = false;
                            eliminarFichaIAMenosUtil();
                            realizarMovimientoIaInteligente(); // Llama a la función para que la IA coloque una ficha
                            reiniciarCuentaAtrasTurno();
                            cambiarTurno();
                        }
                    }
                }
            }
        }
    }
}

function eliminarFichaIAMenosUtil() {
    const fichaMenosUtilIndex = determinarFichaMenosUtil();
    if (fichaMenosUtilIndex !== null) {
        estadoTablero[fichaMenosUtilIndex] = ""; // Eliminar la ficha
        tablero.children[fichaMenosUtilIndex].textContent = ""; // Limpiar el contenido visual
        return true;
    }
    return false; // No se pudo eliminar ninguna ficha
}



function eliminarFichaIA() {
    const resultado = comprobarResultado();
    if (resultado) {
        // Si hay un resultado definido, no se realiza ningún movimiento de la IA
        return;
    }
    // Obtener todas las posiciones ocupadas por las fichas de la IA en el tablero
    const posicionesIA = [];
    for (let i = 0; i < estadoTablero.length; i++) {
        if (estadoTablero[i] === jugador2) {
            posicionesIA.push(i);
        }
    }

    // Seleccionar una posición aleatoria de las fichas de la IA
    const indiceAleatorio = Math.floor(Math.random() * posicionesIA.length);
    const posicionEliminar = posicionesIA[indiceAleatorio];

    // Eliminar la ficha de la IA en la posición seleccionada
    estadoTablero[posicionEliminar] = "";
    tablero.children[posicionEliminar].textContent = "";
}



function eliminarFicha(casillaIndex, jugadorActual) {
    if (estadoTablero[casillaIndex] === jugadorActual) {
        estadoTablero[casillaIndex] = ""; // Eliminar la ficha
        tablero.children[casillaIndex].textContent = ""; // Limpiar el contenido visual
        movimientosRealizados--;
        return true;
    }
    return false;
}



// Función para comprobar el resultado del juego
function comprobarResultado() {
    // Comprobar si hay un ganador
    for (const combo of combinacionesGanadoras) {
        const [a, b, c] = combo;
        if (
            estadoTablero[a] &&
            estadoTablero[a] === estadoTablero[b] &&
            estadoTablero[a] === estadoTablero[c]
        ) {
            return estadoTablero[a]; // Retorna el jugador ganador (X o O)
        }
    }

    // Comprobar si la partida termina en empate
    if (estadoTablero.every(casilla => casilla !== "")) {
        // Si el tablero está lleno, considerarlo un empate
        mostrarHistorial();
        return "Empate";
    }

    // Si no hay resultado aún
    return null;
}

// Función para mostrar el mensaje del resultado
function mostrarMensaje(resultado) {
    mensaje.textContent = resultado === "Empate" ? "¡Empate!" : `¡${resultado} ha ganado!`;
}

// Función para cambiar de turno
function cambiarTurno() {
    turnoJugador = !turnoJugador;
    reiniciarCuentaAtrasTurno();
}

// Función para reiniciar la cuenta atrás del turno
function reiniciarCuentaAtrasTurno() {
    clearInterval(intervaloTurno);
    tiempoRestanteTurno = tiempoTurno;
    mostrarTiempoRestanteTurno();
    const jugadorActual = turnoJugador ? jugador1 : jugador2;
    mensajeTurno.textContent = ` Turno de ${jugadorActual}.`;


    // Inicia la cuenta atrás del turno
    intervaloTurno = setInterval(function () {
        tiempoRestanteTurno--;
        mostrarTiempoRestanteTurno();

        if (tiempoRestanteTurno <= 0) {
            const jugadorPerdedor = turnoJugador ? jugador1 : jugador2;
            const jugadorGanador = !turnoJugador ? jugador1 : jugador2;
            mostrarMensaje(`${jugadorPerdedor} ha perdido por tiempo agotado.  ${jugadorGanador}`);
            finalizarPartida();
        }
    }, 1000);
}

function realizarMovimiento(casillaIndex, jugador) {
    let intentos = 0;
    if (estadoTablero[casillaIndex] === "") {
        estadoTablero[casillaIndex] = jugador;
        tablero.children[casillaIndex].textContent = jugador;

        // Verifica el resultado del movimiento
        const resultado = comprobarResultado();

        if (resultado) {
            // Si hay un resultado, muestra el mensaje y finaliza la partida
            mostrarMensaje(resultado);
            finalizarPartida();
        }
        cambiarTurno();
    } else {
        if (intentos < 2) {
            realizarMovimiento(casillaIndex, jugador);
            intentos++;
        }
    }
}

function realizarMovimientoIaAleatoria() {
    intervalIA = setTimeout(() => {
        const resultado = comprobarResultado();
        if (resultado) {
            // Si hay un resultado definido, no se realiza ningún movimiento de la IA
            return;
        }

        const celdasVacias = estadoTablero.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
        if (celdasVacias.length === 0) {
            return;
        }
        const casillaIndex = celdasVacias[Math.floor(Math.random() * celdasVacias.length)];
        estadoTablero[casillaIndex] = 'O',
            tablero.children[casillaIndex].textContent = 'O';
        const result = comprobarResultado();

        if (result) {
            // Si hay un resultado, muestra el mensaje y finaliza la partida
            mostrarMensaje(result);
            finalizarPartida();
        }
    }, 1000);
}
function realizarMovimientoIaInteligente() {
    const result = comprobarResultado();
    if (result) {
        // Si hay un resultado definido, no se realiza ningún movimiento de la IA
        return;
    }

    const mejorMovimiento = obtenerMejorMovimiento();
    const casillaIndex = mejorMovimiento.index;
    estadoTablero[casillaIndex] = jugador2;
    actualizarInterfaz(casillaIndex, jugador2);

    const resultado = comprobarResultado();
    if (resultado) {
        mostrarMensaje(resultado);
        finalizarPartida();
    }
}


function obtenerMejorMovimiento() {
    // Comprobar si hay un movimiento que resulte en victoria
    for (let i = 0; i < estadoTablero.length; i++) {
        if (estadoTablero[i] === "") {
            const tableroCopia = [...estadoTablero];
            tableroCopia[i] = jugador2;
            if (comprobarGanador(tableroCopia, jugador2)) {
                return { index: i };
            }
        }
    }

    // Comprobar si hay un movimiento que bloquee la victoria del jugador
    for (let i = 0; i < estadoTablero.length; i++) {
        if (estadoTablero[i] === "") {
            const tableroCopia = [...estadoTablero];
            tableroCopia[i] = jugador1;
            if (comprobarGanador(tableroCopia, jugador1)) {
                return { index: i };
            }
        }
    }

    // Comprobar si el centro está vacío y jugar ahí
    if (estadoTablero[4] === "") {
        return { index: 4 };
    }

    // Comprobar otros movimientos posibles
    const movimientosDisponibles = obtenerMovimientosDisponibles(estadoTablero);
    return { index: movimientosDisponibles[Math.floor(Math.random() * movimientosDisponibles.length)] };
}

function obtenerMovimientosDisponibles(tablero) {
    const movimientos = [];
    for (let i = 0; i < tablero.length; i++) {
        if (tablero[i] === "") {
            movimientos.push(i);
        }
    }
    return movimientos;
}

function determinarFichaMenosUtil() {
    // Matriz que representa el tablero
    const matrizTablero = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
    ];

    let fichaMenosUtil = null;
    let utilidadMinima = Infinity;

    // Función para calcular la distancia entre dos posiciones en el tablero
    function calcularDistancia(pos1, pos2) {
        const fila1 = Math.floor(pos1 / 3);
        const columna1 = pos1 % 3;
        const fila2 = Math.floor(pos2 / 3);
        const columna2 = pos2 % 3;
        return Math.abs(fila1 - fila2) + Math.abs(columna1 - columna2);
    }

    // Función para evaluar la utilidad de una ficha según varios criterios
    function evaluarUtilidad(fichaIndex) {
        const pesoDistanciaCentro = 1; // Importancia de la distancia al centro
        const pesoBloqueoOponente = 2; // Importancia de bloquear al oponente

        let utilidad = 0;

        // Calcular la distancia al centro del tablero
        const distanciaCentro = calcularDistancia(fichaIndex, 4);
        utilidad += pesoDistanciaCentro * distanciaCentro;

        // Calcular la cantidad de líneas de victoria que bloquea al oponente
        const lineasBloqueadas = combinacionesGanadoras.filter(combo => combo.includes(fichaIndex) && combo.every(pos => estadoTablero[pos] === jugador1)).length;
        utilidad += pesoBloqueoOponente * lineasBloqueadas;



        return utilidad;
    }

    // Recorrer el tablero para encontrar la ficha menos útil
    for (let i = 0; i < estadoTablero.length; i++) {
        if (estadoTablero[i] === jugador2) { // Solo consideramos las fichas de la IA
            const utilidadFicha = evaluarUtilidad(i);
            if (utilidadFicha < utilidadMinima) {
                fichaMenosUtil = i;
                utilidadMinima = utilidadFicha;
            }
        }
    }

    return fichaMenosUtil;
}


function comprobarGanador(tablero, jugador) {
    for (const combinacion of combinacionesGanadoras) {
        let ganador = true;
        for (const indice of combinacion) {
            if (tablero[indice] !== jugador) {
                ganador = false;
                break;
            }
        }
        if (ganador) {
            return true;
        }
    }
    return false;
}

// Función para actualizar la interfaz gráfica con el movimiento de la IA
function actualizarInterfaz(casillaIndex, jugador) {
    const casilla = document.querySelector(`[data-index="${casillaIndex}"]`);
    casilla.textContent = jugador;
}

// Función para finalizar la partida
function finalizarPartida() {
    // Desactiva la interactividad del tablero
    tablero.removeEventListener("click", manejarClick);
    clearInterval(intervaloTurno);
    clearInterval(intervaloPartida);
    clearInterval(intervalIA);

    // Implementa la lógica para actualizar el historial y mostrarlo
    actualizarHistorial();
}

// Función para actualizar el historial y mostrarlo
function actualizarHistorial() {
    const resultado = comprobarResultado();

    if (resultado) {
        // Actualiza los contadores según el resultado
        if (resultado === "Empate") {
            contadorEmpates++;
        } else if (resultado === jugador1) {
            contadorVictoriasJugador1++;
        } else if (resultado === jugador2) {
            contadorVictoriasJugador2++;
        }

        // Muestra el historial actualizado
        mostrarHistorial();
    }
}

// Función para mostrar el historial
function mostrarHistorial() {
    const jugador1Stats = `Jugador 1: ${contadorVictoriasJugador1} - ${contadorEmpates} - ${contadorVictoriasJugador2}`;
    const jugador2Stats = `Jugador 2: ${contadorVictoriasJugador2} - ${contadorEmpates} - ${contadorVictoriasJugador1}`;

    document.getElementById("jugador1Stats").textContent = jugador1Stats;
    document.getElementById("jugador2Stats").textContent = jugador2Stats;
}

// Funciones para iniciar y mostrar la cuenta atrás de la partida
function iniciarCuentaAtrasPartida() {
    clearInterval(intervaloPartida);
    mostrarTiempoRestantePartida();

    // Inicia la cuenta atrás de la partida
    intervaloPartida = setInterval(function () {
        tiempoRestantePartida--;

        if (tiempoRestantePartida <= 0) {
            // Si se acaba el tiempo de la partida, finaliza la partida automáticamente
            finalizarPartida();
            mostrarMensaje("Tiempo agotado");
        } else {
            mostrarTiempoRestantePartida();
        }
    }, 1000);
}

// Función para reiniciar las estadísticas
function reiniciarEstadisticas() {
    contadorVictoriasJugador1 = 0;
    contadorVictoriasJugador2 = 0;
    contadorEmpates = 0;
    mostrarHistorial();
}

// Manejador de eventos para el botón de reiniciar página
reiniciarPaginaBtn.addEventListener("click", () => {
    // Recargar la página
    location.reload();
});

// Función para formatear el tiempo en mm:ss
function formatTime(tiempo) {
    const minutos = Math.floor(tiempo / 60);
    const segundos = tiempo % 60;
    return `${minutos}:${segundos < 10 ? "0" : ""}${segundos}`;
}

