// Variables y objetos necesarios
let saldoPesos = 0;
let saldoFIFA = 0;
const precioCompra = 5; // Precio de compra fijo
const precioVenta = 4;  // Precio de venta fijo

let transacciones = JSON.parse(localStorage.getItem('transacciones')) || [];

// Función para actualizar la tabla de cotización
function actualizarCotizacion() {
    const now = new Date();
    const fechaHora = now.toLocaleString();

    const fechaHoraElement = document.getElementById('fechaHora');
    if (fechaHoraElement) {
        fechaHoraElement.innerText = fechaHora;
    } else {
        console.error('Elemento de fecha y hora no encontrado.');
    }

    const precioCompraElement = document.getElementById('precioCompra');
    const precioVentaElement = document.getElementById('precioVenta');

    if (precioCompraElement && precioVentaElement) {
        precioCompraElement.innerText = `$${precioCompra}`;
        precioVentaElement.innerText = `$${precioVenta}`;
    } else {
        console.error('Elementos de precio de compra y venta no encontrados.');
    }
}

// Función para mostrar resultados con SweetAlert
function mostrarResultado(titulo, mensaje, tipo = 'info') {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'OK'
    });
}

// Función para iniciar la simulación
function iniciarSimulacion() {
    const tarjeta = document.getElementById('tarjeta').value;
    const ultimos4 = document.getElementById('ultimos4').value;
    const saldoInicial = parseFloat(document.getElementById('saldoInicial').value);

    if (isNaN(saldoInicial) || saldoInicial <= 0 || ultimos4.length !== 4 || isNaN(parseInt(ultimos4))) {
        mostrarResultado('Error', 'Por favor, ingresa un saldo inicial válido y los últimos 4 dígitos de la tarjeta.', 'error');
        return;
    }

    let recargo = tarjeta === 'visa' ? saldoInicial * 0.05 : saldoInicial * 0.03;
    const mensajeConfirmacion = `El gasto por operar con tarjeta ${tarjeta} es de $${recargo.toFixed(2)}. El saldo inicial es $${saldoInicial}. ¿Deseas continuar?`;

    Swal.fire({
        title: 'Confirmación',
        text: mensajeConfirmacion,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            saldoPesos = saldoInicial; // El saldo inicial proporcionado por el usuario
            saldoFIFA = 0; // Inicialmente no tiene FIFA Coins
            document.getElementById('operaciones').style.display = 'block';
            mostrarResultado('Éxito', `Simulación iniciada con saldo de $${saldoPesos} pesos.`);
        } else {
            mostrarResultado('Cancelado', 'Transacción cancelada.', 'info');
        }
    });
}

// Funciones para operaciones de compra y venta
const mercado = {
    comprar: function(cantidad) {
        return new Promise((resolve, reject) => {
            const costo = cantidad * precioCompra;
            if (saldoPesos >= costo) {
                saldoPesos -= costo;
                saldoFIFA += cantidad;
                transacciones.push({ tipo: "Compra", cantidad: cantidad, costo: costo });
                localStorage.setItem('transacciones', JSON.stringify(transacciones));
                resolve(`Has comprado ${cantidad} FIFA Coins por $${costo}. Saldo actual: $${saldoPesos} pesos y ${saldoFIFA} FIFA Coins.`);
            } else {
                reject("No tienes suficiente saldo para realizar esta compra.");
            }
        });
    },
    vender: function(cantidad) {
        return new Promise((resolve) => {
            if (saldoFIFA >= cantidad) {
                const ganancia = cantidad * precioVenta;
                saldoPesos += ganancia;
                saldoFIFA -= cantidad;
                transacciones.push({ tipo: "Venta", cantidad: cantidad, ganancia: ganancia });
                localStorage.setItem('transacciones', JSON.stringify(transacciones));
                resolve(`Has vendido ${cantidad} FIFA Coins por $${ganancia}. Saldo actual: $${saldoPesos} pesos y ${saldoFIFA} FIFA Coins.`);
            } else {
                resolve("No tienes suficientes FIFA Coins para vender.");
            }
        });
    },
    mostrarTransacciones: function() {
        return new Promise((resolve) => {
            let historial = "Historial de transacciones:<br>";
            transacciones.forEach(transaccion => {
                historial += `Tipo: ${transaccion.tipo}, Cantidad: ${transaccion.cantidad}, Monto: $${transaccion.costo || transaccion.ganancia}<br>`;
            });
            resolve(historial);
        });
    }
};

// Event Listener para iniciar la simulación
document.getElementById('iniciarSimulacionBtn').addEventListener('click', iniciarSimulacion);

// Event Listener para comprar
document.getElementById('comprarBtn').addEventListener('click', () => {
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarResultado('Error', 'Por favor, ingresa una cantidad válida.', 'error');
        return;
    }
    mercado.comprar(cantidad)
        .then(mensaje => mostrarResultado('Compra Exitosa', mensaje, 'success'))
        .catch(mensaje => mostrarResultado('Error', mensaje, 'error'));
});

// Event Listener para vender
document.getElementById('venderBtn').addEventListener('click', () => {
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarResultado('Error', 'Por favor, ingresa una cantidad válida.', 'error');
        return;
    }
    mercado.vender(cantidad)
        .then(mensaje => mostrarResultado('Venta Exitosa', mensaje, 'success'))
        .catch(mensaje => mostrarResultado('Error', mensaje, 'error'));
});

// Event Listener para mostrar transacciones
document.getElementById('mostrarTransaccionesBtn').addEventListener('click', () => {
    mercado.mostrarTransacciones()
        .then(historial => mostrarResultado('Historial de Transacciones', historial, 'info'));
});

// Cargar datos al iniciar la página
actualizarCotizacion(); // Actualiza la cotización al iniciar la página