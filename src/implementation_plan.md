# ConectAR RRHH — Plan de Arquitectura e Implementación

## Visión General

Plataforma **SaaS multi-tenant** de gestión de RRHH con 4 niveles de acceso:

| Nivel | Quién | Qué hace |
|---|---|---|
| 🛠️ **Propietario de Plataforma** | Vos (ConectAR) | Gestiona clientes, activa módulos, vende packs, configura la plataforma |
| 🏢 **Empresa Cliente** | super_admin de cada cliente | Gestiona su empresa, sus empleados y sus permisos internos |
| 👔 **Operadores internos** | gerente / jefe / operador_rrhh | Operan dentro de su empresa según permisos asignados |
| 👤 **Empleados** | Cada trabajador | Portal self-service propio |

- 🏢 **Portal Empresa / HR Admin** — gestión integral de legajos, nómina, asistencia, reclutamiento
- 👤 **Portal Empleado (Self-Service)** — acceso al propio legajo, solicitudes, documentos, recibos
- 📣 **Módulo Comunidad** — feed social empresa ↔ empleados (estilo Facebook)

---

## Arquitectura SaaS — Portal del Propietario (ConectAR)

Se agrega un nivel superior al sistema: el **Portal del Propietario**, accesible solo por vos, que administra a todas las empresas clientes y lo que cada una puede usar.

### Panel de Propietario (`app/owner/`)

| Sección | Descripción |
|---|---|
| **Clientes** | Alta/baja de empresas, estado de cuenta, fecha de vencimiento |
| **Packs y licencias** | Asignar pack activo a cada cliente, activar/desactivar módulos individuales |
| **Facturación** | Estado de pago, historial de facturas por cliente |
| **Mejoras del sistema** | Activar features en beta para clientes específicos |
| **Soporte** | Ver tickets, acceder al sistema del cliente en modo lectura |
| **Analytics** | Uso de módulos, empleados activos por cliente, retención |

### Packs de Producto

