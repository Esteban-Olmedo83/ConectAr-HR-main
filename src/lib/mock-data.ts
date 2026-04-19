
import type { Employee, Structure, Documento, TimeOffRequest, Vacancy } from './definitions';

export const initialStructure: Structure = {
  "Datos Personales": {
    "Datos Principales": [
      "Nombre y Apellido", "Email", "Fecha de Nacimiento", "Nacionalidad", "CUIL", "DNI", "Sexo", "Estado Civil",
      "Domicilio", "Piso", "Depto", "Localidad", "Provincia", "C.P.", "Teléfono"
    ],
    "Datos Adicionales": [
      { name: "Grupo Sanguíneo", type: 'Texto', defaultValue: 'No especificado'},
    ]
  },
  "Datos de la Empresa": {
    "Datos del Legajo": ["Nº de Legajo", "Fecha de Ingreso", "Fecha de Egreso", "Antigüedad", "Categoría", "Tarea", "Sector", "Dependencia", "Reporta A"],
    "Horario y Asignación": ["Tipo de Horario", "Días Laborales", "Sucursal (Presencial)"],
    "Datos de Registración": ["Modalidad de Contrato", "Obra Social", "ART", "Situación de Revista", "Régimen", "Tipo de Servicio", "Convenio Colectivo", "Puesto", "Retribución Pactada", "Mod. Liquidación", "Domicilio de Explotación", "Actividad Económica"],
    "Datos Bancarios": ["Banco", "Nº de Cuenta", "CBU", "Alias"],
    "Datos Adicionales": [
      { name: "Talle de Camisa", type: 'Texto', defaultValue: 'No especificado'},
    ]
  },
  "Documentación": []
}

