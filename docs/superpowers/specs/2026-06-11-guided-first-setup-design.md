# Guided First Setup Design

## Objetivo

Evitar que un nuevo emprendedor aterrice en un dashboard vacio sin saber que hacer. Emprendedos debe sugerir las primeras tres cargas que convierten la cuenta en un tablero util.

## Alcance

- Detectar dashboard sin ingresos, gastos, inventario, alertas ni productos vendidos.
- Mostrar una banda superior de onboarding en el dashboard.
- Ofrecer tres acciones directas: productos, insumos y gastos.
- Navegar a las pantallas operativas existentes sin crear un wizard bloqueante.

## Decisiones

- La guia vive en el dashboard porque es contextual: aparece solo cuando no hay datos.
- No se persiste un estado de "completado" todavia; desaparece naturalmente cuando existan datos operativos.
- No se agregan endpoints nuevos.

## Fuera De Alcance

- Plantillas por industria.
- Importacion masiva.
- Tour paso a paso.
- Checklist persistente por usuario.