```
┌─────────────────────────────────────────────────────────────────────┐
│  PACK STARTER                                                       │
│  Legajos · Empleados · Portal Self-Service · Comunidad              │
├─────────────────────────────────────────────────────────────────────┤
│  PACK RECRUIT SENIOR  ← para consultoras de selección               │
│  Todo Starter + Reclutamiento · Encuestas · Desarrollo              │
├─────────────────────────────────────────────────────────────────────┤
│  PACK PAYROLL  ← para estudios de liquidación de sueldos            │
│  Todo Starter + Nómina · Liquidación · Recibos Digitales            │
├─────────────────────────────────────────────────────────────────────┤
│  PACK RRHH COMPLETO  ← empresa con área de RRHH integral            │
│  Todos los módulos                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  PACK CUSTOM  ← módulos a medida según necesidad del cliente        │
│  El propietario activa/desactiva módulo por módulo                  │
└─────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> Cada empresa cliente solo verá en su sistema los módulos de su pack activo. Si el propietario desactiva un módulo, desaparece del sidebar del cliente.

### Módulo de Liquidación de Sueldos (Nómina Avanzada)

#### Sub-módulos incluidos

| Sub-módulo | Descripción |
|---|---|
| **Liquidación** | Cálculo completo de haberes por período |
| **Impuesto a las Ganancias** | 4ª categoría: escala progresiva, deducciones, MNI, cargas de familia |
| **Multi-CCT** | Parametrización por convenio colectivo (ramas, sindicatos, porcentajes) |
| **Simulador de Sueldos** | Calcula costo empleador + neto empleado sin generar liquidación real |
| **Exportaciones contables** | ARCA / Libro de Sueldos Digital, SICORE, F931, libro IVA |
| **Respaldo de liquidaciones** | Archivo histórico inmutable por período, auditable |
| **Recibos digitales** | PDF firmado con QR de validación ARCA |

---

#### Multi-CCT: Convenios Paramétricos

Cada empresa puede tener **uno o más convenios activos**. El sistema viene pre-cargado con los siguientes CCT:

**Rama: Administración y Salud**
| Sindicato | CCT | Descripción |
|---|---|---|
| FATSA | 103/75 | Hospitales y Sanatorios Privados |
| FATSA | 108/75 | Institutos Médicos, Odontológicos, Laboratorios |
| FATSA | 122/75 | Sanatorios, Geriátricos y Clínicas con Internación |
| UPCN / ATE | 214/06 | Administración Pública Nacional |

**Rama: Comercio y Servicios**
| Sindicato | CCT | Descripción |
|---|---|---|
| FAECYS | 130/75 | Empleados de Comercio |
| UTEDYC | 805/23 | Personal de Clubes de Campo |

**Rama: Industria y Manufactura**
| Sindicato | CCT | Descripción |
|---|---|---|
| UOM | 260/75 | Metalúrgicos |
| SAFyB | 707/15 | Farmacéuticos y Bioquímicos |
| UOYEP | 797/22 | Plásticos |

**Rama: Energía y Extractivas**
| Sindicato | CCT | Descripción |
|---|---|---|
| SPyGP | 641/11 / 644/12 | Petroleros Jerárquicos / Base |
| AOMA | 38/89 | Minería Extractiva |

> [!NOTE]
> Cada CCT tiene sus propios porcentajes de aportes sindicales, escalas salariales y conceptos adicionales. El super_admin de la empresa selecciona el/los CCT activos. Se pueden agregar convenios nuevos desde el panel del propietario.

---

#### Impuesto a las Ganancias (4ª Categoría)

- **Escala progresiva** según tabla ARCA actualizable por período
- **Deducciones:** MNI, cargas de familia (cónyuge, hijos, otros), obra social, jubilación, seguro de vida
- **Cálculo anualizado** con proyección mensual y ajuste en diciembre
- **Retención mínima** respetando piso de no imposición
- **Certificado de retenciones** exportable en PDF para el empleado

---

#### Exportaciones Oficiales

| Formato | Organismo | Descripción |
|---|---|---|
| **Libro de Sueldos Digital** | ARCA (ex-AFIP) | Archivo `.txt` con estructura oficial por período |
| **SICORE** | ARCA | Retenciones de Ganancias 4ª cat. (F.2002) |
| **F. 931** | ARCA | Declaración jurada de cargas sociales mensual |
| **SICOSS** | ANSES | Contribuciones y aportes previsionales |
| **Exportación contable** | Área interna | Compatible con Tango, Bejerman, SAP (CSV/XLSX) |

---

#### Simulador de Sueldos

Herramienta para RRHH y gerencia que **calcula sin generar liquidación real**:
- Parámetros: CCT, categoría, antigüedad, adicionales, cargas de familia
- Resultado: bruto · aportes empleado · contribuciones empleador · neto · **costo total empleador**
- Útil para negociaciones, presupuesto y planificación de incorporaciones

---

#### Respaldo y Auditoría de Liquidaciones

- Cada liquidación cerrada queda **archivada e inmutable**
- Historial completo por empleado, período y empresa
- Re-impresión de recibos históricos en cualquier momento
- Exportación de períodos anteriores para auditorías, inspecciones o litigios

---

#### Tipos (`lib/types/nomina.ts`)

```ts
type CCT = {
  id: string
  numero: string             // ej: '130/75'
  nombre: string             // ej: 'Empleados de Comercio'
  sindicato: string          // ej: 'FAECYS'
  rama: 'salud' | 'comercio' | 'industria' | 'energia' | 'custom'
  aportesSindicales: { empleado: number; empleador: number }
  escalasSalariales: EscalaSalarial[]
  conceptosEspeciales: Concepto[]
}