const employeesData: Omit<Employee, 'id'>[] = [
    {
    name: 'Directorio General',
    email: 'directorio@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Directorio',
    fechaEgreso: null,
    reportaA: null, // Es el nodo raíz
    ultimaModificacion: null,
    personal: { fechaNacimiento: '', nacionalidad: '', cuil: '', dni: '', sexo: '', estadoCivil: '', domicilio: { calle: '', numero: '', piso: '', depto: '', localidad: '', provincia: '', cp: '' }, telefono: '', customFields: {} },
    empresa: { legajo: '0', fechaIngreso: '', antiguedad: '', categoria: 'Directorio', tarea: 'DIRECCIÓN GENERAL', sector: 'Dirección', dependencia: 'Dirección General', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'Sucursal Principal' }, customFields: {} },
    registracion: { modalidadContrato: '', obraSocial: { codigo: '', descripcion: ''}, art: '', situacionRevista: '', regimen: '', tipoServicio: '', convenioColectivo: '', puesto: '', retribucionPactada: '', modalidadLiquidacion: '', domicilioExplotacion: '', actividadEconomica: '', },
    bancarios: { banco: '', cuenta: '', cbu: '', alias: '' },
    documentacion: [],
  },
  {
    name: 'Secretaria',
    email: 'secretaria@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Secretaria',
    fechaEgreso: null,
    reportaA: '0', // Reporta a DIRECCIÓN GENERAL
    ultimaModificacion: null,
    personal: { fechaNacimiento: '15/05/1990', nacionalidad: 'Argentina', cuil: '27-12345678-9', dni: '12.345.678', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. Corrientes', numero: '1234', piso: '5', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1043AAS' }, telefono: '+54 9 11 1234-5678', customFields: { "Grupo Sanguíneo": "0+" } },
    empresa: { legajo: '2', fechaIngreso: '10/01/2020', antiguedad: '4 años, 6 meses', categoria: 'Staff', tarea: 'SECRETARÍA', sector: 'Dirección', dependencia: 'Dirección General', horario: { tipo: 'Híbrido', dias: { lunes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901402", descripcion: "MEDIFE ASOCIACION CIVIL"}, art: 'Prevención Aseguradora de Riesgos del Trabajo S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Programador', retribucionPactada: '950000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Servicios de consultoría de informática y suministros de programas de informática', },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CA $ 12345-6', cbu: '0070123456789012345678', alias: 'ANA.LOPEZ.ALIAS' },
    documentacion: [],
  },
  {
    name: 'Asesor Fiscal',
    email: 'asesor@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Asesor',
    fechaEgreso: null,
    reportaA: '0', // Reporta a DIRECCIÓN GENERAL
    ultimaModificacion: null,
    personal: { fechaNacimiento: '10/01/1985', nacionalidad: 'Argentina', cuil: '20-45678901-3', dni: '45.678.901', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. Cabildo', numero: '2345', piso: '8', depto: 'D', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1428AAJ' }, telefono: '+54 9 11 3456-7890', customFields: {} },
    empresa: { legajo: '4', fechaIngreso: '20/07/2019', antiguedad: '5 años', categoria: 'Staff', tarea: 'ASESORÍA FISCAL Y CONTABLE', sector: 'Dirección', dependencia: 'Dirección General', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'Sucursal Principal' }, customFields: {} },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "400909", descripcion: "OS Acción Social de Empresarios"}, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: 'Fuera de Convenio', puesto: 'Manager', retribucionPactada: '2500000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Dirección Ejecutiva', },
    bancarios: { banco: 'Banco Itaú', cuenta: 'CC $ 65432-1', cbu: '2590654321098765432109', alias: 'JUAN.M.ALIAS' },
    documentacion: [],
  },
  {
    name: 'Director de Compras',
    email: 'compras@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Compras',
    fechaEgreso: null,
    reportaA: '2', // Reporta a SECRETARÍA
    ultimaModificacion: null,
    personal: { fechaNacimiento: '08/07/1991', nacionalidad: 'Argentina', cuil: '27-89012345-7', dni: '89.012.345', sexo: 'Femenino', estadoCivil: 'Casada', domicilio: { calle: 'San Martín', numero: '1000', piso: '2', depto: 'B', localidad: 'Rosario', provincia: 'Santa Fe', cp: 'S2000' }, telefono: '+54 9 341 555-8765', customFields: {} },
    empresa: { legajo: '8', fechaIngreso: '10/09/2020', antiguedad: '3 años, 10 meses', categoria: 'Dirección', tarea: 'DIRECCIÓN DE COMPRAS', sector: 'Compras', dependencia: 'DIRECCIÓN DE COMPRAS', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'Sucursal Principal' }, customFields: {} },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: '000901', descripcion: 'OS de la Actividad de Seguros, Reaseguros, Capitalización, Ahorro y Préstamo para la Vivienda'}, art: 'Berkley International A.R.T. S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Vendedor', retribucionPactada: '800000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Rosario Centro', actividadEconomica: 'Venta al por mayor', },
    bancarios: { banco: 'Banco Municipal de Rosario', cuenta: 'CA $ 55667-7', cbu: '0650556677889900112233', alias: 'LAURA.BENITEZ.MUNI' },
    documentacion: [],
  },
  {
    name: 'Director de Producción',
    email: 'produccion@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Produccion',
    fechaEgreso: null,
    reportaA: '2', // Reporta a SECRETARÍA
    ultimaModificacion: null,
    personal: { fechaNacimiento: '25/10/1998', nacionalidad: 'Argentina', cuil: '27-78901234-6', dni: '78.901.234', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. Colón', numero: '500', piso: '1', depto: 'A', localidad: 'Córdoba', provincia: 'Córdoba', cp: 'X5000' }, telefono: '+54 9 351 555-5678', customFields: { "Grupo Sanguíneo": "A-" } },
    empresa: { legajo: '7', fechaIngreso: '15/02/2023', antiguedad: '1 año, 5 meses', categoria: 'Dirección', tarea: 'DIRECCIÓN DE PRODUCCIÓN', sector: 'Producción', dependencia: 'DIRECCIÓN DE PRODUCCIÓN', horario: { tipo: 'Híbrido', dias: { lunes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Externa', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Externa', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901105", descripcion: "GALENO ARGENTINA S.A."}, art: 'Federación Patronal Seguros S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Marketing y Publicidad', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista Jr.', retribucionPactada: '650000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Córdoba Capital', actividadEconomica: 'Publicidad', },
    bancarios: { banco: 'Banco Macro', cuenta: 'CA $ 44556-6', cbu: '2850445566778899001122', alias: 'SOFIA.ACOSTA.MACRO' },
    documentacion: [],
  },
  {
    name: 'Director de Ventas',
    email: 'ventas@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Ventas',
    fechaEgreso: null,
    reportaA: '4', // Reporta a ASESORÍA FISCAL
    ultimaModificacion: null,
    personal: { fechaNacimiento: '12/03/1987', nacionalidad: 'Argentina', cuil: '20-67890123-5', dni: '67.890.123', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Calle Falsa', numero: '123', piso: '', depto: '', localidad: 'La Plata', provincia: 'Buenos Aires', cp: 'B1900' }, telefono: '+54 9 221 555-1234', customFields: { "Grupo Sanguíneo": "B+" } },
    empresa: { legajo: '6', fechaIngreso: '01/08/2017', antiguedad: '7 años', categoria: 'Dirección', tarea: 'DIRECCIÓN DE VENTAS', sector: 'Ventas', dependencia: 'DIRECCIÓN DE VENTAS', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'Sucursal Principal' }, customFields: { "Talle de Camisa": "XL" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "40/89", descripcion: "Camioneros"}, art: 'EXPERIENCIA ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Logística y Distribución', convenioColectivo: '40/89 - Camioneros', puesto: 'Jefe de Depósito', retribucionPactada: '1200000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Polo Industrial Ezeiza', actividadEconomica: 'Logística', },
    bancarios: { banco: 'Banco Provincia', cuenta: 'CA $ 11223-3', cbu: '0140112233445566778899', alias: 'PEDRO.GOMEZ.BAPRO' },
    documentacion: [],
  },
  {
    name: 'Director de RRHH',
    email: 'rrhh@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=RRHH',
    fechaEgreso: null,
    reportaA: '4', // Reporta a ASESORÍA FISCAL
    ultimaModificacion: null,
    personal: { fechaNacimiento: '05/09/1995', nacionalidad: 'Argentina', cuil: '27-56789012-4', dni: '56.789.012', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. del Libertador', numero: '6789', piso: '2', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1428BEN' }, telefono: '+54 9 11 4567-8901', customFields: {} },
    empresa: { legajo: '5', fechaIngreso: '02/05/2022', antiguedad: '2 años, 2 meses', categoria: 'Dirección', tarea: 'DIRECCIÓN DE RRHH', sector: 'RRHH', dependencia: 'DIRECCIÓN DE RRHH', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'Sucursal Principal' }, customFields: {} },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "001102", descripcion: "OS para la Actividad Docente"}, art: 'La Segunda Aseguradora de Riesgos del Trabajo S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista', retribucionPactada: '700000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Recursos Humanos', },
    bancarios: { banco: 'Banco Ciudad', cuenta: 'CA $ 76543-2', cbu: '0290765432109876543210', alias: 'LUCIA.F.ALIAS' },
    documentacion: [],
  },
  {
    name: 'Jefe de Facturación',
    email: 'facturacion@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Facturacion',
    fechaEgreso: null,
    reportaA: "8", // Reporta a DIRECCIÓN DE COMPRAS
    ultimaModificacion: null,
    personal: { fechaNacimiento: '25/08/1978', nacionalidad: 'Argentina', cuil: '20-16161616-1', dni: '16.161.616', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. La Plata', numero: '2500', piso: '1', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1250' }, telefono: '+54 9 11 1616-1616', customFields: {} },
    empresa: { legajo: '15', fechaIngreso: '01/04/2018', antiguedad: '6 años, 3 meses', categoria: 'Jefe', tarea: 'DEPARTAMENTO DE FACTURACIÓN', sector: 'Compras', dependencia: 'DIRECCIÓN DE COMPRAS', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'Sucursal Principal' }, customFields: {} },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "400909", descripcion: "OS Acción Social de Empresarios"}, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: 'Fuera de Convenio', puesto: 'Gerente', retribucionPactada: '2800000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Dirección Ejecutiva', },
    bancarios: { banco: 'Banco ICBC', cuenta: 'CC $ 16161-6', cbu: '0151616161616161616161', alias: 'RICARDO.T.ICBC' },
    documentacion: [],
  },
   {
    name: 'Empleado Albaranes',
    email: 'albaranes@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Albaranes',
    fechaEgreso: null,
    reportaA: '15', // Reporta a DEPARTAMENTO DE FACTURACIÓN
    ultimaModificacion: null,
    personal: { fechaNacimiento: '18/06/1989', nacionalidad: 'Argentina', cuil: '20-21122334-5', dni: '21.122.334', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. Pueyrredón', numero: '1800', piso: '7', depto: 'F', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1119ACW' }, telefono: '+54 9 11 9876-5432', customFields: { "Grupo Sanguíneo": "AB+" } },
    empresa: { legajo: '1', fechaIngreso: '22/08/2018', antiguedad: '5 años, 11 meses', categoria: 'Empleado', tarea: 'SECCIÓN DE ALBARANES', sector: 'Compras', dependencia: 'DIRECCIÓN DE COMPRAS', horario: { tipo: 'Híbrido', dias: { lunes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, }, sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "L" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "902900", descripcion: "OMINT" }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios Comunes', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista', retribucionPactada: '1100000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Servicios de consultoría de informática', },
    bancarios: { banco: 'Banco Supervielle', cuenta: 'CA $ 12312-3', cbu: '0270123123123123123123', alias: 'ROBERTO.S.SUPER' },
    documentacion: [],
  },
  {
    name: 'Analista de Marketing',
    email: 'marketing@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Marketing',
    fechaEgreso: null,
    reportaA: '7',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '22/03/1994', nacionalidad: 'Argentina', cuil: '27-33445566-8', dni: '33.445.566', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. Santa Fe', numero: '3210', piso: '4', depto: 'B', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1425' }, telefono: '+54 9 11 2233-4455', customFields: {} },
    empresa: { legajo: '10', fechaIngreso: '03/03/2021', antiguedad: '3 años, 1 mes', categoria: 'Empleado', tarea: 'ANÁLISIS DE MARKETING DIGITAL', sector: 'Marketing', dependencia: 'DIRECCIÓN DE PRODUCCIÓN', horario: { tipo: 'Híbrido', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901402", descripcion: "MEDIFE ASOCIACION CIVIL" }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Marketing y Publicidad', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista Jr.', retribucionPactada: '650000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Publicidad y marketing' },
    bancarios: { banco: 'Banco Galicia', cuenta: 'CA $ 33445-5', cbu: '0070334455667788990011', alias: 'VALENTINA.D.GAL' },
    documentacion: [],
  },
  {
    name: 'Desarrollador Backend',
    email: 'backend@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Backend',
    fechaEgreso: null,
    reportaA: '4',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '11/11/1992', nacionalidad: 'Argentina', cuil: '20-44556677-9', dni: '44.556.677', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Gurruchaga', numero: '850', piso: '', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1414' }, telefono: '+54 9 11 5566-7788', customFields: {} },
    empresa: { legajo: '11', fechaIngreso: '15/06/2022', antiguedad: '1 año, 10 meses', categoria: 'Empleado', tarea: 'DESARROLLO BACKEND', sector: 'Tecnología', dependencia: 'DIRECCIÓN DE PRODUCCIÓN', horario: { tipo: 'Remoto', dias: { lunes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901105", descripcion: "GALENO ARGENTINA S.A." }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Servicios de Tecnología', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Desarrollador Sr.', retribucionPactada: '1800000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Desarrollo de software' },
    bancarios: { banco: 'Brubank', cuenta: 'CA $ 44556-6', cbu: '1430044556677889900112', alias: 'ROBERTO.S.BRU' },
    documentacion: [],
  },
  {
    name: 'Diseñadora UX/UI',
    email: 'uxdesign@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=UXDesign',
    fechaEgreso: null,
    reportaA: '7',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '28/07/1996', nacionalidad: 'Argentina', cuil: '27-55667788-0', dni: '55.667.788', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. Rivadavia', numero: '4567', piso: '3', depto: 'C', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1205' }, telefono: '+54 9 11 6677-8899', customFields: { "Grupo Sanguíneo": "O+" } },
    empresa: { legajo: '12', fechaIngreso: '01/09/2023', antiguedad: '7 meses', categoria: 'Empleado', tarea: 'DISEÑO UX/UI', sector: 'Tecnología', dependencia: 'DIRECCIÓN DE PRODUCCIÓN', horario: { tipo: 'Híbrido', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '10:00', horarioSalida: '19:00' }, martes: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '10:00', horarioSalida: '19:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '10:00', horarioSalida: '19:00' }, jueves: { trabaja: true, sucursal: 'Home Office', horarioEntrada: '10:00', horarioSalida: '19:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '10:00', horarioSalida: '19:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'No aplica' }, customFields: { "Talle de Camisa": "XS" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "400909", descripcion: "OS Acción Social de Empresarios" }, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Diseño y Creatividad', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Diseñadora', retribucionPactada: '950000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Diseño gráfico y de interfaces' },
    bancarios: { banco: 'Uala', cuenta: 'CA $ 55667-7', cbu: '4260055667788990011223', alias: 'CAMILA.B.UALA' },
    documentacion: [],
  },
  {
    name: 'Ejecutivo de Cuentas',
    email: 'cuentas@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Cuentas',
    fechaEgreso: null,
    reportaA: '6',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '05/12/1988', nacionalidad: 'Argentina', cuil: '20-66778899-1', dni: '66.778.899', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. Belgrano', numero: '2100', piso: '6', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1094' }, telefono: '+54 9 11 7788-9900', customFields: {} },
    empresa: { legajo: '13', fechaIngreso: '10/01/2019', antiguedad: '5 años, 3 meses', categoria: 'Empleado', tarea: 'GESTIÓN DE CUENTAS CLAVE', sector: 'Ventas', dependencia: 'DIRECCIÓN DE VENTAS', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Principal' }, customFields: { "Talle de Camisa": "L" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901402", descripcion: "MEDIFE ASOCIACION CIVIL" }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Ejecutivo de Ventas', retribucionPactada: '1100000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Venta de servicios corporativos' },
    bancarios: { banco: 'Banco Nación', cuenta: 'CA $ 66778-8', cbu: '0110066778899001122334', alias: 'PABLO.D.BNA' },
    documentacion: [],
  },
  {
    name: 'Analista de RRHH',
    email: 'analistaRRHH@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=AnalistaRRHH',
    fechaEgreso: null,
    reportaA: '5',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '17/04/1997', nacionalidad: 'Argentina', cuil: '27-77889900-2', dni: '77.889.900', sexo: 'Femenino', estadoCivil: 'Soltera', domicilio: { calle: 'Av. Callao', numero: '1500', piso: '2', depto: 'D', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1024' }, telefono: '+54 9 11 8899-0011', customFields: { "Grupo Sanguíneo": "A+" } },
    empresa: { legajo: '16', fechaIngreso: '05/05/2023', antiguedad: '11 meses', categoria: 'Empleado', tarea: 'ANÁLISIS Y GESTIÓN DE RRHH', sector: 'RRHH', dependencia: 'DIRECCIÓN DE RRHH', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Principal' }, customFields: { "Talle de Camisa": "XS" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901105", descripcion: "GALENO ARGENTINA S.A." }, art: 'GALENO ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Recursos Humanos', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Analista Jr.', retribucionPactada: '600000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Gestión de recursos humanos' },
    bancarios: { banco: 'Banco Ciudad', cuenta: 'CA $ 77889-9', cbu: '0290778899001122334455', alias: 'FLORENCIA.M.BCIA' },
    documentacion: [],
  },
  {
    name: 'Responsable de Logística',
    email: 'logistica@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=Logistica',
    fechaEgreso: null,
    reportaA: '8',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '30/09/1985', nacionalidad: 'Argentina', cuil: '20-88990011-3', dni: '88.990.011', sexo: 'Masculino', estadoCivil: 'Casado', domicilio: { calle: 'Av. San Juan', numero: '3400', piso: '', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1233' }, telefono: '+54 9 11 9900-1122', customFields: {} },
    empresa: { legajo: '17', fechaIngreso: '20/11/2017', antiguedad: '6 años, 5 meses', categoria: 'Jefe', tarea: 'RESPONSABLE DE LOGÍSTICA Y DISTRIBUCIÓN', sector: 'Logística', dependencia: 'DIRECCIÓN DE COMPRAS', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '17:00' }, sabado: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '08:00', horarioSalida: '13:00' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Principal' }, customFields: { "Talle de Camisa": "XXL" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "40/89", descripcion: "Camioneros" }, art: 'EXPERIENCIA ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Logística y Distribución', convenioColectivo: '40/89 - Camioneros', puesto: 'Jefe de Depósito', retribucionPactada: '1400000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Polo Industrial Ezeiza', actividadEconomica: 'Logística y transporte' },
    bancarios: { banco: 'Banco Provincia', cuenta: 'CA $ 88990-0', cbu: '0140889900112233445566', alias: 'MARTIN.F.BAPRO' },
    documentacion: [],
  },
  {
    name: 'Tesorera',
    email: 'tesoreria@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=Tesorera',
    fechaEgreso: null,
    reportaA: '4',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '14/02/1990', nacionalidad: 'Argentina', cuil: '27-99001122-4', dni: '99.001.122', sexo: 'Femenino', estadoCivil: 'Casada', domicilio: { calle: 'Larrea', numero: '750', piso: '1', depto: 'A', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1117' }, telefono: '+54 9 11 0011-2233', customFields: { "Grupo Sanguíneo": "B-" } },
    empresa: { legajo: '18', fechaIngreso: '12/02/2020', antiguedad: '4 años, 2 meses', categoria: 'Jefe', tarea: 'TESORERÍA Y FINANZAS', sector: 'Finanzas', dependencia: 'ASESORÍA FISCAL Y CONTABLE', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Principal' }, customFields: { "Talle de Camisa": "S" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "400909", descripcion: "OS Acción Social de Empresarios" }, art: 'SWISS MEDICAL ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Finanzas y Contabilidad', convenioColectivo: 'Fuera de Convenio', puesto: 'Tesorera', retribucionPactada: '1600000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Gestión financiera' },
    bancarios: { banco: 'Banco Itaú', cuenta: 'CC $ 99001-1', cbu: '2590990011223344556677', alias: 'CECILIA.R.ITAU' },
    documentacion: [],
  },
  {
    name: 'Vendedor Regional',
    email: 'ventas.regional@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=VendedorRegional',
    fechaEgreso: null,
    reportaA: '6',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '07/08/1993', nacionalidad: 'Argentina', cuil: '20-11223344-5', dni: '11.223.344', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Pellegrini', numero: '1200', piso: '', depto: '', localidad: 'Rosario', provincia: 'Santa Fe', cp: 'S2000' }, telefono: '+54 9 341 111-2233', customFields: {} },
    empresa: { legajo: '19', fechaIngreso: '01/07/2021', antiguedad: '2 años, 9 meses', categoria: 'Empleado', tarea: 'VENTAS ZONA LITORAL', sector: 'Ventas', dependencia: 'DIRECCIÓN DE VENTAS', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Rosario', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Rosario', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Rosario', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Rosario', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Rosario', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Rosario' }, customFields: { "Talle de Camisa": "XL" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901402", descripcion: "MEDIFE ASOCIACION CIVIL" }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Ventas', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Vendedor', retribucionPactada: '900000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Córdoba 1080, Rosario', actividadEconomica: 'Venta al por mayor' },
    bancarios: { banco: 'Banco Municipal de Rosario', cuenta: 'CA $ 11223-3', cbu: '0650112233445566778899', alias: 'NICOLAS.V.MR' },
    documentacion: [],
  },
  {
    name: 'Coordinadora de Producción',
    email: 'coord.produccion@example.com',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=CoordProduccion',
    fechaEgreso: null,
    reportaA: '7',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '19/06/1991', nacionalidad: 'Argentina', cuil: '27-22334455-6', dni: '22.334.455', sexo: 'Femenino', estadoCivil: 'Casada', domicilio: { calle: 'Av. Colón', numero: '1100', piso: '3', depto: 'B', localidad: 'Córdoba', provincia: 'Córdoba', cp: 'X5000' }, telefono: '+54 9 351 222-3344', customFields: {} },
    empresa: { legajo: '20', fechaIngreso: '08/08/2020', antiguedad: '3 años, 8 meses', categoria: 'Jefe', tarea: 'COORDINACIÓN DE PRODUCCIÓN', sector: 'Producción', dependencia: 'DIRECCIÓN DE PRODUCCIÓN', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Córdoba', horarioEntrada: '08:00', horarioSalida: '17:00' }, martes: { trabaja: true, sucursal: 'Sucursal Córdoba', horarioEntrada: '08:00', horarioSalida: '17:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Córdoba', horarioEntrada: '08:00', horarioSalida: '17:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Córdoba', horarioEntrada: '08:00', horarioSalida: '17:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Córdoba', horarioEntrada: '08:00', horarioSalida: '17:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Córdoba' }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Indeterminado', obraSocial: { codigo: "901105", descripcion: "GALENO ARGENTINA S.A." }, art: 'Federación Patronal Seguros S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Producción', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Coordinadora', retribucionPactada: '1200000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Hipólito Yrigoyen 220, Córdoba', actividadEconomica: 'Coordinación de operaciones' },
    bancarios: { banco: 'Banco Macro', cuenta: 'CA $ 22334-4', cbu: '2850223344556677889900', alias: 'PAULA.L.MACRO' },
    documentacion: [],
  },
  {
    name: 'Asistente Administrativo',
    email: 'asistente.admin@example.com',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=AsistAdmin',
    fechaEgreso: null,
    reportaA: '2',
    ultimaModificacion: null,
    personal: { fechaNacimiento: '03/01/2000', nacionalidad: 'Argentina', cuil: '20-32345678-9', dni: '32.345.678', sexo: 'Masculino', estadoCivil: 'Soltero', domicilio: { calle: 'Thames', numero: '2200', piso: '', depto: '', localidad: 'CABA', provincia: 'Buenos Aires', cp: 'C1425' }, telefono: '+54 9 11 0001-2222', customFields: {} },
    empresa: { legajo: '21', fechaIngreso: '03/01/2024', antiguedad: '3 meses', categoria: 'Empleado', tarea: 'ASISTENCIA ADMINISTRATIVA GENERAL', sector: 'Administración', dependencia: 'Dirección General', horario: { tipo: 'Presencial', dias: { lunes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, martes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, miercoles: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, jueves: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, viernes: { trabaja: true, sucursal: 'Sucursal Principal', horarioEntrada: '09:00', horarioSalida: '18:00' }, sabado: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' }, domingo: { trabaja: false, sucursal: 'No aplica', horarioEntrada: '', horarioSalida: '' } }, sucursalFijo: 'Sucursal Principal' }, customFields: { "Talle de Camisa": "M" } },
    registracion: { modalidadContrato: 'Tiempo Determinado', obraSocial: { codigo: "901402", descripcion: "MEDIFE ASOCIACION CIVIL" }, art: 'Prevención ART S.A.', situacionRevista: 'Activo', regimen: 'SIPA', tipoServicio: 'Administración General', convenioColectivo: '130/75 - Empleados de Comercio', puesto: 'Auxiliar Administrativo', retribucionPactada: '480000', modalidadLiquidacion: 'Mensual', domicilioExplotacion: 'Maipú 1210, CABA', actividadEconomica: 'Servicios administrativos' },
    bancarios: { banco: 'Naranja X', cuenta: 'CA $ 32345-6', cbu: '4570032345678901234567', alias: 'TOMAS.G.NX' },
    documentacion: [],
  },
];


export const mockEmployees: Employee[] = employeesData.map((employee, index) => {
    const newEmployee: Employee = {
      ...employee,
      id: employee.empresa.legajo,
      documentacion: employee.documentacion as Documento[],
    };

    if (!newEmployee.personal.customFields) {
        newEmployee.personal.customFields = {};
    }
    if (!newEmployee.empresa.customFields) {
        newEmployee.empresa.customFields = {};
    }

    initialStructure["Datos Personales"]["Datos Adicionales"].forEach(field => {
        if (!(field.name in newEmployee.personal.customFields)) {
            newEmployee.personal.customFields[field.name] = field.defaultValue || '';
        }
    });

    initialStructure["Datos de la Empresa"]["Datos Adicionales"].forEach(field => {
        if (!(field.name in newEmployee.empresa.customFields)) {
            newEmployee.empresa.customFields[field.name] = field.defaultValue || '';
        }
    });

    return newEmployee;
});

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

export const initialRequests: TimeOffRequest[] = [
  // Aprobadas este mes para graficos
  { id: 'req-1', employeeId: '1', employeeName: 'Empleado Albaranes', type: 'Vacaciones', startDate: new Date(currentYear, currentMonth, 1), endDate: new Date(currentYear, currentMonth, 10), status: 'Aprobado' },
  { id: 'req-20', employeeId: '2', employeeName: 'Secretaria', type: 'Licencia por Enfermedad', startDate: new Date(currentYear, currentMonth, 5), endDate: new Date(currentYear, currentMonth, 6), status: 'Aprobado' },
  { id: 'req-21', employeeId: '5', employeeName: 'Director de RRHH', type: 'Asunto Personal', startDate: new Date(currentYear, currentMonth, 12), endDate: new Date(currentYear, currentMonth, 12), status: 'Aprobado' },
  { id: 'req-22', employeeId: '6', employeeName: 'Director de Ventas', type: 'Vacaciones', startDate: new Date(currentYear, currentMonth, 15), endDate: new Date(currentYear, currentMonth, 20), status: 'Aprobado' },
  { id: 'req-23', employeeId: '7', employeeName: 'Director de Producción', type: 'Licencia por Examen', startDate: new Date(currentYear, currentMonth, 3), endDate: new Date(currentYear, currentMonth, 4), status: 'Aprobado' },

  // Pendientes de Admin
  { id: 'req-2', employeeId: '10', employeeName: 'Valentina Díaz', type: 'Licencia por Enfermedad', startDate: new Date(2024, 6, 20), endDate: new Date(2024, 6, 21), status: 'Pendiente de Admin', attachment: {name: 'certificado.pdf', url: '#'} },

  // Rechazadas
  { id: 'req-3', employeeId: '1', employeeName: 'Empleado Albaranes', type: 'Asunto Personal', startDate: new Date(2024, 6, 25), endDate: new Date(2024, 6, 25), status: 'Rechazado' },
  
  // Pendientes de Manager
  { id: 'req-4', employeeId: '11', employeeName: 'Roberto Sanchez', type: 'Vacaciones', startDate: new Date(2024, 8, 5), endDate: new Date(2024, 8, 15), status: 'Pendiente' },
  { id: 'req-5', employeeId: '2', employeeName: 'Secretaria', type: 'Asunto Personal', startDate: new Date(2024, 9, 1), endDate: new Date(2024, 9, 1), status: 'Pendiente' },
];

export const initialVacancies: Vacancy[] = [
  {
    id: 'vac-1',
    title: 'Desarrollador/a Frontend Senior',
    department: 'Gerencia de Sistemas',
    status: 'Nuevas Vacantes',
    candidates: [],
  },
  {
    id: 'vac-2',
    title: 'Analista de Marketing Digital',
    department: 'Gerencia de Marketing',
    status: 'En Proceso de Selección',
    candidates: [
      { id: 'cand-1', name: 'Laura Gómez', avatar: 'https://avatar.iran.liara.run/public/girl?username=Laura', role: 'Especialista en SEO' },
      { id: 'cand-2', name: 'Marcos Pérez', avatar: 'https://avatar.iran.liara.run/public/boy?username=Marcos', role: 'Content Manager' },
    ],
  },
  {
    id: 'vac-3',
    title: 'Líder de Equipo Backend',
    department: 'Gerencia de Sistemas',
    status: 'Entrevistas',
    candidates: [
      { id: 'cand-3', name: 'Julieta Rossi', avatar: 'https://avatar.iran.liara.run/public/girl?username=Julieta', role: 'Dev Backend Sr.' },
    ],
  },
  {
    id: 'vac-4',
    title: 'Ejecutivo/a de Cuentas',
    department: 'Gerencia Comercial',
    status: 'Oferta Enviada',
    candidates: [
       { id: 'cand-4', name: 'Pablo Domínguez', avatar: 'https://avatar.iran.liara.run/public/boy?username=Pablo', role: 'Vendedor Corporativo' },
    ],
  },
  {
    id: 'vac-5',
    title: 'Diseñador/a UX/UI Senior',
    department: 'Gerencia de Sistemas',
    status: 'Contratado',
    candidates: [
        { id: 'cand-5', name: 'Valentina Becker', avatar: 'https://avatar.iran.liara.run/public/girl?username=Valentina', role: 'Product Designer' },
    ],
  },
    {
    id: 'vac-6',
    title: 'Analista de Tesorería',
    department: 'Gerencia de Finanzas',
    status: 'Nuevas Vacantes',
    candidates: [],
  },
];
