# Emprendedos Dashboard Redesign

Fecha: 2026-06-10

## Objetivo

Transformar la app local actual en una primera experiencia de producto SaaS llamada **Emprendedos**, pensada para emprendedores que producen y venden productos fisicos de forma constante y necesitan claridad para crecer.

## Posicionamiento

Emprendedos combina al emprendedor y la aplicacion como una dupla de trabajo. La promesa principal es:

> Haz crecer tu emprendimiento con claridad.

El producto no debe sentirse como un ERP frio ni como una hoja de calculo. Debe funcionar como una cabina de mando que convierte inventario, costos, ventas y gastos en decisiones semanales.

## Personalidad Visual

- Energia emprendedora y crecimiento.
- Colores vivos pero profesionales: verde crecimiento, coral, azul energia, amarillo alerta y fondos claros.
- Numeros grandes y faciles de leer.
- Graficas simples y accionables.
- Lenguaje humano: "Tu negocio este mes", "Acciones para crecer", "Productos estrella".

## Dashboard Inicial

La primera pantalla debe mostrar:

- Ventas del mes.
- Utilidad bruta.
- Margen promedio.
- Inventario valorizado.
- Gastos del mes.
- Resultado operativo.
- Score de salud del negocio.
- Grafica de ventas semanales.
- Grafica de gastos por categoria.
- Productos estrella.
- Alertas criticas.
- Acciones recomendadas.

## Alcance De Esta Iteracion

Se mantiene la arquitectura local-first actual. No se implementan cuentas, tenants, pagos, backend ni autenticacion todavia.

Esta iteracion se enfoca en:

- Renombrar la experiencia a Emprendedos.
- Rediseñar el dashboard y la navegacion.
- Agregar metricas de crecimiento calculadas desde el estado actual.
- Agregar graficas CSS/HTML sin dependencias externas.
- Mantener las pantallas operativas existentes.

## Criterios De Exito

- Al abrir la app, se entiende que es un producto para crecer un emprendimiento.
- El dashboard permite leer rapidamente ventas, utilidad, margen, inventario y gastos.
- Las graficas aportan contexto sin abrumar.
- Las recomendaciones ayudan a decidir que hacer esta semana.
- Las pruebas de dominio siguen pasando.
