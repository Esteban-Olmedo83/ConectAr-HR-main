import type { Employee, Structure, Documento, TimeOffRequest, Vacancy, Sucursal } from './definitions';

// ─── Structure ───────────────────────────────────────────────────────────────

export const initialStructure: Structure = {
  "Datos Personales": {
    "Datos Principales": [
      "Nombre y Apellido", "Email", "Fecha de Nacimiento", "Nacionalidad", "CUIL", "DNI", "Sexo", "Estado Civil",
      "Domicilio", "Piso", "Depto", "Localidad", "Provincia", "C.P.", "Teléfono"
    ],
    "Datos Adicionales": [
      { name: "Grupo Sanguíneo", type: 'Texto', defaultValue: 'No especificado' },
    ]
  },
  "Datos de la Empresa": {
    "Datos del Legajo": ["Nº de Legajo", "Fecha de Ingreso", "Fecha de Egreso", "Antigüedad", "Categoría", "Tarea", "Sector", "Dependencia", "Reporta A"],
    "Horario y Asignación": ["Tipo de Horario", "Días Laborales", "Sucursal (Presencial)"],
    "Datos de Registración": ["Modalidad de Contrato", "Obra Social", "ART", "Situación de Revista", "Régimen", "Tipo de Servicio", "Convenio Colectivo", "Puesto", "Retribución Pactada", "Mod. Liquidación", "Domicilio de Explotación", "Actividad Económica"],
    "Datos Bancarios": ["Banco", "Nº de Cuenta", "CBU", "Alias"],
    "Datos Adicionales": [
      { name: "Talle de Camisa", type: 'Texto', defaultValue: 'No especificado' },
    ]
  },
  "Documentación": []
};

// ─── Horario helpers ─────────────────────────────────────────────────────────

function diasPresencial(sucursal: Sucursal) {
  const dia = (s: Sucursal) => ({ trabaja: true, sucursal: s, horarioEntrada: '09:00', horarioSalida: '18:00' });
  const finde = { trabaja: false, sucursal: 'No aplica' as Sucursal, horarioEntrada: '', horarioSalida: '' };
  return { lunes: dia(sucursal), martes: dia(sucursal), miercoles: dia(sucursal), jueves: dia(sucursal), viernes: dia(sucursal), sabado: finde, domingo: finde };
}

function diasHibrido(sucursal: Sucursal) {
  const of = { trabaja: true, sucursal: 'Home Office' as Sucursal, horarioEntrada: '09:00', horarioSalida: '18:00' };
  const pr = { trabaja: true, sucursal, horarioEntrada: '09:00', horarioSalida: '18:00' };
  const finde = { trabaja: false, sucursal: 'No aplica' as Sucursal, horarioEntrada: '', horarioSalida: '' };
  return { lunes: of, martes: pr, miercoles: of, jueves: pr, viernes: of, sabado: finde, domingo: finde };
}

function diasRemoto() {
  const of = { trabaja: true, sucursal: 'Home Office' as Sucursal, horarioEntrada: '10:00', horarioSalida: '19:00' };
  const finde = { trabaja: false, sucursal: 'No aplica' as Sucursal, horarioEntrada: '', horarioSalida: '' };
  return { lunes: of, martes: of, miercoles: of, jueves: of, viernes: of, sabado: finde, domingo: finde };
}

const SEDE_BA  = 'Sucursal Principal' as Sucursal;
const SEDE_ROS = 'Sucursal Externa' as Sucursal;
const SEDE_COR = 'Sucursal Externa' as Sucursal;

// ─── 20 Empleados ────────────────────────────────────────────────────────────

