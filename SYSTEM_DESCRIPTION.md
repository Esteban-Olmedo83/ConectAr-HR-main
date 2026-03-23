
# Descripción del Sistema: RRHH ConectAR

## Visión General

RRHH ConectAR es un Sistema de Gestión de Recursos Humanos (SaaS - Software as a Service) multi-inquilino (multi-tenant) diseñado para que una entidad administradora (el "Super Administrador") pueda ofrecer servicios de RRHH a múltiples empresas clientes.

El sistema se divide en dos niveles de gestión:

1.  **Panel del Super Administrador:** Una interfaz centralizada para que el dueño del servicio gestione a sus clientes (empresas). Permite dar de alta nuevas empresas, configurar sus entornos, gestionar suscripciones y realizar backups de sus datos aislados.
2.  **Portal de Empresa Cliente:** Cada empresa cliente accede a su propio portal aislado, donde sus administradores y empleados gestionan sus procesos de RRHH internos.

## Arquitectura Propuesta

### Multi-Inquilino (Multi-tenancy)

El sistema se construirá sobre una arquitectura multi-inquilino para garantizar el aislamiento y la seguridad de los datos de cada cliente.

*   **Aislamiento de Datos:** Cada empresa cliente tendrá su propia base de datos o un esquema de datos completamente aislado dentro de una base de datos principal. Esto asegura que la información de una empresa no sea accesible por otra.
*   **Base de Datos Global:** Existirá una base de datos central (`global_db`) que contendrá información común y de configuración del sistema, como:
    *   Lista de empresas clientes (tenants) y el estado de su suscripción.
    *   Plantillas de convenios colectivos, listas de ART, y otras normativas laborales que son comunes a todos.
    *   Configuraciones globales del sistema.
*   **Base de Datos por Inquilino (`tenant_db`):** Cada cliente operará sobre su propia base de datos (`tenant_db_empresa_A`, `tenant_db_empresa_B`, etc.), que almacenará:
    *   Datos de empleados.
    *   Recibos de sueldo, evaluaciones, documentos.
    *   Configuraciones personalizadas y campos adicionales.

### Extensibilidad y Personalización

Para cumplir con el requisito de que cada empresa pueda solicitar funcionalidades o campos a medida:

*   **Campos Personalizados:** Las tablas clave (como la de `empleados`) en las bases de datos de los inquilinos contendrán una columna de tipo `JSON` o `TEXT` llamada `custom_fields`. Esto permitirá almacenar datos estructurados específicos para cada cliente sin necesidad de alterar el esquema de la base de datos principal, ofreciendo una alta flexibilidad.
*   **Módulos Configurables:** La arquitectura permitirá habilitar o deshabilitar módulos específicos (Ej: "Evaluaciones de Desempeño", "Encuestas") para cada cliente desde el Panel del Super Administrador.

### Tecnologías Utilizadas

*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Shadcn/ui
*   **Backend:** Node.js (con Next.js API Routes o un servidor separado)
*   **Base de Datos:** Un sistema SQL (como PostgreSQL) o NoSQL (como Firestore) que soporte el modelo de datos descrito.
*   **IA:** Genkit para funcionalidades de inteligencia artificial.

## Estructura de Directorios

La estructura de directorios del frontend seguirá las mejores prácticas de Next.js, utilizando **Route Groups** para separar los layouts y las rutas.

```
.
└── src
    ├── ai/
    ├── app
    │   ├── (app)                # Grupo para las rutas de la aplicación principal (con layout)
    │   │   ├── dashboard/
    │   │   ├── employees/
    │   │   ├── clients/         # Placeholder para el Panel de Clientes (Super Admin)
    │   │   └── layout.tsx       # Layout principal con AppShell (barra de navegación)
    │   ├── (auth)               # Grupo para las rutas de autenticación (sin layout)
    │   │   ├── login/
    │   │   └── layout.tsx       # Layout simple sin AppShell
    │   ├── globals.css
    │   └── layout.tsx           # Layout raíz de la aplicación
    ├── components/
    ├── hooks/
    └── lib/
```
Esta estructura garantiza una base limpia, estable y preparada para escalar según la visión estratégica del proyecto.
