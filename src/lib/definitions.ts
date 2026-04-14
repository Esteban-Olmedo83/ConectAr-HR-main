// Este archivo contendrá las definiciones de tipos y esquemas compartidos en la aplicación.
// Por ejemplo, tipos para Empleado, Departamento, Roles, etc.

export type Sucursal = 'Sucursal Principal' | 'Sucursal Externa' | 'Home Office' | 'No aplica';

export type DiaLaboral = {
    trabaja: boolean;
    sucursal: Sucursal;
    horarioEntrada: string;
    horarioSalida: string;
};

export type FieldType = 'Texto' | 'Número' | 'Fecha' | 'Alfanumérico';

export interface CustomField {
  name: string;
  type: FieldType;
  defaultValue?: string;
}

export interface Structure {
  "Datos Personales": {
      "Datos Principales": string[];
      "Datos Adicionales": CustomField[];
  };
  "Datos de la Empresa": {
      "Datos del Legajo": string[];
      "Horario y Asignación": string[];
      "Datos de Registración": string[];
      "Datos Bancarios": string[];
      "Datos Adicionales": CustomField[];
  };
  "Documentación": string[];
}

export type Documento = {
    id: string;
    nombre: string;
    nombreOriginal: string;
    tipo: string;
    fechaSubida: string;
    url: string;
};


export type Employee = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    fechaEgreso: string | null;
    reportaA: string | null;
    ultimaModificacion: string | null;

    personal: {
        fechaNacimiento: string;
        nacionalidad: string;
        cuil: string;
        dni: string;
        sexo: string;
        estadoCivil: string;
        domicilio: {
            calle: string;
            numero: string;
            piso: string;
            depto: string;
            localidad: string;
            provincia: string;
            cp: string;
        };
        telefono: string;
        customFields: { [key: string]: any };
    };

    empresa: {
        legajo: string;
        fechaIngreso: string;
        antiguedad: string;
        categoria: string;
        tarea: string;
        sector: string;
        dependencia: string;
        horario: {
            tipo: 'Presencial' | 'Híbrido';
            dias: {
                lunes: DiaLaboral;
                martes: DiaLaboral;
                miercoles: DiaLaboral;
                jueves: DiaLaboral;
                viernes: DiaLaboral;
                sabado: DiaLaboral;
                domingo: DiaLaboral;
            };
            sucursalFijo: Sucursal;
        };
        customFields: { [key: string]: any };
    };

    registracion: {
        modalidadContrato: string;
        obraSocial: {
            codigo: string;
            descripcion: string;
        };
        art: string;
        situacionRevista: string;
        regimen: string;
        tipoServicio: string;
        convenioColectivo: string;
        puesto: string;
        retribucionPactada: string;
        modalidadLiquidacion: string;
        domicilioExplotacion: string;
        actividadEconomica: string;
    };

    bancarios: {
        banco: string;
        cuenta: string;
        cbu: string;
        alias: string;
    };

    documentacion: Documento[];
};

export type RequestStatus = 'Pendiente' | 'Pendiente de Admin' | 'Aprobado' | 'Rechazado';

export type TimeOffRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: RequestStatus;
  attachment?: {
    name: string;
    url: string;
  };
};

