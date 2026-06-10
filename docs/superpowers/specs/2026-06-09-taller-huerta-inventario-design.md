# Sistema operativo para Taller de la Huerta

Fecha: 2026-06-09

## Objetivo

Construir una primera aplicacion de gestion para un emprendimiento artesanal que produce y vende jabones corporales, aceites esenciales, shampoo solido y productos relacionados. La version inicial debe ayudar a controlar inventario de insumos, productos terminados, produccion, costos y gastos desde un dashboard claro.

## Alcance del MVP

La primera version cubre:

- Dashboard operativo y financiero.
- Catalogo de insumos.
- Compras de insumos con historial.
- Inventario de insumos con costo promedio ponderado.
- Catalogo de productos terminados.
- Recetas/formulaciones opcionales por producto.
- Produccion por lotes para productos con o sin receta.
- Inventario de productos terminados.
- Lotes y vencimientos opcionales para insumos y productos terminados.
- Registro simple de gastos operativos.
- Datos persistidos en el navegador mediante localStorage.

Queda fuera de esta version:

- Punto de venta, facturacion y clientes.
- Multiusuario real, roles y permisos.
- Sincronizacion en la nube.
- Contabilidad formal e impuestos.
- Integraciones con proveedores o marketplaces.

## Enfoque Recomendado

La app sera local-first y funcionara como una aplicacion web estatica. Esta decision permite entregar rapido una herramienta usable sin depender de servidor, base de datos externa o autenticacion. La arquitectura debe dejar separada la logica de negocio de la interfaz para que luego sea posible migrar a un backend real.

Alternativas consideradas:

- Hoja de calculo avanzada: rapida, pero fragil para movimientos, lotes, costos y trazabilidad.
- Backend completo desde el inicio: mas escalable, pero demasiado pesado para validar el flujo operativo.
- App local-first estatica: mejor balance para el MVP.

## Modelo de Datos

### Insumo

Campos principales:

- id
- nombre
- categoria
- unidad base
- stock minimo
- requiere lote o vencimiento

Ejemplos: aceite de coco, soda caustica, fragancia de lavanda, envase de vidrio, etiqueta.

### Compra de Insumo

Campos principales:

- id
- insumo
- proveedor
- fecha
- cantidad
- unidad
- costo total
- lote opcional
- vencimiento opcional

Cada compra aumenta el inventario disponible del insumo y alimenta el costo promedio ponderado.

### Producto Terminado

Campos principales:

- id
- nombre
- categoria
- unidad de venta
- precio sugerido
- stock minimo
- requiere lote o vencimiento

Ejemplos: jabon de lavanda 100 g, shampoo solido romero, aceite esencial de naranja 10 ml.

### Receta

Campos principales:

- producto
- rendimiento esperado
- insumos requeridos con cantidad por lote
- mano de obra estimada opcional
- merma estimada opcional

Las recetas son opcionales. Un producto puede producirse sin receta, registrando manualmente el resultado.

### Produccion

Campos principales:

- id
- producto
- fecha
- cantidad producida
- lote opcional
- vencimiento opcional
- estado
- insumos consumidos
- costo calculado

Para productos con receta, la app propone consumos. Para productos sin receta, se permite registrar una produccion simple.

### Gasto

Campos principales:

- id
- fecha
- categoria
- descripcion
- monto

Ejemplos: servicios, transporte, empaques indirectos, mantenimiento, herramientas, publicidad.

## Reglas De Costo

El costo de insumos se calcula por promedio ponderado:

`costo promedio = valor total disponible / cantidad disponible`

Cuando se registra una compra, aumenta cantidad y valor disponible. Cuando se registra produccion, se consume cantidad y valor usando el costo promedio vigente.

El costo de un producto producido se calcula como:

`costo lote = suma de insumos consumidos + mano de obra opcional + gastos directos opcionales`

El costo unitario del producto terminado sera:

`costo unitario = costo lote / cantidad producida`

El margen estimado se calcula contra el precio sugerido:

`margen = precio sugerido - costo unitario`

## Flujos Principales

### Registrar Compra

1. Seleccionar insumo.
2. Ingresar proveedor, fecha, cantidad y costo total.
3. Opcionalmente registrar lote y vencimiento.
4. El dashboard actualiza stock, costo promedio y alertas.

### Registrar Produccion

1. Seleccionar producto.
2. Si tiene receta, precargar insumos esperados.
3. Permitir ajustar consumos reales.
4. Registrar cantidad producida, lote y vencimiento si aplica.
5. Descontar insumos.
6. Sumar producto terminado al inventario.
7. Calcular costo unitario.

### Registrar Gasto

1. Ingresar fecha, categoria, descripcion y monto.
2. Reflejar el gasto en resumen mensual.

## Dashboard

El dashboard debe mostrar:

- Valor estimado del inventario.
- Insumos bajo minimo.
- Productos terminados bajo minimo.
- Proximos vencimientos.
- Producciones recientes.
- Compras recientes.
- Gastos del mes.
- Productos con mejor o peor margen estimado.

La interfaz debe priorizar uso diario: registrar rapido compras, produccion y gastos, sin formularios extensos innecesarios.

## Arquitectura

La primera version se implementara con archivos estaticos:

- `index.html`: estructura de la aplicacion.
- `src/styles.css`: sistema visual y layout responsive.
- `src/domain.js`: reglas de negocio puras para costos, inventario, alertas y metricas.
- `src/storage.js`: carga, guardado y datos iniciales en localStorage.
- `src/app.js`: estado de UI, eventos y renderizado.
- `tests/domain.test.js`: pruebas de reglas de negocio con `node --test`.

Esta separacion permite probar los calculos sin depender del DOM.

## Experiencia De Usuario

La app usara una estructura de gestion, no de landing page:

- Barra lateral o navegacion compacta.
- Dashboard como primera pantalla.
- Pestañas para Insumos, Productos, Recetas, Produccion, Compras y Gastos.
- Formularios compactos junto a tablas de datos.
- Alertas visuales para bajo stock y vencimientos.
- Diseno responsive para escritorio y movil.

## Validacion

Pruebas esperadas:

- El promedio ponderado se calcula correctamente tras compras sucesivas.
- La produccion descuenta insumos y aumenta producto terminado.
- El costo unitario de lote se calcula desde consumos.
- Las alertas de bajo stock se activan correctamente.
- Los gastos mensuales se suman correctamente.

Verificacion manual:

- Abrir `index.html` en navegador.
- Confirmar que el dashboard carga datos de ejemplo.
- Registrar una compra y ver actualizacion de stock/costo.
- Registrar una produccion y ver descuento de insumos y aumento de producto.
- Confirmar que la interfaz no se rompe en ancho movil.
