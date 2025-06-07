// Array para almacenar los medicamentos
        let medicamentos = [
            { id: 1, nombre: "Paracetamol", descripcion: "Analgésico y antipirético", principioActivo: "Paracetamol", precio: 50.00, existencia: 100 },
            { id: 2, nombre: "Ibuprofeno", descripcion: "Antiinflamatorio no esteroideo (AINE)", principioActivo: "Ibuprofeno", precio: 75.50, existencia: 75 },
            { id: 3, nombre: "Amoxicilina", descripcion: "Antibiótico de amplio espectro", principioActivo: "Amoxicilina", precio: 120.00, existencia: 50 },
            { id: 4, nombre: "Omeprazol", descripcion: "Inhibidor de la bomba de protones", principioActivo: "Omeprazol", precio: 90.25, existencia: 90 },
            { id: 5, nombre: "Loratadina", descripcion: "Antihistamínico para alergias", principioActivo: "Loratadina", precio: 60.00, existencia: 110 }
        ];

        let nextId = medicamentos.length > 0 ? Math.max(...medicamentos.map(m => m.id)) + 1 : 1;
        let carritoVenta = [];

        // Función para renderizar la tabla de medicamentos
        function renderizarTablaMedicamentos(filtro = '') {
            const tbody = document.querySelector('#tabla-medicamentos tbody');
            tbody.innerHTML = ''; // Limpiar la tabla

            const medicamentosFiltrados = medicamentos.filter(med =>
                med.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                med.principioActivo.toLowerCase().includes(filtro.toLowerCase())
            );

            medicamentosFiltrados.forEach(med => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td><input type="checkbox" data-id="${med.id}" data-nombre="${med.nombre}" data-descripcion="${med.descripcion}" data-principio="${med.principioActivo}" data-precio="${med.precio}" data-existencia="${med.existencia}"></td>
                    <td>${med.nombre}</td>
                    <td>${med.descripcion}</td>
                    <td>${med.principioActivo}</td>
                    <td>$${med.precio.toFixed(2)}</td>
                    <td id="existencia-${med.id}">${med.existencia}</td>
                    <td><button class="delete-btn" onclick="eliminarMedicamento(${med.id})">Eliminar</button></td>
                `;
            });
        }

        // --- Funcionalidad del Buscador ---
        function buscarMedicamento() {
            const input = document.getElementById('search-input').value;
            renderizarTablaMedicamentos(input);
        }

        // --- Funcionalidad para Agregar Medicamento ---
        function agregarMedicamento() {
            const nombre = document.getElementById('nombre-medicamento').value;
            const descripcion = document.getElementById('descripcion-medicamento').value;
            const principioActivo = document.getElementById('principio-activo').value;
            const precio = parseFloat(document.getElementById('precio-medicamento').value);
            const existencia = parseInt(document.getElementById('existencia-medicamento').value);

            if (!nombre || !principioActivo || isNaN(precio) || isNaN(existencia) || precio < 0 || existencia < 0) {
                alert('Por favor, completa todos los campos correctamente.');
                return;
            }

            const nuevoMedicamento = {
                id: nextId++,
                nombre,
                descripcion,
                principioActivo,
                precio,
                existencia
            };

            medicamentos.push(nuevoMedicamento);
            renderizarTablaMedicamentos();
            alert(`Medicamento "${nombre}" agregado con éxito.`);

            // Limpiar formulario
            document.getElementById('nombre-medicamento').value = '';
            document.getElementById('descripcion-medicamento').value = '';
            document.getElementById('principio-activo').value = '';
            document.getElementById('precio-medicamento').value = '';
            document.getElementById('existencia-medicamento').value = '';

            // Volver a la página principal del inventario
            mostrarSubpagina('inventario-page');
        }

        // --- Funcionalidad para Eliminar Producto ---
        function eliminarMedicamento(id) {
            if (confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
                medicamentos = medicamentos.filter(med => med.id !== id);
                renderizarTablaMedicamentos();
                alert('Medicamento eliminado.');
            }
        }

        // --- Funcionalidad de Comparación (ya existente, con ajuste a la nueva estructura de datos) ---
        document.getElementById('btn-comparar').addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('#tabla-medicamentos tbody input[type="checkbox"]:checked');
            const listaComparacion = document.getElementById('lista-comparacion');
            listaComparacion.innerHTML = ''; // Limpiar la sección de comparación

            if (checkboxes.length === 0) {
                listaComparacion.innerHTML = '<p style="text-align: center; color: #777;">Por favor, selecciona al menos un medicamento para comparar.</p>';
                document.getElementById('comparacion').style.display = 'block';
                return;
            }

            checkboxes.forEach(checkbox => {
                const nombre = checkbox.dataset.nombre;
                const descripcion = checkbox.dataset.descripcion;
                const principio = checkbox.dataset.principio;
                const precio = checkbox.dataset.precio;
                const existencia = checkbox.dataset.existencia;

                const divMedicamento = document.createElement('div');
                divMedicamento.classList.add('medicamento-comparado');
                divMedicamento.innerHTML = `
                    <div><strong>Nombre:</strong> ${nombre}</div>
                    <div><strong>Descripción:</strong> ${descripcion}</div>
                    <div><strong>Principio Activo:</strong> ${principio}</div>
                    <div><strong>Precio:</strong> $${parseFloat(precio).toFixed(2)}</div>
                    <div><strong>Existencia:</strong> ${existencia}</div>
                `;
                listaComparacion.appendChild(divMedicamento);
            });

            document.getElementById('comparacion').style.display = 'block'; // Mostrar la sección de comparación
        });

        // --- Funcionalidad para Ventas ---
        function renderizarProductosVenta() {
            const listaProductosVenta = document.getElementById('lista-productos-venta');
            listaProductosVenta.innerHTML = '';
            let totalVenta = 0;

            medicamentos.forEach(med => {
                const divItem = document.createElement('div');
                divItem.classList.add('item-venta');
                divItem.innerHTML = `
                    <span>${med.nombre} ($${med.precio.toFixed(2)}) - Disp. (<span id="venta-existencia-${med.id}">${med.existencia}</span>)</span>
                    <div>
                        <input type="number" id="cantidad-venta-${med.id}" value="0" min="0" max="${med.existencia}" onchange="actualizarCantidadEnCarrito(${med.id})">
                    </div>
                `;
                listaProductosVenta.appendChild(divItem);
            });

            actualizarTotalVentaGeneral(); // Inicializar el total
        }

        function actualizarCantidadEnCarrito(id) {
            const cantidadInput = document.getElementById(`cantidad-venta-${id}`);
            const cantidad = parseInt(cantidadInput.value);
            const medicamento = medicamentos.find(med => med.id === id);

            if (!medicamento) return;

            if (cantidad < 0 || isNaN(cantidad)) {
                cantidadInput.value = 0; // Asegurarse de que no haya cantidades negativas o no numéricas
                return;
            }

            if (cantidad > medicamento.existencia) {
                alert(`No hay suficiente existencia de ${medicamento.nombre}. Disponible: ${medicamento.existencia}`);
                cantidadInput.value = medicamento.existencia;
                // Ajustar la cantidad al máximo disponible
            }

            const cantidadFinal = parseInt(cantidadInput.value); // Obtener el valor ajustado

            const itemExistenteIndex = carritoVenta.findIndex(item => item.id === id);

            if (cantidadFinal > 0) {
                if (itemExistenteIndex > -1) {
                    // Si ya está en el carrito, actualiza la cantidad
                    carritoVenta[itemExistenteIndex].cantidad = cantidadFinal;
                    carritoVenta[itemExistenteIndex].subtotal = cantidadFinal * medicamento.precio;
                } else {
                    // Si no está, agrégalo
                    carritoVenta.push({
                        id: medicamento.id,
                        nombre: medicamento.nombre,
                        precio: medicamento.precio,
                        cantidad: cantidadFinal,
                        subtotal: cantidadFinal * medicamento.precio
                    });
                }
            } else {
                // Si la cantidad es 0 o negativa, elimínalo del carrito si existe
                if (itemExistenteIndex > -1) {
                    carritoVenta.splice(itemExistenteIndex, 1);
                }
            }
            actualizarTotalVentaGeneral();
        }


        function actualizarTotalVentaGeneral() {
            let total = carritoVenta.reduce((sum, item) => sum + item.subtotal, 0);
            document.getElementById('total-venta').textContent = total.toFixed(2);
        }

        function finalizarVenta() {
            if (carritoVenta.length === 0) {
                alert('No hay productos en el carrito para vender.');
                return;
            }

            if (confirm('¿Confirmar la venta de los productos seleccionados?')) {
                // Pre-validar existencia antes de procesar
                for (const item of carritoVenta) {
                    const medicamento = medicamentos.find(med => med.id === item.id);
                    if (!medicamento || item.cantidad > medicamento.existencia) {
                        alert(`Error: No hay suficiente ${item.nombre}. Solo quedan ${medicamento ? medicamento.existencia : 0}.`);
                        return; // Detener la venta si hay una inconsistencia
                    }
                }

                carritoVenta.forEach(item => {
                    const medicamento = medicamentos.find(med => med.id === item.id);
                    if (medicamento) {
                        medicamento.existencia -= item.cantidad;
                        // Actualizar la existencia mostrada en la tabla principal
                        const existenciaCelda = document.getElementById(`existencia-${medicamento.id}`);
                        if (existenciaCelda) {
                            existenciaCelda.textContent = medicamento.existencia;
                        }
                    }
                });

                generarRecibo(carritoVenta, parseFloat(document.getElementById('total-venta').textContent));
                carritoVenta = []; // Limpiar el carrito
                document.getElementById('total-venta').textContent = '0.00';
                renderizarTablaMedicamentos(); // Actualizar la tabla principal
                renderizarProductosVenta(); // Actualizar la vista de ventas
                // No volver a la página principal, el recibo se encarga de eso.
            }
        }

        // --- Funcionalidad del Módulo de Recibos ---
        function generarRecibo(itemsVendidos, totalVenta) {
            const reciboModal = document.getElementById('recibo-modal');
            const reciboFecha = document.getElementById('recibo-fecha');
            const reciboHora = document.getElementById('recibo-hora');
            const reciboListaProductos = document.getElementById('recibo-lista-productos');
            const reciboTotalMonto = document.getElementById('recibo-total-monto');

            // Limpiar lista de productos del recibo anterior
            reciboListaProductos.innerHTML = '';

            // Obtener fecha y hora actuales
            const now = new Date();
            reciboFecha.textContent = now.toLocaleDateString('es-MX');
            reciboHora.textContent = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

            // Llenar la lista de productos del recibo
            itemsVendidos.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.nombre} x ${item.cantidad}</span>
                    <span>$${item.subtotal.toFixed(2)}</span>
                `;
                reciboListaProductos.appendChild(li);
            });

            reciboTotalMonto.textContent = totalVenta.toFixed(2);

            reciboModal.style.display = 'flex'; // Mostrar el modal
        }

        function cerrarRecibo() {
            document.getElementById('recibo-modal').style.display = 'none';
            mostrarSubpagina('inventario-page'); // Volver a la página principal después de cerrar el recibo
        }

        function imprimirRecibo() {
            const printContent = document.querySelector('.recibo-content').innerHTML; // ¡CORREGIDO!
            const printWindow = window.open('', '_blank');

            // Incluir solo los estilos relevantes para el recibo para una impresión limpia
            const printStyles = `
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .recibo-content {
                        width: 100%;
                        max-width: 500px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ccc;
                        box-shadow: none; /* Eliminar sombra para impresión */
                        border-radius: 0; /* Eliminar bordes redondeados para impresión */
                    }
                    .recibo-header, .recibo-body, .recibo-total, .recibo-footer {
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px dashed #ccc;
                    }
                    .recibo-total { border-top: 1px dashed #ccc; }
                    .recibo-header h3 { text-align: center; margin: 0; }
                    .recibo-body ul { list-style: none; padding: 0; }
                    .recibo-body ul li { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .recibo-footer { text-align: center; font-size: 0.9em; color: #777; }
                    .recibo-actions { display: none; } /* Ocultar botones de acción en la impresión */
                </style>
            `;

            printWindow.document.write(`
                <html>
                <head>
                    <title>Recibo de Venta</title>
                    ${printStyles}
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }


        // --- Funcionalidad de Navegación de Subpáginas ---
        function mostrarSubpagina(idPagina) {
            document.querySelectorAll('.subpage').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(idPagina).classList.add('active');

            // Cargar los productos de venta solo cuando se va a la página de ventas
            if (idPagina === 'ventas-page') {
                renderizarProductosVenta();
            }
        }

        document.getElementById('nav-inventario').addEventListener('click', () => mostrarSubpagina('inventario-page'));
        document.getElementById('nav-agregar').addEventListener('click', () => mostrarSubpagina('agregar-page'));
        document.getElementById('nav-ventas').addEventListener('click', () => mostrarSubpagina('ventas-page'));


        // Inicializar la tabla al cargar la página
        document.addEventListener('DOMContentLoaded', () => {
            renderizarTablaMedicamentos();
        });