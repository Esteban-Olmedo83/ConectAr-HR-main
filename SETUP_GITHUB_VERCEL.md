# 🚀 Setup GitHub + Vercel - Guía Paso a Paso

**Responsable**: Esteban Olmedo (Junta Directiva)  
**Ingeniero**: Jarvis  
**Fecha**: 14 Abril 2026

---

## ✅ PASO 1: Crear Repositorio en GitHub

### 1.1 Ir a GitHub
```
https://github.com/new
```

### 1.2 Configuración del Repositorio
```
Repository name: ConectAr-HR-main
Description: Sistema de Gestión de Capital Humano v1.0.0.0
Visibility: Public (para portfolio)
.gitignore: Node
License: MIT (opcional)
```

### 1.3 Crear el Repositorio
Click en "Create repository"

---

## ✅ PASO 2: Conectar Local a GitHub

### 2.1 Copiar URL del Repositorio
```
https://github.com/[tu-usuario]/ConectAr-HR-main.git
```

### 2.2 Ejecutar en Terminal (en la carpeta del proyecto)
```bash
git remote add origin https://github.com/[tu-usuario]/ConectAr-HR-main.git
git branch -M main
git push -u origin main
```

### 2.3 Verificar
```bash
git remote -v
# Debe mostrar:
# origin  https://github.com/[tu-usuario]/ConectAr-HR-main.git (fetch)
# origin  https://github.com/[tu-usuario]/ConectAr-HR-main.git (push)
```

---

## ✅ PASO 3: Crear Rama Develop

### 3.1 Crear rama desde GitHub UI O terminal
```bash
git checkout -b develop
git push -u origin develop
```

### 3.2 Configurar Rama Protegida (GitHub)
```
Ir a: Repository Settings → Branches
Click en "Add rule"
Branch name pattern: main
  ✅ Require pull request reviews
  ✅ Require status checks to pass
  ✅ Require code reviews
```

---

## ✅ PASO 4: Conectar Vercel

### 4.1 Ir a Vercel
```
https://vercel.com/signup
```

### 4.2 Conectar GitHub Account
```
Click en "Continue with GitHub"
Autorizar Vercel
```

### 4.3 Importar Proyecto
```
Seleccionar: ConectAr-HR-main
Click "Import"
```

### 4.4 Configuración Vercel
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Environment Variables: (dejar en blanco por ahora)
```

### 4.5 Deploy
```
Click "Deploy"
Esperar ~2-3 minutos
URL automática: conectar-hr.vercel.app (o parecida)
```

---

## ✅ PASO 5: Configurar Vercel para Branches

### 5.1 Ir a Project Settings
```
https://vercel.com/[tu-cuenta]/ConectAr-HR-main/settings
```

### 5.2 Git → Production Branch
```
Production Branch: main
Preview Deployments: All branches and pull requests
```

### 5.3 Guardar
```
Vercel ahora desplegará:
- main → https://conectar-hr.vercel.app (Producción)
- feature/* → https://[nombre]-git-feature-xyz.vercel.app (Preview)
- develop → https://develop-[hash].vercel.app (Preview)
```

---

## ✅ PASO 6: Crear Personal Access Token (Opcional)

Para commits automáticos, crear token en GitHub:

```
GitHub → Settings → Developer settings → Personal access tokens
Generar nuevo token:
  ✅ repo
  ✅ read:user
  ✅ user:email
Copiar token y guardar en lugar seguro
```

---

## 🎯 RESULTADO FINAL

```
✅ Repositorio GitHub activo
   └─ https://github.com/[tu-usuario]/ConectAr-HR-main

✅ Rama main (Producción)
   └─ Protegida con PR reviews
   └─ Automáticamente despliega en Vercel

✅ Rama develop (Pre-producción)
   └─ Base para features
   └─ Preview en Vercel

✅ Rama feature/* (Desarrollo)
   └─ Una por cada mejora
   └─ Preview automático en Vercel

✅ URL en Vivo
   └─ Producción: https://conectar-hr.vercel.app
   └─ Previews: https://[feature]-git-[rama].vercel.app
```

---

## 📊 URLs Importantes

| Ambiente | URL | Status |
|----------|-----|--------|
| GitHub Repo | https://github.com/[usuario]/ConectAr-HR-main | Active |
| Vercel Dashboard | https://vercel.com/[cuenta]/ConectAr-HR-main | Active |
| Production | https://conectar-hr.vercel.app | Live |
| Preview (develop) | https://develop-*.vercel.app | On PR |

---

## 🔄 Flujo Después del Setup

```
1. Jarvis propone mejora en Improvement Template
   ↓
2. Esteban aprueba (Junta Directiva)
   ↓
3. Jarvis crea: git checkout -b feature/nombre
   ↓
4. Jarvis hace cambios y commits descriptivos
   ↓
5. Jarvis: git push origin feature/nombre
   ↓
6. Jarvis crea Pull Request en GitHub (base: develop)
   ↓
7. Vercel crea Preview automático
   ↓
8. Esteban accede a preview y testea
   ↓
9. ¿Funciona? 
   ├─ SÍ: Aprueba PR → Merge a develop
   └─ NO: Pide cambios → Volver a Paso 3
   ↓
10. Cuando desarrollar listo para producción:
    Merge develop → main
    ↓
11. Vercel despliega a producción automático
    ↓
12. Actualizar CHANGELOG.md
    ↓
13. ✨ LIVE en producción
```

---

## ⚠️ Notas Importantes

```
❌ NUNCA hacer push directo a main
❌ NUNCA hacer merge sin PR review
❌ NUNCA commitear .env o credenciales
✅ SIEMPRE usar ramas feature/*
✅ SIEMPRE hacer commits descriptivos
✅ SIEMPRE crear PR para cambios
```

---

**Setup completado**: [Tu nombre aquí cuando hagas esto]  
**Fecha**: [DD/MM/YYYY]  
**Verificado por Jarvis**: ☐
