export const ACTOR_META = {
  admin: {
    nombre: 'Administrador',
    short: 'ADM',
    badgeClass: 'bg-rose-100 text-rose-700 border border-rose-300',
    dotClass: 'bg-rose-500',
  },
  sistema: {
    nombre: 'Sistema / Backend',
    short: 'SYS',
    badgeClass: 'bg-violet-100 text-violet-700 border border-violet-300',
    dotClass: 'bg-violet-500',
  },
  consultora: {
    nombre: 'Consultora / Colaborador',
    short: 'CON',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-300',
    dotClass: 'bg-blue-500',
  },
  colaborador: {
    nombre: 'Colaborador asignado',
    short: 'COL',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-300',
    dotClass: 'bg-amber-500',
  },
  empresa: {
    nombre: 'Empresa cliente',
    short: 'EMP',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
    dotClass: 'bg-emerald-500',
  },
}

export const FLUJO_FASES = [
  {
    id: 'fase-1',
    titulo: 'Fase 1 - Registro y activacion de empresa consultora',
    descripcion:
      'El administrador crea la consultora, el sistema emite token y el titular activa su acceso inicial.',
    resumen:
      'La consultora queda activa y lista para iniciar configuracion operativa.',
    pasos: [
      {
        actor: 'admin',
        ubicacion: 'Portal de administracion',
        titulo: 'Inicio de registro',
        detalle: 'El administrador entra a Empresas Consultoras y ejecuta el alta de una nueva firma.',
      },
      {
        actor: 'admin',
        ubicacion: 'Formulario de alta',
        titulo: 'Carga de datos legales y contacto',
        detalle:
          'Registra razon social, NIT, representante legal, correo principal y datos de ubicacion.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Backend + DB',
        titulo: 'Validacion y creacion inicial',
        detalle:
          'Valida duplicados de NIT/correo, crea usuario tipo consultora y la empresa consultora en pendiente_activacion.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Servicio de correo',
        titulo: 'Envio de activacion',
        detalle: 'Genera token de activacion con vencimiento y envia enlace al titular de la consultora.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Landing de activacion',
        titulo: 'Activacion del titular',
        detalle: 'El titular abre el enlace, define contrasena fuerte y confirma primera activacion.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Seguridad + auditoria',
        titulo: 'Cierre de activacion',
        detalle:
          'Actualiza hash de contrasena, activa usuario, invalida token y registra evento en actividad_log.',
      },
    ],
  },
  {
    id: 'fase-2',
    titulo: 'Fase 2 - Configuracion inicial de la consultora',
    descripcion:
      'Se completa identidad visual, datos bancarios y plantilla operativa para habilitar operacion completa.',
    resumen:
      'La consultora pasa a activo_operativo y se habilitan modulos de trabajo.',
    pasos: [
      {
        actor: 'consultora',
        ubicacion: 'Asistente de configuracion',
        titulo: 'Ingreso al onboarding',
        detalle: 'Al primer login se obliga flujo en 4 pasos para completar configuracion minima requerida.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Paso 1 - Identidad',
        titulo: 'Marca y contacto visible',
        detalle: 'Sube logo, define color de marca, correo y telefono de soporte para portal cliente.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Storage + configuracion',
        titulo: 'Persistencia de identidad',
        detalle: 'Optimiza logo, almacena archivo y actualiza configuracion_consultora.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Paso 2 - Datos bancarios',
        titulo: 'Configuracion de cobranza',
        detalle: 'Registra banco, cuenta, titular, moneda y cuenta alterna opcional.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Paso 3 - Plantilla entrega',
        titulo: 'Definicion de campos operativos',
        detalle: 'Configura campos obligatorios/opcionales del formulario de entrega documental.',
      },
      {
        actor: 'sistema',
        ubicacion: 'configuracion_consultora.plantilla_entrega',
        titulo: 'Persistencia de plantilla JSON',
        detalle: 'Guarda plantilla estructurada y notificaciones por anticipacion de vencimientos.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Estado consultora',
        titulo: 'Activacion operativa',
        detalle:
          'Marca configuracion_completa=true, cambia estado a activo_operativo y habilita modulos principales.',
      },
    ],
  },
  {
    id: 'fase-3',
    titulo: 'Fase 3 - Creacion del equipo interno',
    descripcion:
      'La consultora crea colaboradores y el sistema aplica permisos por cargo con acceso diferenciado.',
    resumen:
      'El equipo queda activo con credenciales y matriz de permisos por modulo.',
    pasos: [
      {
        actor: 'consultora',
        ubicacion: 'Modulo Mi Equipo',
        titulo: 'Alta de colaborador',
        detalle: 'Registra colaborador con datos personales, correo, cargo y fecha de ingreso.',
      },
      {
        actor: 'sistema',
        ubicacion: 'usuarios + colaboradores',
        titulo: 'Creacion de credenciales',
        detalle: 'Crea usuario tipo colaborador, contrasena temporal y vinculo con consultora.',
      },
      {
        actor: 'sistema',
        ubicacion: 'colaborador_permisos',
        titulo: 'Permisos por defecto',
        detalle:
          'Asigna permisos base segun cargo: coordinador (full), analistas por modulo, asistente con alcance acotado.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Matriz de permisos',
        titulo: 'Ajuste fino de autorizaciones',
        detalle: 'La consultora ajusta toggles granulares y puede habilitar permiso de invitacion de empresa.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Correo de primer acceso',
        titulo: 'Entrega de acceso seguro',
        detalle: 'Envia credenciales temporales y obliga cambio de contrasena al primer login.',
      },
    ],
  },
  {
    id: 'fase-4',
    titulo: 'Fase 4 - Registro de empresa cliente',
    descripcion:
      'Se registra empresa cliente, se pueden generar credenciales de solo lectura y asignar colaboradores.',
    resumen:
      'La empresa cliente queda vinculada a la consultora y con acceso opcional habilitado.',
    pasos: [
      {
        actor: 'consultora',
        ubicacion: 'Modulo Mis Empresas',
        titulo: 'Creacion de empresa cliente',
        detalle:
          'Se carga ficha legal, contacto y representante; el sistema guarda empresa en estado activo.',
      },
      {
        actor: 'sistema',
        ubicacion: 'empresas_cliente',
        titulo: 'Validacion por consultora',
        detalle: 'Controla unicidad de NIT por consultora y registra trazabilidad de creacion.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Perfil de empresa',
        titulo: 'Generacion de acceso empresarial',
        detalle: 'Desde modal se confirma correo destino y se genera credencial de lectura.',
      },
      {
        actor: 'sistema',
        ubicacion: 'usuarios + empresas_cliente',
        titulo: 'Usuario empresa_cliente',
        detalle:
          'Crea usuario, vincula usuario_id en empresa cliente y envia credenciales iniciales por correo.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Asignacion operativa',
        titulo: 'Asignacion de responsables',
        detalle: 'Asocia colaboradores a la empresa en colaborador_empresa_cliente para su gestion diaria.',
      },
      {
        actor: 'empresa',
        ubicacion: 'Portal empresa',
        titulo: 'Primer ingreso de cliente',
        detalle: 'Empresa cambia contrasena temporal y accede al tablero de lectura con cobertura inicial.',
      },
    ],
  },
  {
    id: 'fase-5',
    titulo: 'Fase 5 - Registro de personal de empresa cliente',
    descripcion:
      'Se registra personal con datos completos y el sistema crea fichas AFP/CAJA/Ministerio automaticamente.',
    resumen:
      'Cada empleado queda operativo para gestion documental por modulos.',
    pasos: [
      {
        actor: 'colaborador',
        ubicacion: 'Perfil de empresa > Personal',
        titulo: 'Alta de empleado',
        detalle: 'Registra datos personales, laborales y contexto base de AFP/CAJA si aplica.',
      },
      {
        actor: 'sistema',
        ubicacion: 'personal',
        titulo: 'Validacion de CI por empresa',
        detalle: 'Evita duplicidad de CI por empresa y guarda registrado_por para auditoria operativa.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Trigger tg_personal_fichas',
        titulo: 'Creacion automatica de fichas',
        detalle: 'Inserta registros iniciales en personal_afp, personal_caja y personal_ministerio con sin_datos.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Alertas + metricas',
        titulo: 'Estado inicial y cobertura',
        detalle: 'Genera alerta informativa por pendientes y recalcula coberturas de la empresa.',
      },
    ],
  },
  {
    id: 'fase-6',
    titulo: 'Fase 6 - Gestion AFP y carga documental',
    descripcion:
      'El analista AFP carga obligatorios por periodo y el sistema actualiza cumplimiento a al_dia si corresponde.',
    resumen:
      'Modulo AFP cambia a verde al completar obligatorios vigentes.',
    pasos: [
      {
        actor: 'colaborador',
        ubicacion: 'Perfil empleado > Tab AFP',
        titulo: 'Revision de catalogo AFP',
        detalle: 'Visualiza tipos obligatorios/opcionales para controlar que evidencia falta.',
      },
      {
        actor: 'colaborador',
        ubicacion: 'Modal de subida',
        titulo: 'Carga de planilla y comprobantes',
        detalle: 'Sube archivo, periodo y observacion para documentos recurrentes del mes.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Storage + documentos',
        titulo: 'Validacion tecnica y versionado',
        detalle: 'Valida formato/tamano, guarda archivo y marca versiones anteriores como no vigentes.',
      },
      {
        actor: 'sistema',
        ubicacion: 'personal_afp.estado',
        titulo: 'Evaluacion de cumplimiento AFP',
        detalle: 'Si todos los obligatorios vigentes estan presentes, cambia estado a al_dia.',
      },
      {
        actor: 'empresa',
        ubicacion: 'Portal de lectura',
        titulo: 'Visualizacion de evidencia',
        detalle: 'La empresa cliente descarga documentos y ve badges de cumplimiento en tiempo real.',
      },
    ],
  },
  {
    id: 'fase-7',
    titulo: 'Fase 7 - Gestion CAJA',
    descripcion:
      'Flujo CAJA analogo a AFP con reglas de obligatorios por catalogo y estado de cumplimiento.',
    resumen:
      'CAJA queda al_dia con obligatorios completos del periodo.',
    pasos: [
      {
        actor: 'colaborador',
        ubicacion: 'Tab CAJA',
        titulo: 'Control de documentos CAJA',
        detalle: 'Carga formulario de afiliacion y poliza mensual con periodo actual.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Reglas de negocio',
        titulo: 'Distincion obligatorio vs opcional',
        detalle: 'Solo obligatorios impactan estado; opcionales faltantes no degradan cumplimiento.',
      },
      {
        actor: 'sistema',
        ubicacion: 'personal_caja.estado',
        titulo: 'Calculo de cumplimiento',
        detalle: 'Actualiza al_dia cuando obligatorios vigentes existen y recalcula cobertura CAJA.',
      },
    ],
  },
  {
    id: 'fase-8',
    titulo: 'Fase 8 - Gestion Ministerio de Trabajo',
    descripcion:
      'Se gestionan contrato, planilla mensual y comprobante MT con alertamiento por periodo faltante.',
    resumen:
      'El sistema pasa de pendiente a al_dia al completar planilla del periodo vigente.',
    pasos: [
      {
        actor: 'colaborador',
        ubicacion: 'Tab Ministerio',
        titulo: 'Carga de documentos base',
        detalle: 'Sube contrato y comprobante de registro MT para habilitar estructura minima.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Validacion por periodo',
        titulo: 'Deteccion de planilla faltante',
        detalle: 'Si la planilla mensual vigente no existe, crea alerta urgente automatica.',
      },
      {
        actor: 'sistema',
        ubicacion: 'estado_cumplimiento',
        titulo: 'Estado intermedio pendiente',
        detalle: 'Con documentos parciales pasa a pendiente, manteniendo trazabilidad de brecha.',
      },
      {
        actor: 'colaborador',
        ubicacion: 'Carga posterior de planilla',
        titulo: 'Regularizacion del mes actual',
        detalle: 'Sube planilla vigente, dejando anteriores en historial para auditoria.',
      },
      {
        actor: 'sistema',
        ubicacion: 'alertas + personal_ministerio',
        titulo: 'Resolucion automatica',
        detalle: 'Marca alerta resuelta, actualiza estado a al_dia y recalcula cobertura de empresa.',
      },
    ],
  },
  {
    id: 'fase-9',
    titulo: 'Fase 9 - Alertas automaticas y pendientes',
    descripcion:
      'Un proceso diario evalua cumplimiento global y dispara alertas con priorizacion y asignacion.',
    resumen:
      'El monitoreo proactivo reduce incumplimientos y guia al equipo con tareas accionables.',
    pasos: [
      {
        actor: 'sistema',
        ubicacion: 'Scheduler diario 07:00',
        titulo: 'Evaluacion masiva de cumplimiento',
        detalle: 'Recorre empleados activos y compara documentos vigentes contra catalogo obligatorio.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Motor de alertas',
        titulo: 'Generacion por modulo y vencimiento',
        detalle: 'Emite alertas urgentes/normales segun criticidad y cercania de fecha limite.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Notificaciones',
        titulo: 'Envio a consultora y responsables',
        detalle: 'Notifica resumen al titular y tareas puntuales a analistas por modulo.',
      },
      {
        actor: 'consultora',
        ubicacion: 'Panel de alertas',
        titulo: 'Priorizacion y asignacion',
        detalle: 'Filtra por empresa/modulo y asigna responsable explicito para cada pendiente.',
      },
      {
        actor: 'colaborador',
        ubicacion: 'Dashboard de tareas',
        titulo: 'Resolucion guiada',
        detalle: 'Ingresa por enlace directo al caso, sube documento faltante y cierra alerta.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Auditoria',
        titulo: 'Cierre trazable',
        detalle: 'Marca alerta resuelta con usuario/fecha y actualiza estado de cumplimiento asociado.',
      },
    ],
  },
  {
    id: 'fase-10',
    titulo: 'Fase 10 - Portal empresa cliente (solo lectura)',
    descripcion:
      'La empresa cliente monitorea cobertura y documentos propios sin permisos de edicion ni carga.',
    resumen:
      'Se garantiza transparencia para cliente y seguridad por segregacion estricta de acceso.',
    pasos: [
      {
        actor: 'empresa',
        ubicacion: 'Login empresa_cliente',
        titulo: 'Acceso restringido por rol',
        detalle: 'El sistema carga interfaz de lectura validando tipo y alcance empresarial.',
      },
      {
        actor: 'empresa',
        ubicacion: 'Dashboard',
        titulo: 'Seguimiento de KPIs',
        detalle: 'Visualiza cobertura AFP/CAJA/Ministerio y empleados con pendientes vigentes.',
      },
      {
        actor: 'empresa',
        ubicacion: 'Perfil de empleado',
        titulo: 'Consulta documental',
        detalle: 'Puede revisar y descargar archivos vigentes con metadatos de periodo y fecha de subida.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Control de acceso',
        titulo: 'Aislamiento de datos por empresa',
        detalle: 'Bloquea acceso cross-empresa con 403 y registra intentos no autorizados.',
      },
      {
        actor: 'empresa',
        ubicacion: 'Seccion Mi consultora',
        titulo: 'Datos bancarios y soporte',
        detalle: 'Consulta datos de cobro, correo y telefono de soporte de su consultora.',
      },
      {
        actor: 'sistema',
        ubicacion: 'Seguridad funcional',
        titulo: 'Bloqueo de acciones de escritura',
        detalle: 'No expone botones de editar/subir/eliminar y audita descargas realizadas.',
      },
    ],
  },
]
