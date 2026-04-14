# Convenciones del Proyecto ConectAr HR

Estándares de desarrollo, commits, branches y versioning.

---

## 📋 **Estructura de Ramas**

```
main/
  └─ Código en PRODUCCIÓN (Vercel)
  └─ Solo merges via Pull Request
  └─ Requiere aprobación de Junta Directiva

develop/
  └─ Código en PRE-PRODUCCIÓN
  └─ Base para nuevas features
  └─ Testing antes de merge a main

feature/*
  └─ feature/agregar-roles-nuevos
  └─ feature/mejorar-dashboard
  └─ feature/integrar-supabase
  └─ Se crean FROM develop
  └─ Se mergean a develop PRIMERO, luego a main
```

---

## 💬 **Formato de Commits**

### **Sintaxis**
```
<tipo>(<scope>): <descripción>

<cuerpo opcional>

<footer opcional>
```

### **Tipos de Commit**
```
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Formato, espacios, comillas (sin cambio de lógica)
refactor: Reescritura de código sin cambiar funcionalidad
perf:     Mejoras de performance
test:     Agregar o modificar tests
chore:    Dependencias, configuración, etc.
```

### **Ejemplos**
```
✅ feat(auth): agregar validación de email en signup
✅ fix(dashboard): corregir gráfico que no cargaba
✅ docs(readme): actualizar instrucciones de setup
✅ refactor(components): simplificar AppShell
❌ hicimos cosas
❌ FIXED BUGS
```

---

## 🏷️ **Versionado Semántico**

**Format**: `MAJOR.MINOR.PATCH`

```
1.0.0 → 1.0.1 = Bug fix menor
        1.1.0 = Nueva feature
        2.0.0 = Cambio que rompe compatibilidad
```

### **Ejemplos**
```
1.0.0   = Release inicial
1.0.1   = Fix en login
1.1.0   = Agregar nuevo rol "Supervisor"
2.0.0   = Migración a Supabase real (breaking change)
```

---

## 🔄 **Flujo de Pull Request**

### **1. Crear rama feature**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/descripcion-mejora
```

### **2. Hacer commits limpios**
```bash
git add archivo1 archivo2
git commit -m "feat(module): descripción clara"
```

### **3. Push a GitHub**
```bash
git push origin feature/descripcion-mejora
```

### **4. Crear Pull Request**
- Base: `develop` (no main)
- Título: `[tipo] descripción`
- Descripción: detallar qué cambia y por qué
- Screenshots si es UI
- Checklist: ✅ TypeScript, ✅ tested locally

### **5. Esperar aprobación de Junta Directiva**
- Testing en preview
- Feedback
- Aprobación ✅

### **6. Merge a develop, luego a main**
```bash
# Después de aprobación:
git merge feature/descripcion-mejora
git push origin develop

# Cuando esté listo para producción:
git checkout main
git merge develop
git push origin main
```

### **7. Actualizar CHANGELOG**
```markdown
## [1.0.1] - 2026-04-15

### Añadido
- [descripción de la mejora aprobada]
```

---

## 📝 **Pull Request Template**

Usar para cada PR:

```markdown
## Descripción
Qué hace este PR y por qué

## Tipo de cambio
- [ ] Nueva feature
- [ ] Bug fix
- [ ] Breaking change

## Testing
- [ ] Testeado localmente
- [ ] Sin errores TypeScript
- [ ] Validaciones funcionan

## Screenshots (si aplica)
[Antes/Después]

## Aprobación Requerida Por
- [ ] Esteban Olmedo (Junta Directiva)
```

---

## ✅ **Checklist Antes de Push**

```
[ ] TypeScript: npm run lint (0 errores)
[ ] Código formateado: consistent con proyecto
[ ] Commits descriptivos: "feat:" "fix:" etc
[ ] Rama correcta: feature/* desde develop
[ ] Sin datos sensibles: credenciales, keys
[ ] Sin console.log: solo en debug
[ ] Tests locales: funciona en http://localhost:3000
```

---

## 🚫 **Qué NO Hacer**

```
❌ Hacer commits directos a main
❌ Merges sin PR
❌ Commits sin descripción: "update" "fix"
❌ Mezclar múltiples features en un PR
❌ Pushear credenciales o .env
❌ Reescribir historial de main
❌ Cambios sin aprobación previa
```

---

## 📦 **Estructura de Commits**

### **Ejemplo de mejora completa**

```bash
# 1. Crear rama
git checkout -b feature/agregar-rol-supervisor

# 2. Hacer cambios

# 3. Commit 1
git commit -m "feat(roles): agregar tipo Supervisor en enums"

# 4. Commit 2  
git commit -m "feat(auth): validar rol Supervisor en guards"

# 5. Commit 3
git commit -m "feat(ui): mostrar opciones Supervisor en dropdown"

# 6. Commit 4
git commit -m "docs(roles): documentar permisos del rol Supervisor"

# 7. Push
git push origin feature/agregar-rol-supervisor
```

---

## 🔐 **Seguridad en Commits**

```
✅ Incluir en commits:
  - Cambios de código
  - Actualizaciones de docs
  - Cambios de configuración pública

❌ NUNCA commitear:
  - .env o credenciales
  - node_modules/
  - .next/ o build folders
  - Datos sensibles
  - Archivos personales
```

---

## 📊 **Ejemplo Completo de Workflow**

```
1. Jarvis propone:
   "MEJORA: Agregar validación de documento único"

2. Esteban aprueba:
   "✅ Aprobado - implementa"

3. Jarvis desarrolla:
   - Crea feature/validacion-documento
   - Hace commits descriptivos
   - Push a GitHub
   - Crea PR

4. Esteban testea:
   - Abre preview en Vercel
   - Prueba la feature
   - Aprueba o pide cambios

5. Si aprueba:
   - Merge a develop
   - Merge a main
   - Vercel despliega automático
   - Actualizar CHANGELOG v1.0.1

6. Live en producción:
   - https://conectar-hr.vercel.app
```

---

## 📚 **Referencias**

- [Conventional Commits](https://www.conventionalcommits.org/es/)
- [Semantic Versioning](https://semver.org/lang/es/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Última actualización**: 14 Abril 2026