type Liquidacion = {
  id: string
  empleadoId: string
  periodo: string            // 'YYYY-MM'
  cct: CCT
  conceptos: ConceptoLiquidado[]
  retencionGanancias: number
  netoAPagar: number
  costoEmpleador: number
  estado: 'borrador' | 'cerrada' | 'pagada'
  archivada: boolean         // true = inmutable, no editable
}
```


---

## Modelo de Seguridad y Permisos (RBAC Granular)

### Tipos de usuario

| Tipo | Es empleado? | Gestiona equipo? | Puede delegar? |
|---|---|---|---|
| `super_admin` | No | Todos | ✅ Asigna todos los permisos |
| `operador_rrhh` | Opcional | Solo permisos asignados | ❌ |
| `gerente` | ✅ Sí | Su rama completa (jefes + equipos) | ✅ Puede devolver decisión al jefe |
| `jefe_equipo` | ✅ Sí | Sus reportes directos | ❌ |
| `empleado` | ✅ Sí | — | — |

> [!NOTE]
> **Gerente y jefe son también empleados.** Acceden a su portal self-service Y a su zona de gestión. El super_admin decide si un gerente tiene o no responsabilidad de gestión (puede operar como empleado simple si no se le asigna).

---

### Tres capas de acceso

```
CAPA 1 — TIPO DE USUARIO (quién sos)
  super_admin | operador_rrhh | gerente | jefe_equipo | empleado
        ↓
CAPA 2 — PERMISOS POR MÓDULO (qué podés ver/hacer en cada módulo)
  Cada módulo: leer | editar | eliminar | aprobar | crear_novedad
        ↓
CAPA 3 — ALCANCE DE DATOS (a quiénes podés gestionar)
  Todos  |  Mi rama (jefes + sus equipos)  |  Solo mi equipo directo
```

---

### Estructura del Sidebar según tipo de usuario

**`empleado` puro:**
```
📱 Mi Panel
📄 Mi Legajo
🏖️ Mis Licencias
📂 Mis Documentos
💰 Mis Recibos
👤 Mi Perfil
📣 Comunidad
```

**`jefe_equipo` (idem empleado + módulo extra):**
```
── MI PORTAL ──
📱 Mi Panel
📄 Mi Legajo         ← sus propios datos
🏖️ Mis Licencias     ← sus propias solicitudes
📂 Mis Documentos
💰 Mis Recibos
👤 Mi Perfil
📣 Comunidad
── GESTIÓN ──
👥 Gestión de Equipo  ← abre ventana de gestión con su equipo
```

**`gerente` (idem jefe_equipo, con más alcance en gestión):**
```
── MI PORTAL ──
  [igual que jefe_equipo]
── GESTIÓN ──
👥 Gestión de Equipo  ← abre ventana con su rama (jefes + equipos)
                         puede ver novedades de jefes y dar devolución
```

**`operador_rrhh` (solo módulos asignados por super_admin):**
```
[Solo los módulos habilitados por el super_admin — ninguno por defecto]
```

**`super_admin`:**
```
[Todos los módulos + Panel de Administración de Permisos]
```

---

### Ventana de "Gestión de Equipo"

Al hacer clic en **Gestión de Equipo**, se abre un panel lateral secundario con:

- **Para `jefe_equipo`:** lista de sus reportes directos, novedades pendientes, calendario de equipo
- **Para `gerente`:** árbol de su rama (sus jefes + los equipos de cada jefe). Ve las decisiones de los jefes y puede:
  - ✅ Confirmar la decisión del jefe → pasa a RRHH
  - ❌ Denegar con devolución → vuelve al jefe con comentario
  - 📝 Crear novedad propia para cualquiera de su rama

---

### Cadena de aprobación de novedades

```
[EMPLEADO solicita / JEFE crea novedad]
        ↓
[JEFE DE EQUIPO]
  aprueba / rechaza / crea novedad
        ↓ (si la empresa tiene gerente con permiso de gestión)
[GERENTE]  ← OPCIONAL según configuración
  confirma / devuelve con comentario al jefe
        ↓
[OPERADOR RRHH]
  ejecuta la novedad en el sistema
```

> [!IMPORTANT]
> Si el gerente **no tiene asignado** permiso de gestión, las novedades del jefe pasan **directamente** a RRHH. La cadena es configurable por empresa.

---

### Estructura de tipos (`lib/types/permissions.ts`)

```ts
type TipoUsuario = 'super_admin' | 'operador_rrhh' | 'gerente' | 'jefe_equipo' | 'empleado'