export const headerMapping: { friendlyName: string; path: string }[] = [
    { friendlyName: 'Legajo', path: 'empresa.legajo' },
    { friendlyName: 'Nombre y Apellido', path: 'name' },
    { friendlyName: 'DNI', path: 'personal.dni' },
    { friendlyName: 'CUIL', path: 'personal.cuil' },
    { friendlyName: 'Fecha Nacimiento', path: 'personal.fechaNacimiento' },
    { friendlyName: 'Nacionalidad', path: 'personal.nacionalidad' },
    { friendlyName: 'Sexo', path: 'personal.sexo' },
    { friendlyName: 'Estado Civil', path: 'personal.estadoCivil' },
    { friendlyName: 'Domicilio: Calle', path: 'personal.domicilio.calle' },
    { friendlyName: 'Domicilio: Numero', path: 'personal.domicilio.numero' },
    { friendlyName: 'Domicilio: Piso', path: 'personal.domicilio.piso' },
    { friendlyName: 'Domicilio: Depto', path: 'personal.domicilio.depto' },
    { friendlyName: 'Domicilio: Localidad', path: 'personal.domicilio.localidad' },
    { friendlyName: 'Domicilio: Provincia', path: 'personal.domicilio.provincia' },
    { friendlyName: 'Domicilio: CP', path: 'personal.domicilio.cp' },
    { friendlyName: 'Telefono', path: 'personal.telefono' },
    { friendlyName: 'Email', path: 'email' },
    { friendlyName: 'Fecha Ingreso', path: 'empresa.fechaIngreso' },
    { friendlyName: 'Fecha Egreso', path: 'fechaEgreso' },
    { friendlyName: 'Reporta A (ID)', path: 'reportaA'},
    { friendlyName: 'Antigüedad', path: 'empresa.antiguedad' },
    { friendlyName: 'Categoría', path: 'empresa.categoria' },
    { friendlyName: 'Tarea', path: 'empresa.tarea' },
    { friendlyName: 'Sector', path: 'empresa.sector' },
    { friendlyName: 'Dependencia', path: 'empresa.dependencia' },
    { friendlyName: 'Horario: Tipo', path: 'empresa.horario.tipo' },
    { friendlyName: 'Lunes: Trabaja', path: 'empresa.horario.dias.lunes.trabaja' },
    { friendlyName: 'Lunes: Sucursal', path: 'empresa.horario.dias.lunes.sucursal' },
    { friendlyName: 'Lunes: Entrada', path: 'empresa.horario.dias.lunes.horarioEntrada' },
    { friendlyName: 'Lunes: Salida', path: 'empresa.horario.dias.lunes.horarioSalida' },
    { friendlyName: 'Martes: Trabaja', path: 'empresa.horario.dias.martes.trabaja' },
    { friendlyName: 'Martes: Sucursal', path: 'empresa.horario.dias.martes.sucursal' },
    { friendlyName: 'Martes: Entrada', path: 'empresa.horario.dias.martes.horarioEntrada' },
    { friendlyName: 'Martes: Salida', path: 'empresa.horario.dias.martes.horarioSalida' },
    { friendlyName: 'Miércoles: Trabaja', path: 'empresa.horario.dias.miercoles.trabaja' },
    { friendlyName: 'Miércoles: Sucursal', path: 'empresa.horario.dias.miercoles.sucursal' },
    { friendlyName: 'Miércoles: Entrada', path: 'empresa.horario.dias.miercoles.horarioEntrada' },
    { friendlyName: 'Miércoles: Salida', path: 'empresa.horario.dias.miercoles.horarioSalida' },
    { friendlyName: 'Jueves: Trabaja', path: 'empresa.horario.dias.jueves.trabaja' },
    { friendlyName: 'Jueves: Sucursal', path: 'empresa.horario.dias.jueves.sucursal' },
    { friendlyName: 'Jueves: Entrada', path: 'empresa.horario.dias.jueves.horarioEntrada' },
    { friendlyName: 'Jueves: Salida', path: 'empresa.horario.dias.jueves.horarioSalida' },
    { friendlyName: 'Viernes: Trabaja', path: 'empresa.horario.dias.viernes.trabaja' },
    { friendlyName: 'Viernes: Sucursal', path: 'empresa.horario.dias.viernes.sucursal' },
    { friendlyName: 'Viernes: Entrada', path: 'empresa.horario.dias.viernes.horarioEntrada' },
    { friendlyName: 'Viernes: Salida', path: 'empresa.horario.dias.viernes.horarioSalida' },
    { friendlyName: 'Sábado: Trabaja', path: 'empresa.horario.dias.sabado.trabaja' },
    { friendlyName: 'Sábado: Sucursal', path: 'empresa.horario.dias.sabado.sucursal' },
    { friendlyName: 'Sábado: Entrada', path: 'empresa.horario.dias.sabado.horarioEntrada' },
    { friendlyName: 'Sábado: Salida', path: 'empresa.horario.dias.sabado.horarioSalida' },
    { friendlyName: 'Domingo: Trabaja', path: 'empresa.horario.dias.domingo.trabaja' },
    { friendlyName: 'Domingo: Sucursal', path: 'empresa.horario.dias.domingo.sucursal' },
    { friendlyName: 'Domingo: Entrada', path: 'empresa.horario.dias.domingo.horarioEntrada' },
    { friendlyName: 'Domingo: Salida', path: 'empresa.horario.dias.domingo.horarioSalida' },
    { friendlyName: 'Horario: Sucursal Fijo', path: 'empresa.horario.sucursalFijo' },
    { friendlyName: 'Contrato: Modalidad', path: 'registracion.modalidadContrato' },
    { friendlyName: 'Obra Social: Código', path: 'registracion.obraSocial.codigo' },
    { friendlyName: 'Obra Social: Descripción', path: 'registracion.obraSocial.descripcion' },
    { friendlyName: 'ART', path: 'registracion.art' },
    { friendlyName: 'Situación de Revista', path: 'registracion.situacionRevista' },
    { friendlyName: 'Régimen', path: 'registracion.regimen' },
    { friendlyName: 'Tipo de Servicio', path: 'registracion.tipoServicio' },
    { friendlyName: 'Convenio Colectivo', path: 'registracion.convenioColectivo' },
    { friendlyName: 'Puesto', path: 'registracion.puesto' },
    { friendlyName: 'Retribución Pactada', path: 'registracion.retribucionPactada' },
    { friendlyName: 'Modalidad Liquidación', path: 'registracion.modalidadLiquidacion' },
    { friendlyName: 'Domicilio Explotación', path: 'registracion.domicilioExplotacion' },
    { friendlyName: 'Actividad Económica', path: 'registracion.actividadEconomica' },
    { friendlyName: 'Banco', path: 'bancarios.banco' },
    { friendlyName: 'Cuenta', path: 'bancarios.cuenta' },
    { friendlyName: 'CBU', path: 'bancarios.cbu' },
    { friendlyName: 'Alias CBU', path: 'bancarios.alias' },
    { friendlyName: 'Última Modificación (Empleado)', path: 'ultimaModificacion' },
];

export const getHeaders = (structure: Structure) => {
    const headers = headerMapping.map(h => h.friendlyName);

    const personalCustomHeaders = structure["Datos Personales"]["Datos Adicionales"].map(field => field.name);
    const empresaCustomHeaders = structure["Datos de la Empresa"]["Datos Adicionales"].map(field => field.name);

    return [...headers, ...personalCustomHeaders, ...empresaCustomHeaders];
};

export type VacancyStatus = 'Nuevas Vacantes' | 'En Proceso de Selección' | 'Entrevistas' | 'Oferta Enviada' | 'Contratado';

export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Vacancy {
  id: string;
  title: string;
  department: string;
  status: VacancyStatus;
  candidates: Candidate[];
}

export interface KanbanLane {
  id: VacancyStatus;
  title: VacancyStatus;
}
