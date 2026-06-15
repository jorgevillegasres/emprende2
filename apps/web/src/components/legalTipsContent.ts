// Guias legales curadas para emprendedores en Colombia. Orientacion general,
// no asesoria juridica personalizada. Cada guia se etiqueta con los sectores
// donde es mas relevante; "General" aplica a cualquier emprendimiento.

export type LegalCategory = "Formalizacion" | "Tributario" | "Marca" | "Sanitario" | "Etiquetado" | "Contratos" | "Datos";

export type LegalTip = {
  id: string;
  category: LegalCategory;
  title: string;
  summary: string;
  points: string[];
  sectors: string[];
  severity: "info" | "important";
};

export const legalSectors = [
  "General",
  "Cosmetica y jabones",
  "Reposteria y alimentos",
  "Velas y aromas",
  "Ropa y accesorios",
  "Ceramica y decoracion"
];

export const legalTips: LegalTip[] = [
  {
    id: "formalizacion-rut-camara",
    category: "Formalizacion",
    title: "Formaliza tu emprendimiento: RUT y Camara de Comercio",
    summary: "Estar formalizado te permite facturar, vender a empresas y acceder a creditos y convocatorias.",
    points: [
      "Tramita el RUT ante la DIAN (gratuito) con la actividad economica que corresponda a tu negocio.",
      "Si operas como persona natural comerciante o constituyes empresa, registra la matricula mercantil en la Camara de Comercio de tu ciudad y renuevala cada ano.",
      "Evalua con un contador si te conviene persona natural o una figura como SAS segun tu tamano y socios."
    ],
    sectors: ["General"],
    severity: "important"
  },
  {
    id: "tributario-regimen-simple",
    category: "Tributario",
    title: "Regimen Simple de Tributacion y facturacion electronica",
    summary: "Elegir bien tu regimen y emitir factura electronica te evita sanciones y ordena tu caja.",
    points: [
      "El Regimen Simple (RST) unifica varios impuestos en una sola declaracion y suele convenir a pequenos negocios; valida tu caso con un contador.",
      "La factura electronica es obligatoria para quienes son responsables de facturar; usa un proveedor tecnologico o la solucion gratuita de la DIAN.",
      "Guarda soportes de ingresos y gastos: son la base de tus declaraciones y de tus indicadores en Emprendedos."
    ],
    sectors: ["General"],
    severity: "important"
  },
  {
    id: "marca-registro-sic",
    category: "Marca",
    title: "Protege el nombre de tu marca ante la SIC",
    summary: "Registrar tu marca evita que otros usen tu nombre y te da un activo que puedes defender.",
    points: [
      "El registro de marca se hace ante la Superintendencia de Industria y Comercio (SIC) y protege el nombre/logo por 10 anos renovables.",
      "Antes de invertir en empaque y publicidad, verifica que el nombre este disponible en la base de datos de la SIC.",
      "Registra en la clase de productos/servicios que corresponda a lo que vendes."
    ],
    sectors: ["General"],
    severity: "info"
  },
  {
    id: "sanitario-cosmeticos-invima",
    category: "Sanitario",
    title: "Cosmeticos: Notificacion Sanitaria ante el INVIMA",
    summary: "Jabones y cosmeticos requieren notificacion sanitaria para venderse legalmente.",
    points: [
      "Los productos cosmeticos (jabones, cremas, shampoos) requieren Notificacion Sanitaria Obligatoria (NSO) ante el INVIMA antes de comercializarse.",
      "Manten Buenas Practicas de Manufactura y formulas documentadas; te las pueden solicitar.",
      "Verifica si tu producto se clasifica como cosmetico o como aseo, porque cambia el tramite."
    ],
    sectors: ["Cosmetica y jabones"],
    severity: "important"
  },
  {
    id: "sanitario-alimentos-invima",
    category: "Sanitario",
    title: "Alimentos: registro/notificacion sanitaria y BPM",
    summary: "Si vendes alimentos, necesitas cumplir requisitos sanitarios segun el riesgo del producto.",
    points: [
      "Segun el producto, puede requerirse Notificacion, Permiso o Registro Sanitario ante el INVIMA.",
      "Aplica Buenas Practicas de Manufactura (BPM) e higiene en tu area de produccion.",
      "Algunos negocios requieren concepto sanitario favorable de la secretaria de salud local."
    ],
    sectors: ["Reposteria y alimentos"],
    severity: "important"
  },
  {
    id: "etiquetado-producto",
    category: "Etiquetado",
    title: "Etiquetado claro y conforme",
    summary: "Una etiqueta completa genera confianza y cumple las normas de informacion al consumidor.",
    points: [
      "Incluye nombre del producto, contenido/peso, ingredientes o composicion, datos del responsable y registro/notificacion cuando aplique.",
      "En alimentos y cosmeticos sigue las normas de rotulado (lote, fecha de vencimiento, modo de uso).",
      "Evita afirmaciones que no puedas respaldar (por ejemplo, efectos medicinales)."
    ],
    sectors: ["Cosmetica y jabones", "Reposteria y alimentos", "Velas y aromas"],
    severity: "info"
  },
  {
    id: "contratos-consignacion",
    category: "Contratos",
    title: "Acuerdos con tiendas y consignacion por escrito",
    summary: "Dejar por escrito las condiciones con tus puntos de venta evita conflictos de pago e inventario.",
    points: [
      "En consignacion, define quien asume perdidas o danos, plazos de pago y como se devuelve lo no vendido.",
      "Acuerda el porcentaje o comision y la periodicidad de liquidacion.",
      "Un documento simple firmado por ambas partes es suficiente para empezar."
    ],
    sectors: ["General"],
    severity: "info"
  },
  {
    id: "datos-habeas-data",
    category: "Datos",
    title: "Manejo legal de los datos de tus clientes (Habeas Data)",
    summary: "Si guardas datos de clientes (nombre, telefono, direccion), la Ley 1581 de 2012 te aplica.",
    points: [
      "Pide autorizacion para tratar los datos e informa para que los usaras.",
      "Permite a tus clientes consultar, actualizar o pedir la eliminacion de sus datos.",
      "No compartas las bases de datos de tus clientes sin su consentimiento."
    ],
    sectors: ["General"],
    severity: "info"
  }
];