type Modulo =
  | 'legajos' | 'nomina' | 'asistencia' | 'ausencias'
  | 'reclutamiento' | 'documentos' | 'recibos-digitales'
  | 'organigrama' | 'encuestas' | 'desarrollo'
  | 'comunicados' | 'chat' | 'configuracion'

type Accion = 'leer' | 'editar' | 'eliminar' | 'aprobar' | 'crear_novedad' | 'devolver'

type PermisosUsuario = {
  userId: string
  tipo: TipoUsuario
  modulos: { modulo: Modulo; acciones: Accion[] }[]
  reportesDirectos: string[]    // IDs de empleados que gestiona directamente
  ramaACargo: string[]          // IDs de jefes bajo su gerencia (para gerentes)
  tieneGestionEquipo: boolean   // Si puede ver/usar el módulo "Gestión de Equipo"
}
```

---

### Panel de administración (`app/super-admin/permisos/page.tsx`)

El `super_admin` elige un usuario y configura:
1. Su **tipo** (`operador_rrhh` / `gerente` / `jefe_equipo`)
2. Los **módulos habilitados** (toggles por módulo)
3. Las **acciones** permitidas en cada módulo activo
4. Si tiene **Gestión de Equipo**, asigna reportes directos o rama
5. Si es gerente, activa o desactiva la **responsabilidad de gestión**

---

### Seguridad en cada página

```ts
const { puedeVer, puedeEditar, puedeAprobar, puedeCrearNovedad } = usePermiso('ausencias')
const { esDeEquipo } = useAlcance(empleadoId)  // valida que el empleado es de su equipo