const employeesData: Omit<Employee, 'id'>[] = [
  // ── 001 · Esteban Olmedo · CEO ────────────────────────────────────────────
  {
    name: 'Esteban Olmedo', email: 'eolmedo@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=EstebanOlmedo',
    fechaEgreso: null, reportaA: null, ultimaModificacion: null,
    personal: { fechaNacimiento: '15/07/1983', nacionalidad: 'Argentina', cuil: '20-83715234-9', dni: '28.371.523', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. Rivadavia', numero: '4500', piso: 'PB', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1424' }, telefono: '+54 9 11 5555-0001', customFields: { "Grupo Sanguíneo": "O+" } },
    empresa: { legajo: '001', fechaIngreso: '15/01/2020', antiguedad: '6 años, 3 meses', categoria: 'Dirección', tarea: 'DIRECCIÓN GENERAL', sector: 'Dirección', dependencia: 'Dirección General', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "L" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '400909', descripcion: 'OS Acción Social de Empresarios' }, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: 'Fuera de Convenio', puesto: 'Director General', retribucionPactada: '1500000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Dirección de empresas' },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CC $ 00100-1', cbu: '0070001000100010001001', alias: 'ESTEBAN.OLMEDO.GALICIA' }, documentacion: [],
  },

  // ── 002 · María Elena González · Gerente RRHH ────────────────────────────
  {
    name: 'María Elena González', email: 'mgonzalez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=MariaGonzalez',
    fechaEgreso: null, reportaA: '001', ultimaModificacion: null,
    personal: { fechaNacimiento: '22/03/1985', nacionalidad: 'Argentina', cuil: '27-28456789-3', dni: '28.456.789', sexo: 'Femenino', estadoCivil: 'Casada', domicilio: { calle: 'Mendoza', numero: '1234', piso: '2', depto: 'B', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1428' }, telefono: '+54 9 11 5555-0002', customFields: { "Grupo Sanguíneo": "A+" } },
    empresa: { legajo: '002', fechaIngreso: '01/03/2021', antiguedad: '5 años, 2 meses', categoria: 'Gerencia', tarea: 'GERENCIA DE RRHH', sector: 'RRHH', dependencia: 'Gerencia de RRHH', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Gerente de RRHH', retribucionPactada: '850000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Gestión de recursos humanos' },
    bancarios: { banco: 'Banco Santander', cuenta: 'CA $ 00200-2', cbu: '0720002000200020002002', alias: 'MARIA.GONZALEZ.SANTA' }, documentacion: [],
  },

  // ── 003 · Juan Pablo Fernández · CTO ─────────────────────────────────────
  {
    name: 'Juan Pablo Fernández', email: 'jfernandez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=JuanFernandez',
    fechaEgreso: null, reportaA: '001', ultimaModificacion: null,
    personal: { fechaNacimiento: '08/11/1988', nacionalidad: 'Argentina', cuil: '20-32178456-5', dni: '32.178.456', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Billinghurst', numero: '890', piso: '3', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1174' }, telefono: '+54 9 11 5555-0003', customFields: { "Grupo Sanguíneo": "B+" } },
    empresa: { legajo: '003', fechaIngreso: '15/06/2021', antiguedad: '4 años, 10 meses', categoria: 'Gerencia', tarea: 'GERENCIA DE TECNOLOGÍA', sector: 'Tecnología', dependencia: 'Gerencia de Tecnología', horario: { tipo: 'Híbrido', dias: diasHibrido(SEDE_BA), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '902900', descripcion: 'OMINT' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Desarrollo de Software', convenioColectivo: 'Fuera de Convenio', puesto: 'CTO', retribucionPactada: '1200000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Servicios de software' },
    bancarios: { banco: 'Banco BBVA', cuenta: 'CC $ 00300-3', cbu: '0170003000300030003003', alias: 'JUAN.FERNANDEZ.BBVA' }, documentacion: [],
  },

  // ── 004 · Laura Rodríguez · Gerente Comercial ─────────────────────────────
  {
    name: 'Laura Rodríguez', email: 'lrodriguez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=LauraRodriguez',
    fechaEgreso: null, reportaA: '001', ultimaModificacion: null,
    personal: { fechaNacimiento: '14/05/1986', nacionalidad: 'Argentina', cuil: '27-30234567-4', dni: '30.234.567', sexo: 'Femenino', estadoCivil: 'Casada', domicilio: { calle: 'Scalabrini Ortiz', numero: '2100', piso: '5', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5555-0004', customFields: { "Grupo Sanguíneo": "AB+" } },
    empresa: { legajo: '004', fechaIngreso: '01/02/2022', antiguedad: '4 años, 3 meses', categoria: 'Gerencia', tarea: 'GERENCIA COMERCIAL', sector: 'Ventas y Comercial', dependencia: 'Gerencia Comercial', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "XS" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901105', descripcion: 'GALENO ARGENTINA S.A.' }, art: 'Berkley International ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Gerente Comercial', retribucionPactada: '950000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Gestión comercial' },
    bancarios: { banco: 'Banco Itaú', cuenta: 'CA $ 00400-4', cbu: '2590004000400040004004', alias: 'LAURA.RODRIGUEZ.ITAU' }, documentacion: [],
  },

  // ── 005 · Ricardo Morales · Contador / Gerente Financiero ─────────────────
  {
    name: 'Ricardo Morales', email: 'rmorales@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=RicardoMorales',
    fechaEgreso: null, reportaA: '001', ultimaModificacion: null,
    personal: { fechaNacimiento: '11/09/1987', nacionalidad: 'Argentina', cuil: '20-31234567-8', dni: '31.234.567', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Deán Funes', numero: '456', piso: '2', depto: 'B', localidad: 'Córdoba', provincia: 'Córdoba', cp: 'X5000' }, telefono: '+54 9 351 5555-0005', customFields: { "Grupo Sanguíneo": "O-" } },
    empresa: { legajo: '005', fechaIngreso: '01/09/2021', antiguedad: '4 años, 8 meses', categoria: 'Gerencia', tarea: 'GERENCIA FINANCIERA', sector: 'Administración y Finanzas', dependencia: 'Gerencia Financiera', horario: { tipo: 'Híbrido', dias: diasHibrido(SEDE_COR), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "L" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '400909', descripcion: 'OS Acción Social de Empresarios' }, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: 'Fuera de Convenio', puesto: 'Contador General', retribucionPactada: '980000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Hipólito Yrigoyen 220, Córdoba', actividadEconomica: 'Servicios contables' },
    bancarios: { banco: 'Banco de Córdoba', cuenta: 'CA $ 00500-5', cbu: '0270005000500050005005', alias: 'RICARDO.MORALES.BANCOR' }, documentacion: [],
  },

  // ── 006 · Marcelo Aguirre · Jefe de Operaciones ───────────────────────────
  {
    name: 'Marcelo Aguirre', email: 'maguirre@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=MarceloAguirre',
    fechaEgreso: null, reportaA: '001', ultimaModificacion: null,
    personal: { fechaNacimiento: '03/04/1982', nacionalidad: 'Argentina', cuil: '20-27890123-6', dni: '27.890.123', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. San Martín', numero: '3400', piso: '', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1416' }, telefono: '+54 9 11 5555-0006', customFields: { "Grupo Sanguíneo": "A-" } },
    empresa: { legajo: '006', fechaIngreso: '10/03/2020', antiguedad: '6 años, 2 meses', categoria: 'Jefatura', tarea: 'JEFATURA DE OPERACIONES', sector: 'Operaciones', dependencia: 'Jefatura de Operaciones', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "XL" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Jefe de Operaciones', retribucionPactada: '720000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Logística y operaciones' },
    bancarios: { banco: 'Banco Provincia', cuenta: 'CA $ 00600-6', cbu: '0140006000600060006006', alias: 'MARCELO.AGUIRRE.BAPRO' }, documentacion: [],
  },

  // ── 007 · Sebastián Torres · Jefe de Marketing ───────────────────────────
  {
    name: 'Sebastián Torres', email: 'storres@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=SebastianTorres',
    fechaEgreso: null, reportaA: '001', ultimaModificacion: null,
    personal: { fechaNacimiento: '19/12/1990', nacionalidad: 'Argentina', cuil: '20-35678901-2', dni: '35.678.901', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Guatemala', numero: '5678', piso: '1', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5555-0007', customFields: { "Grupo Sanguíneo": "B-" } },
    empresa: { legajo: '007', fechaIngreso: '01/07/2022', antiguedad: '3 años, 10 meses', categoria: 'Jefatura', tarea: 'JEFATURA DE MARKETING', sector: 'Marketing', dependencia: 'Jefatura de Marketing', horario: { tipo: 'Híbrido', dias: diasHibrido(SEDE_BA), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901105', descripcion: 'GALENO ARGENTINA S.A.' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Marketing y Publicidad', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Jefe de Marketing', retribucionPactada: '680000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Publicidad y marketing' },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CA $ 00700-7', cbu: '0070007000700070007007', alias: 'SEBASTIAN.TORRES.GALI' }, documentacion: [],
  },

  // ── 008 · Ana García · Analista RRHH Senior ──────────────────────────────
  {
    name: 'Ana García', email: 'agarcia@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=AnaGarcia',
    fechaEgreso: null, reportaA: '002', ultimaModificacion: null,
    personal: { fechaNacimiento: '07/06/1993', nacionalidad: 'Argentina', cuil: '27-37654321-5', dni: '37.654.321', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Thames', numero: '567', piso: 'PB', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5555-0008', customFields: { "Grupo Sanguíneo": "A+" } },
    empresa: { legajo: '008', fechaIngreso: '01/08/2022', antiguedad: '3 años, 9 meses', categoria: 'Analista', tarea: 'ANÁLISIS Y GESTIÓN DE RRHH', sector: 'RRHH', dependencia: 'Gerencia de RRHH', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista RRHH Sr.', retribucionPactada: '420000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Gestión de recursos humanos' },
    bancarios: { banco: 'Banco Ciudad', cuenta: 'CA $ 00800-8', cbu: '0290008000800080008008', alias: 'ANA.GARCIA.CIUDAD' }, documentacion: [],
  },

  // ── 009 · Carlos Martínez · Analista RRHH Jr. ───────────────────────────
  {
    name: 'Carlos Martínez', email: 'cmartinez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=CarlosMartinez',
    fechaEgreso: null, reportaA: '002', ultimaModificacion: null,
    personal: { fechaNacimiento: '30/08/1997', nacionalidad: 'Argentina', cuil: '20-42345678-9', dni: '42.345.678', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Av. Corrientes', numero: '3456', piso: '1', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1193' }, telefono: '+54 9 11 5555-0009', customFields: { "Grupo Sanguíneo": "O+" } },
    empresa: { legajo: '009', fechaIngreso: '01/04/2024', antiguedad: '1 año, 1 mes', categoria: 'Analista', tarea: 'ANÁLISIS DE RRHH', sector: 'RRHH', dependencia: 'Gerencia de RRHH', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Determinado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista RRHH Jr.', retribucionPactada: '280000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Gestión de recursos humanos' },
    bancarios: { banco: 'Banco Macro', cuenta: 'CA $ 00900-9', cbu: '2850009000900090009009', alias: 'CARLOS.MARTINEZ.MACRO' }, documentacion: [],
  },

  // ── 010 · Valentina Sánchez · Desarrolladora Full Stack ──────────────────
  {
    name: 'Valentina Sánchez', email: 'vsanchez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=ValentinaSanchez',
    fechaEgreso: null, reportaA: '003', ultimaModificacion: null,
    personal: { fechaNacimiento: '25/06/1996', nacionalidad: 'Argentina', cuil: '27-41234567-8', dni: '41.234.567', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'San Martín', numero: '890', piso: '4', depto: 'A', localidad: 'Rosario', provincia: 'Santa Fe', cp: '2000' }, telefono: '+54 9 341 5555-0010', customFields: { "Grupo Sanguíneo": "AB-" } },
    empresa: { legajo: '010', fechaIngreso: '01/02/2024', antiguedad: '1 año, 3 meses', categoria: 'Especialista', tarea: 'DESARROLLO FULL STACK', sector: 'Tecnología', dependencia: 'Gerencia de Tecnología', horario: { tipo: 'Remoto', dias: diasRemoto(), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "XS" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '902900', descripcion: 'OMINT' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Desarrollo de Software', convenioColectivo: 'CCT CESSI', puesto: 'Desarrolladora Full Stack', retribucionPactada: '580000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Córdoba 1080, Rosario', actividadEconomica: 'Servicios de software' },
    bancarios: { banco: 'Banco Municipal de Rosario', cuenta: 'CA $ 01000-0', cbu: '0650010001000100010010', alias: 'VALENTINA.SANCHEZ.MUNIROSario' }, documentacion: [],
  },

  // ── 011 · Ramiro Blanco · Desarrollador Backend ───────────────────────────
  {
    name: 'Ramiro Blanco', email: 'rblanco@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=RamiroBlanco',
    fechaEgreso: null, reportaA: '003', ultimaModificacion: null,
    personal: { fechaNacimiento: '14/02/1994', nacionalidad: 'Argentina', cuil: '20-39876543-1', dni: '39.876.543', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Av. Pueyrredón', numero: '1800', piso: '7', depto: 'F', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1119' }, telefono: '+54 9 11 5555-0011', customFields: { "Grupo Sanguíneo": "A+" } },
    empresa: { legajo: '011', fechaIngreso: '15/05/2023', antiguedad: '1 año, 11 meses', categoria: 'Especialista', tarea: 'DESARROLLO BACKEND', sector: 'Tecnología', dependencia: 'Gerencia de Tecnología', horario: { tipo: 'Híbrido', dias: diasHibrido(SEDE_BA), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "L" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Desarrollo de Software', convenioColectivo: 'CCT CESSI', puesto: 'Desarrollador Backend', retribucionPactada: '520000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Servicios de software' },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CA $ 01100-1', cbu: '0070011001100110011011', alias: 'RAMIRO.BLANCO.GALICIA' }, documentacion: [],
  },

  // ── 012 · Florencia Ibáñez · Analista QA ─────────────────────────────────
  {
    name: 'Florencia Ibáñez', email: 'fibanez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=FlorenciaIbanez',
    fechaEgreso: null, reportaA: '003', ultimaModificacion: null,
    personal: { fechaNacimiento: '28/09/1995', nacionalidad: 'Argentina', cuil: '27-40654321-7', dni: '40.654.321', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Godoy Cruz', numero: '1234', piso: '2', depto: 'C', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5555-0012', customFields: { "Grupo Sanguíneo": "B+" } },
    empresa: { legajo: '012', fechaIngreso: '01/10/2023', antiguedad: '1 año, 7 meses', categoria: 'Analista', tarea: 'CONTROL DE CALIDAD DE SOFTWARE', sector: 'Tecnología', dependencia: 'Gerencia de Tecnología', horario: { tipo: 'Híbrido', dias: diasHibrido(SEDE_BA), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Desarrollo de Software', convenioColectivo: 'CCT CESSI', puesto: 'Analista QA', retribucionPactada: '390000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Servicios de software' },
    bancarios: { banco: 'Banco Supervielle', cuenta: 'CA $ 01200-2', cbu: '0270012001200120012012', alias: 'FLORENCIA.IBANEZ.SUPER' }, documentacion: [],
  },

  // ── 013 · Luciana Pereyra · Diseñadora UX/UI ─────────────────────────────
  {
    name: 'Luciana Pereyra', email: 'lpereyra@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=LucianaPereyra',
    fechaEgreso: null, reportaA: '003', ultimaModificacion: null,
    personal: { fechaNacimiento: '16/01/1998', nacionalidad: 'Argentina', cuil: '27-43123456-0', dni: '43.123.456', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'El Salvador', numero: '4567', piso: '', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5555-0013', customFields: { "Grupo Sanguíneo": "O+" } },
    empresa: { legajo: '013', fechaIngreso: '01/03/2024', antiguedad: '1 año, 2 meses', categoria: 'Especialista', tarea: 'DISEÑO UX/UI', sector: 'Tecnología', dependencia: 'Gerencia de Tecnología', horario: { tipo: 'Remoto', dias: diasRemoto(), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "XS" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Diseño y Creatividad', convenioColectivo: 'CCT CESSI', puesto: 'Diseñadora UX/UI', retribucionPactada: '450000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Servicios de diseño digital' },
    bancarios: { banco: 'Banco ICBC', cuenta: 'CA $ 01300-3', cbu: '0150013001300130013013', alias: 'LUCIANA.PEREYRA.ICBC' }, documentacion: [],
  },

  // ── 014 · Diego Pérez · Ejecutivo de Ventas ──────────────────────────────
  {
    name: 'Diego Pérez', email: 'dperez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=DiegoPerez',
    fechaEgreso: null, reportaA: '004', ultimaModificacion: null,
    personal: { fechaNacimiento: '03/12/1991', nacionalidad: 'Argentina', cuil: '20-36789012-3', dni: '36.789.012', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. Corrientes', numero: '2890', piso: '3', depto: 'B', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1193' }, telefono: '+54 9 11 5555-0014', customFields: { "Grupo Sanguíneo": "A-" } },
    empresa: { legajo: '014', fechaIngreso: '15/01/2023', antiguedad: '2 años, 3 meses', categoria: 'Ejecutivo', tarea: 'EJECUTIVO DE VENTAS', sector: 'Ventas y Comercial', dependencia: 'Gerencia Comercial', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901105', descripcion: 'GALENO ARGENTINA S.A.' }, art: 'Berkley International ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Ejecutivo de Ventas', retribucionPactada: '340000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Ventas y CRM' },
    bancarios: { banco: 'Banco Santander', cuenta: 'CA $ 01400-4', cbu: '0720014001400140014014', alias: 'DIEGO.PEREZ.SANTA' }, documentacion: [],
  },

  // ── 015 · Natalia Vega · Ejecutiva de Ventas ─────────────────────────────
  {
    name: 'Natalia Vega', email: 'nvega@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=NataliaVega',
    fechaEgreso: null, reportaA: '004', ultimaModificacion: null,
    personal: { fechaNacimiento: '21/05/1993', nacionalidad: 'Argentina', cuil: '27-38765432-1', dni: '38.765.432', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Lavalle', numero: '1234', piso: '5', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1048' }, telefono: '+54 9 11 5555-0015', customFields: { "Grupo Sanguíneo": "B+" } },
    empresa: { legajo: '015', fechaIngreso: '01/06/2023', antiguedad: '1 año, 11 meses', categoria: 'Ejecutivo', tarea: 'EJECUTIVA DE VENTAS', sector: 'Ventas y Comercial', dependencia: 'Gerencia Comercial', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "XS" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901105', descripcion: 'GALENO ARGENTINA S.A.' }, art: 'Berkley International ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Ejecutiva de Ventas', retribucionPactada: '320000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Ventas y CRM' },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CA $ 01500-5', cbu: '0070015001500150015015', alias: 'NATALIA.VEGA.GALICIA' }, documentacion: [],
  },

  // ── 016 · Pablo Molina · Ejecutivo de Ventas Rosario ─────────────────────
  {
    name: 'Pablo Molina', email: 'pmolina@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=PabloMolina',
    fechaEgreso: null, reportaA: '004', ultimaModificacion: null,
    personal: { fechaNacimiento: '09/08/1989', nacionalidad: 'Argentina', cuil: '20-33456789-4', dni: '33.456.789', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Córdoba', numero: '1500', piso: '2', depto: 'C', localidad: 'Rosario', provincia: 'Santa Fe', cp: '2000' }, telefono: '+54 9 341 5555-0016', customFields: { "Grupo Sanguíneo": "O+" } },
    empresa: { legajo: '016', fechaIngreso: '01/09/2022', antiguedad: '2 años, 8 meses', categoria: 'Ejecutivo', tarea: 'VENTAS ZONA LITORAL', sector: 'Ventas y Comercial', dependencia: 'Gerencia Comercial', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_ROS), sucursalFijo: SEDE_ROS }, customFields: { "Talle de Camisa": "L" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901105', descripcion: 'GALENO ARGENTINA S.A.' }, art: 'Berkley International ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Ejecutivo de Ventas Zona Litoral', retribucionPactada: '350000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Córdoba 1080, Rosario', actividadEconomica: 'Ventas y CRM' },
    bancarios: { banco: 'Banco Macro', cuenta: 'CA $ 01600-6', cbu: '2850016001600160016016', alias: 'PABLO.MOLINA.MACRO' }, documentacion: [],
  },

  // ── 017 · Tomás Castro · Analista Financiero ─────────────────────────────
  {
    name: 'Tomás Castro', email: 'tcastro@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=TomasCastro',
    fechaEgreso: null, reportaA: '005', ultimaModificacion: null,
    personal: { fechaNacimiento: '27/03/1996', nacionalidad: 'Argentina', cuil: '20-41098765-3', dni: '41.098.765', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Av. del Libertador', numero: '6789', piso: '4', depto: 'B', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1428' }, telefono: '+54 9 11 5555-0017', customFields: { "Grupo Sanguíneo": "AB+" } },
    empresa: { legajo: '017', fechaIngreso: '01/03/2025', antiguedad: '2 meses', categoria: 'Analista', tarea: 'ANÁLISIS FINANCIERO', sector: 'Administración y Finanzas', dependencia: 'Gerencia Financiera', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista Financiero', retribucionPactada: '310000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Servicios contables' },
    bancarios: { banco: 'Banco Ciudad', cuenta: 'CA $ 01700-7', cbu: '0290017001700170017017', alias: 'TOMAS.CASTRO.CIUDAD' }, documentacion: [],
  },

  // ── 018 · Paola Suárez · Administrativa ──────────────────────────────────
  {
    name: 'Paola Suárez', email: 'psuarez@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=PaolaSuarez',
    fechaEgreso: null, reportaA: '006', ultimaModificacion: null,
    personal: { fechaNacimiento: '12/11/1992', nacionalidad: 'Argentina', cuil: '27-37890123-6', dni: '37.890.123', sexo: 'Femenino', estadoCivil: 'Casada', domicilio: { calle: 'Rivadavia', numero: '5678', piso: '1', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1424' }, telefono: '+54 9 11 5555-0018', customFields: { "Grupo Sanguíneo": "O-" } },
    empresa: { legajo: '018', fechaIngreso: '01/06/2021', antiguedad: '4 años, 11 meses', categoria: 'Empleado', tarea: 'ADMINISTRACIÓN GENERAL', sector: 'Operaciones', dependencia: 'Jefatura de Operaciones', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Administrativa', retribucionPactada: '260000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Administración general' },
    bancarios: { banco: 'Banco Provincia', cuenta: 'CA $ 01800-8', cbu: '0140018001800180018018', alias: 'PAOLA.SUAREZ.BAPRO' }, documentacion: [],
  },

  // ── 019 · Gabriela Herrera · Analista Operaciones ────────────────────────
  {
    name: 'Gabriela Herrera', email: 'gherrera@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=GabrielaHerrera',
    fechaEgreso: null, reportaA: '006', ultimaModificacion: null,
    personal: { fechaNacimiento: '05/07/1994', nacionalidad: 'Argentina', cuil: '27-39543210-8', dni: '39.543.210', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. Brasil', numero: '890', piso: '', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1154' }, telefono: '+54 9 11 5555-0019', customFields: { "Grupo Sanguíneo": "A+" } },
    empresa: { legajo: '019', fechaIngreso: '15/08/2023', antiguedad: '1 año, 8 meses', categoria: 'Analista', tarea: 'ANÁLISIS DE OPERACIONES', sector: 'Operaciones', dependencia: 'Jefatura de Operaciones', horario: { tipo: 'Presencial', dias: diasPresencial(SEDE_BA), sucursalFijo: SEDE_BA }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '901402', descripcion: 'MEDIFE ASOCIACIÓN CIVIL' }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista de Operaciones', retribucionPactada: '295000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Logística y operaciones' },
    bancarios: { banco: 'Banco Santander', cuenta: 'CA $ 01900-9', cbu: '0720019001900190019019', alias: 'GABRIELA.HERRERA.SANTA' }, documentacion: [],
  },

  // ── 020 · Inés Acosta · Analista Marketing ───────────────────────────────
  {
    name: 'Inés Acosta', email: 'iacosta@conectarhr.net',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=InesAcosta',
    fechaEgreso: null, reportaA: '007', ultimaModificacion: null,
    personal: { fechaNacimiento: '30/10/1999', nacionalidad: 'Argentina', cuil: '27-44321098-5', dni: '44.321.098', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Julián Álvarez', numero: '2345', piso: '3', depto: 'D', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5555-0020', customFields: { "Grupo Sanguíneo": "B-" } },
    empresa: { legajo: '020', fechaIngreso: '01/11/2024', antiguedad: '6 meses', categoria: 'Analista', tarea: 'ANÁLISIS DE MARKETING', sector: 'Marketing', dependencia: 'Jefatura de Marketing', horario: { tipo: 'Híbrido', dias: diasHibrido(SEDE_BA), sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Pasantía', obraSocial: { codigo: '901105', descripcion: 'GALENO ARGENTINA S.A.' }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Marketing y Publicidad', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista de Marketing Jr.', retribucionPactada: '180000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Av. Corrientes 1234, CABA', actividadEconomica: 'Publicidad y marketing' },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CA $ 02000-0', cbu: '0070020002000200020020', alias: 'INES.ACOSTA.GALICIA' }, documentacion: [],
  },
];

// ─── Export mockEmployees ─────────────────────────────────────────────────────

export const mockEmployees: Employee[] = employeesData.map((employee) => {
  const newEmployee: Employee = {
    ...employee,
    id: employee.empresa.legajo,
    documentacion: employee.documentacion as Documento[],
  };
  if (!newEmployee.personal.customFields) newEmployee.personal.customFields = {};
  if (!newEmployee.empresa.customFields)  newEmployee.empresa.customFields = {};

  initialStructure["Datos Personales"]["Datos Adicionales"].forEach(field => {
    if (!(field.name in newEmployee.personal.customFields))
      newEmployee.personal.customFields[field.name] = field.defaultValue || '';
  });
  initialStructure["Datos de la Empresa"]["Datos Adicionales"].forEach(field => {
    if (!(field.name in newEmployee.empresa.customFields))
      newEmployee.empresa.customFields[field.name] = field.defaultValue || '';
  });
  return newEmployee;
});

// ─── Leave requests ───────────────────────────────────────────────────────────

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

export const initialRequests: TimeOffRequest[] = [
  // ── Aprobadas (sirven para gráficos de este mes)
  { id: 'req-01', employeeId: '008', employeeName: 'Ana García',          type: 'Vacaciones',            startDate: new Date(y, m, 3),  endDate: new Date(y, m, 12), status: 'Aprobado' },
  { id: 'req-02', employeeId: '010', employeeName: 'Valentina Sánchez',   type: 'Licencia por Enfermedad', startDate: new Date(y, m, 5),  endDate: new Date(y, m, 6),  status: 'Aprobado', attachment: { name: 'certificado.pdf', url: '#' } },
  { id: 'req-03', employeeId: '003', employeeName: 'Juan Pablo Fernández',type: 'Asunto Personal',        startDate: new Date(y, m, 14), endDate: new Date(y, m, 14), status: 'Aprobado' },
  { id: 'req-04', employeeId: '015', employeeName: 'Natalia Vega',        type: 'Vacaciones',            startDate: new Date(y, m, 19), endDate: new Date(y, m, 23), status: 'Aprobado' },
  { id: 'req-05', employeeId: '012', employeeName: 'Florencia Ibáñez',    type: 'Licencia por Examen',    startDate: new Date(y, m, 8),  endDate: new Date(y, m, 9),  status: 'Aprobado' },

  // ── Pendientes de aprobación manager
  { id: 'req-06', employeeId: '011', employeeName: 'Ramiro Blanco',       type: 'Vacaciones',            startDate: new Date(y, m+1, 2),  endDate: new Date(y, m+1, 13), status: 'Pendiente' },
  { id: 'req-07', employeeId: '009', employeeName: 'Carlos Martínez',     type: 'Asunto Personal',        startDate: new Date(y, m, 28), endDate: new Date(y, m, 28), status: 'Pendiente' },
  { id: 'req-08', employeeId: '016', employeeName: 'Pablo Molina',        type: 'Vacaciones',            startDate: new Date(y, m+1, 16), endDate: new Date(y, m+1, 20), status: 'Pendiente' },

  // ── Pendientes de aprobación admin (con certificados)
  { id: 'req-09', employeeId: '019', employeeName: 'Gabriela Herrera',    type: 'Licencia por Enfermedad', startDate: new Date(y, m, 22), endDate: new Date(y, m, 24), status: 'Pendiente de Admin', attachment: { name: 'cert_medico.pdf', url: '#' } },
  { id: 'req-10', employeeId: '020', employeeName: 'Inés Acosta',         type: 'Licencia por Examen',    startDate: new Date(y, m, 27), endDate: new Date(y, m, 27), status: 'Pendiente de Admin' },

  // ── Rechazadas
  { id: 'req-11', employeeId: '014', employeeName: 'Diego Pérez',         type: 'Asunto Personal',        startDate: new Date(y, m, 1),  endDate: new Date(y, m, 5),  status: 'Rechazado' },
  { id: 'req-12', employeeId: '017', employeeName: 'Tomás Castro',        type: 'Vacaciones',            startDate: new Date(y, m-1, 20), endDate: new Date(y, m-1, 31), status: 'Rechazado' },
];

// ─── Vacancies (Kanban de reclutamiento) ─────────────────────────────────────

export const initialVacancies: Vacancy[] = [
  // ── Nuevas Vacantes
  {
    id: 'vac-01',
    title: 'Desarrollador/a Backend Senior',
    department: 'Gerencia de Tecnología',
    status: 'Nuevas Vacantes',
    candidates: [],
  },
  {
    id: 'vac-02',
    title: 'Analista de Tesorería',
    department: 'Gerencia Financiera',
    status: 'Nuevas Vacantes',
    candidates: [],
  },

  // ── En Proceso de Selección
  {
    id: 'vac-03',
    title: 'Analista de Marketing Digital',
    department: 'Jefatura de Marketing',
    status: 'En Proceso de Selección',
    candidates: [
      { id: 'c-01', name: 'Laura Gómez',   avatar: 'https://avatar.iran.liara.run/public/girl?username=LauraGomez',  role: 'Especialista en SEO y SEM' },
      { id: 'c-02', name: 'Marcos Villalba', avatar: 'https://avatar.iran.liara.run/public/boy?username=MarcosVillalba', role: 'Social Media Manager' },
      { id: 'c-03', name: 'Sofía Reyes',   avatar: 'https://avatar.iran.liara.run/public/girl?username=SofiaReyes',  role: 'Content Strategist' },
    ],
  },
  {
    id: 'vac-04',
    title: 'Ejecutivo/a de Cuentas Corporativas',
    department: 'Gerencia Comercial',
    status: 'En Proceso de Selección',
    candidates: [
      { id: 'c-04', name: 'Hernán Díaz',    avatar: 'https://avatar.iran.liara.run/public/boy?username=HernanDiaz',   role: 'Key Account Manager' },
      { id: 'c-05', name: 'Camila Soria',   avatar: 'https://avatar.iran.liara.run/public/girl?username=CamilaSoria', role: 'Ejecutiva Comercial B2B' },
    ],
  },

  // ── Entrevistas
  {
    id: 'vac-05',
    title: 'Líder de Equipo Backend',
    department: 'Gerencia de Tecnología',
    status: 'Entrevistas',
    candidates: [
      { id: 'c-06', name: 'Julieta Rossi',   avatar: 'https://avatar.iran.liara.run/public/girl?username=JulietaRossi', role: 'Tech Lead Node.js / Go' },
      { id: 'c-07', name: 'Agustín Ferraro', avatar: 'https://avatar.iran.liara.run/public/boy?username=AgustinFerraro', role: 'Senior Backend Engineer' },
    ],
  },
  {
    id: 'vac-06',
    title: 'Analista de RRHH Sr.',
    department: 'Gerencia de RRHH',
    status: 'Entrevistas',
    candidates: [
      { id: 'c-08', name: 'Verónica Suárez', avatar: 'https://avatar.iran.liara.run/public/girl?username=VeronicaSuarez', role: 'HRBP con exp. en tech' },
    ],
  },

  // ── Oferta Enviada
  {
    id: 'vac-07',
    title: 'Diseñador/a UX/UI Senior',
    department: 'Gerencia de Tecnología',
    status: 'Oferta Enviada',
    candidates: [
      { id: 'c-09', name: 'Nicolás Bauer',   avatar: 'https://avatar.iran.liara.run/public/boy?username=NicolasBauer',  role: 'Senior Product Designer' },
    ],
  },

  // ── Contratado
  {
    id: 'vac-08',
    title: 'Desarrolladora Full Stack',
    department: 'Gerencia de Tecnología',
    status: 'Contratado',
    candidates: [
      { id: 'c-10', name: 'Valentina Sánchez', avatar: 'https://avatar.iran.liara.run/public/girl?username=ValentinaSanchez', role: 'Full Stack Developer' },
    ],
  },
];
