// Contenido legal de la plataforma. Borradores estructurados con marco
// colombiano (Ley 1581 de 2012 y Decreto 1377 de 2013 para datos personales).
// Los textos entre corchetes [ ] son placeholders que el responsable legal
// debe completar (razon social, NIT, correo de contacto, ciudad, etc.).

export type LegalDocKey = "terms" | "privacy";

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalDocument = {
  key: LegalDocKey;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

const CONTACT = "[correo de contacto]";
const ENTITY = "[RAZON SOCIAL / NOMBRE DEL RESPONSABLE]";

export const legalDocuments: Record<LegalDocKey, LegalDocument> = {
  terms: {
    key: "terms",
    title: "Terminos y Condiciones",
    updated: "14 de junio de 2026",
    intro:
      "Estos Terminos regulan el uso de la plataforma Emprendedos. Al crear una cuenta o usar el servicio, aceptas estas condiciones. Si no estas de acuerdo, no utilices la plataforma.",
    sections: [
      {
        heading: "1. Objeto del servicio",
        paragraphs: [
          "Emprendedos es una herramienta de organizacion y analisis para emprendimientos que producen y venden bienes fisicos. Permite registrar productos, insumos, ventas, gastos, recetas e inventario, y muestra indicadores como margen, punto de equilibrio y proyeccion de stock.",
          "La plataforma es una ayuda de gestion. No constituye asesoria contable, tributaria, financiera ni legal, ni reemplaza el criterio de un profesional."
        ]
      },
      {
        heading: "2. Cuenta y registro",
        paragraphs: [
          "Para usar el servicio debes crear una cuenta con datos veraces y mantener la confidencialidad de tu contrasena. Eres responsable de la actividad realizada desde tu cuenta.",
          "Cada cuenta corresponde a un emprendimiento (tenant). La informacion de un emprendimiento no es accesible por otros usuarios."
        ]
      },
      {
        heading: "3. Uso aceptable",
        paragraphs: [
          "Te comprometes a usar la plataforma conforme a la ley y a no: (i) ingresar informacion ilicita o de terceros sin autorizacion; (ii) intentar vulnerar la seguridad del servicio; (iii) usarla para fines distintos a la gestion de tu emprendimiento."
        ]
      },
      {
        heading: "4. Contenido del usuario",
        paragraphs: [
          "Los datos que cargas (productos, ventas, clientes, etc.) son de tu propiedad y responsabilidad. Nos otorgas una licencia limitada para almacenarlos y procesarlos con el unico fin de prestarte el servicio.",
          "Si cargas datos personales de tus clientes, declaras contar con autorizacion para tratarlos y te comprometes a cumplir la normativa de proteccion de datos aplicable."
        ]
      },
      {
        heading: "5. Disponibilidad y limitacion de responsabilidad",
        paragraphs: [
          "El servicio se ofrece “tal cual” y “segun disponibilidad”. Procuramos su continuidad pero no garantizamos que sea ininterrumpido o libre de errores.",
          "En la maxima medida permitida por la ley, no respondemos por decisiones de negocio tomadas con base en los indicadores de la plataforma, ni por perdidas indirectas. Los calculos son estimaciones a partir de los datos que ingresas."
        ]
      },
      {
        heading: "6. Propiedad intelectual",
        paragraphs: [
          "La plataforma, su marca, diseno y codigo son propiedad de " + ENTITY + " y estan protegidos por la ley. No se concede ningun derecho sobre ellos salvo el uso del servicio conforme a estos Terminos."
        ]
      },
      {
        heading: "7. Terminacion",
        paragraphs: [
          "Puedes dejar de usar el servicio en cualquier momento. Podemos suspender o cancelar cuentas que incumplan estos Terminos. Tras la terminacion podras solicitar la exportacion o supresion de tus datos conforme a la Politica de Tratamiento de Datos."
        ]
      },
      {
        heading: "8. Cambios",
        paragraphs: [
          "Podemos actualizar estos Terminos. Los cambios relevantes se informaran dentro de la plataforma. El uso continuado tras la actualizacion implica su aceptacion."
        ]
      },
      {
        heading: "9. Ley aplicable y contacto",
        paragraphs: [
          "Estos Terminos se rigen por las leyes de la Republica de Colombia. Cualquier controversia se resolvera ante los jueces competentes de [ciudad].",
          "Para dudas sobre estos Terminos, escribe a " + CONTACT + "."
        ]
      }
    ]
  },
  privacy: {
    key: "privacy",
    title: "Politica de Tratamiento de Datos Personales",
    updated: "14 de junio de 2026",
    intro:
      "Esta Politica describe como tratamos los datos personales en Emprendedos, en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demas normas concordantes de la Republica de Colombia (Habeas Data).",
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        paragraphs: [
          "Responsable: " + ENTITY + ", identificado con [NIT/C.C.], domiciliado en [ciudad], Colombia. Canal de atencion: " + CONTACT + "."
        ]
      },
      {
        heading: "2. Datos que recolectamos",
        paragraphs: [
          "Datos de cuenta: nombre, correo electronico y contrasena (almacenada de forma cifrada).",
          "Datos del emprendimiento: nombre del negocio, tipo de actividad, pais y moneda.",
          "Datos operativos que tu ingresas: productos, insumos, ventas, gastos, recetas e inventario. Si registras datos de tus clientes, actuas como responsable de esos datos y nosotros como encargados."
        ]
      },
      {
        heading: "3. Finalidades del tratamiento",
        paragraphs: [
          "Tratamos tus datos para: (i) crear y administrar tu cuenta; (ii) prestar las funciones de gestion y analisis del negocio; (iii) brindar soporte; (iv) garantizar la seguridad del servicio; (v) cumplir obligaciones legales.",
          "No vendemos tus datos ni los usamos para publicidad de terceros."
        ]
      },
      {
        heading: "4. Derechos del titular",
        paragraphs: [
          "Como titular tienes derecho a: conocer, actualizar y rectificar tus datos; solicitar prueba de la autorizacion; ser informado del uso dado a tus datos; revocar la autorizacion y solicitar la supresion cuando proceda; y acceder gratuitamente a ellos."
        ]
      },
      {
        heading: "5. Como ejercer tus derechos",
        paragraphs: [
          "Puedes ejercer tus derechos enviando una solicitud a " + CONTACT + ", indicando tu identificacion y la peticion concreta. Atenderemos consultas y reclamos en los terminos de la Ley 1581 de 2012."
        ]
      },
      {
        heading: "6. Seguridad de la informacion",
        paragraphs: [
          "Aplicamos medidas tecnicas y administrativas razonables para proteger los datos: cifrado de contrasenas, control de acceso por cuenta y aislamiento de la informacion entre emprendimientos. Ningun sistema es totalmente infalible, pero trabajamos para reducir los riesgos."
        ]
      },
      {
        heading: "7. Encargados y transferencias",
        paragraphs: [
          "Para operar utilizamos proveedores de infraestructura (alojamiento de la aplicacion y base de datos) que actuan como encargados bajo nuestras instrucciones. Estos proveedores pueden almacenar datos en servidores ubicados fuera de Colombia, aplicando estandares de seguridad adecuados."
        ]
      },
      {
        heading: "8. Conservacion y supresion",
        paragraphs: [
          "Conservamos los datos mientras tu cuenta este activa y durante el tiempo necesario para cumplir obligaciones legales. Puedes solicitar la exportacion o supresion de tus datos a traves del canal de contacto."
        ]
      },
      {
        heading: "9. Vigencia y cambios",
        paragraphs: [
          "Esta Politica rige desde su publicacion. Podemos actualizarla; los cambios se informaran dentro de la plataforma e indicaran la nueva fecha de actualizacion."
        ]
      }
    ]
  }
};