if (!puedeVer) redirect('/sin-permisos')
if (puedeAprobar && esDeEquipo) { /* mostrar botón aprobar */ }
```

---

## User Review Required

> [!NOTE]
> **Mock data vs BD real:** Por ahora operará con datos de ejemplo (`lib/mock-data.ts`). Al conectar BD real (Supabase/Postgres), solo cambia la capa de datos.



---

## Proposed Changes

### Fase 1 — Infraestructura Base

#### [NEW] `lib/mock-data.ts`
Datos de ejemplo completos: empleados, departamentos, licencias, documentos, recibos de sueldo, publicaciones del feed.

#### [NEW] `components/dashboard-layout.tsx`
Layout principal del portal empresa con:
- Sidebar colapsable con navegación por módulo
- Header con usuario activo, notificaciones y switch de portal
- Soporte de roles (muestra/oculta secciones según permisos)

#### [NEW] `components/employee-layout.tsx`
Layout simplificado para el portal empleado:
- Sidebar reducido (solo lo que el empleado puede ver)
- Header con nombre del empleado, notificaciones personales

#### [NEW] `components/login-form.tsx`
Pantalla de login con:
- Campo email + contraseña
- Selector visual de tipo de acceso (Empresa / Empleado)
- Redirige al portal correcto según el rol detectado

#### [NEW] `components/ui/` (shadcn base)
Todos los componentes UI necesarios: `card`, `button`, `input`, `badge`, `avatar`, `dialog`, `select`, `label`, `textarea`, `checkbox`, `dropdown-menu`, `tabs`, `progress`, `separator`, `tooltip`

---

### Fase 2 — Portal Empresa

#### [NEW] `app/dashboard/page.tsx`
- KPIs en tiempo real: empleados activos, ausencias del día, próximos vencimientos
- Gráfico de headcount por departamento
- Actividad reciente (altas/bajas, solicitudes pendientes)
- Accesos rápidos a los módulos más usados

#### [NEW] `app/legajos/[id]/page.tsx`
Perfil completo del empleado con tabs:
- **Personal:** datos personales, contacto, documentación
- **Laboral:** puesto, sector, categoría, modalidad
- **Documentos:** archivos adjuntos del legajo
- **Historial:** movimientos, ascensos, salarios
- **Asistencia:** resumen de presencia y ausencias

#### [NEW] `app/asistencia/page.tsx`
- Vista tipo calendario del mes
- Marcaciones de entrada/salida
- Horas extra y justificaciones

#### [NEW] `app/ausencias/page.tsx`
- Listado de solicitudes de licencia con estado (pendiente, aprobada, rechazada)
- Panel de aprobación/rechazo para HR
- Calendario de ausencias del equipo

#### [NEW] `app/nomina/page.tsx`
- Tabla de liquidaciones del período
- Generación y previsualización de recibos
- Estado de pago por empleado

#### [NEW] `app/reclutamiento/page.tsx`
- Pipeline Kanban de candidatos (postulado → entrevista → oferta → admitido)
- Formulario de carga de candidato
- Vinculación con legajos al ser admitido

#### [NEW] `app/organigrama/page.tsx`
- Árbol visual interactivo del organigrama
- Filtros por departamento y nivel

#### [NEW] `app/recibos-digitales/page.tsx`
- Carga y distribución de recibos en PDF
- Estado de firma/confirmación por empleado

#### [NEW] `app/documentos/page.tsx`
- Repositorio general de documentos de la empresa
- Categorías: políticas, procedimientos, formularios

---

### Fase 3 — Portal Empleado (Self-Service)

#### [NEW] `app/empleado/dashboard/page.tsx`
- Saludo personalizado con datos del empleado
- Mis próximos vencimientos y recordatorios
- Accesos rápidos: solicitar licencia, ver recibo, actualizar datos
- Resumen de asistencia del mes

#### [NEW] `app/empleado/mi-legajo/page.tsx`
- Vista de solo-lectura de los datos personales y laborales del empleado
- Botón para solicitar una corrección (notifica a RRHH)

#### [NEW] `app/empleado/licencias/page.tsx`
- Formulario para solicitar licencias (tipo, fecha inicio, fecha fin, motivo)
- Historial de solicitudes con estado
- Saldo de días disponibles por tipo de licencia

#### [NEW] `app/empleado/documentos/page.tsx`
- Subida de documentos personales (DNI, título, certificados)
- Vista de los documentos ya cargados en su legajo

#### [NEW] `app/empleado/recibos/page.tsx`
- Listado de recibos de sueldo disponibles (por mes/año)
- Descarga en PDF
- Confirmación de recepción digital con firma

#### [NEW] `app/empleado/perfil/page.tsx`
- Edición de datos de contacto (dirección, teléfono, banco, CBU)
- Cambio de contraseña
- Foto de perfil

---

### Fase 4 — Módulo Comunidad (Feed Social)

#### [NEW] `app/comunidad/page.tsx`
Feed principal accesible desde ambos portales con:
- **Publicaciones** (texto, imagen, video, encuesta)
- **Reacciones** (Me gusta, ❤️, 👏, 🎉)
- **Comentarios** en hilo
- **Categorías de publicación:** Noticias, Eventos, Beneficios, Cumpleaños, Logros

#### [NEW] `components/community/PostCard.tsx`
Tarjeta de publicación con:
- Avatar y nombre de quien publica (empresa o empleado)
- Contenido multimedia
- Barra de reacciones y cantidad de comentarios
- Sección de comentarios expandible

#### [NEW] `components/community/CreatePost.tsx`
Panel de creación de publicación (solo visible para `hr_admin` y `super_admin`):
- Editor de texto enriquecido
- Adjuntar imagen/archivo
- Selector de categoría y audiencia (todos / departamento específico)

---

## Verification Plan

### Verificación Visual (Browser)
Después de cada fase se correrá el servidor de desarrollo y se verificará visualmente que:
1. El login redirige correctamente según el rol seleccionado
2. El layout empresa muestra el sidebar y navegación correctos
3. El layout empleado muestra solo las opciones propias
4. El feed renderiza publicaciones y permite interactuar

```bash
# Desde el directorio raíz del proyecto
npm run dev
# Navegar a http://localhost:3000
```

### Verificación de Tipos TypeScript
```bash
npx tsc --noEmit
```

### Verificación de ESLint
```bash
npm run lint
```

### Checklist Manual por Módulo
Para cada módulo implementado se verifica:
- [ ] Renderiza sin errores de consola
- [ ] Los filtros y búsquedas funcionan
- [ ] Los dialogs/modals abren y cierran
- [ ] La navegación entre páginas funciona
- [ ] Responsive en mobile y desktop
