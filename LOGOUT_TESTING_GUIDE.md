# Guía de Testing para Logout - ConectAr HR

## Resumen de Cambios

He mejorado el sistema de logout con logging exhaustivo para diagnosticar cualquier problema. Ahora verás mensajes detallados en la consola del navegador que te ayudarán a entender exactamente qué está pasando.

## Cómo Probar el Logout

### 1. **Acceder a la Aplicación**
```
URL: https://connect-ar-hr-main.vercel.app/
Email: owner@conectar.com
Contraseña: ConectAr2025! (o cualquier contraseña)
```

### 2. **Abrir la Consola del Navegador**
- Presiona `F12` en tu navegador
- Ve a la pestaña `Console`
- Deja la consola visible mientras pruebas el logout

### 3. **Hacer Click en "Cerrar Sesión"**
- Puedes encontrar el botón en:
  - **Opción 1**: En la esquina inferior izquierda del sidebar (ícono de logout)
  - **Opción 2**: En el dropdown de perfil (esquina superior derecha)
- Haz click en el botón

### 4. **Observar los Logs en Consola**
Deberías ver una secuencia de logs como esta:

```
[AppShell] Iniciando logout...
[AppShell] Limpiando sessionStorage...
[AppShell] SessionStorage limpiado
[AppShell] Llamando API logout...
[AppShell] Logout API retornó status: 200
[AppShell] Logout API exitosa: { success: true, redirect: "/login", message: "Sesión cerrada correctamente" }
[AppShell] Esperando 100ms antes de redirigir...
[AppShell] Redirigiendo a /login...
```

## Qué Significa Cada Log

| Log | Significado |
|-----|------------|
| `[AppShell] Iniciando logout...` | El botón fue clickeado y el handler se ejecutó |
| `[AppShell] Limpiando sessionStorage...` | Se está borrando la sesión del navegador |
| `[AppShell] SessionStorage limpiado` | La sesión se borró exitosamente |
| `[AppShell] Llamando API logout...` | Se envía solicitud al servidor para eliminar la cookie |
| `[AppShell] Logout API retornó status: 200` | El servidor respondió correctamente |
| `[AppShell] Logout API exitosa:...` | La respuesta fue procesada sin errores |
| `[AppShell] Redirigiendo a /login...` | Se envía usuario de vuelta a la pantalla de login |

## Si Algo Falla

### Scenario 1: No aparece el log "[AppShell] Iniciando logout..."
**Problema**: El botón no se está clickeando o el handler no se ejecuta
**Solución**: 
- Verifica que estés haciendo click en el botón correcto
- Abre DevTools (`F12`) y revisa que no haya errores JavaScript
- Intenta hacer click en ambas ubicaciones del botón (sidebar y dropdown)

### Scenario 2: Se detiene en "Llamando API logout..."
**Problema**: El servidor no está respondiendo
**Solución**:
- Ve a la pestaña `Network` en DevTools
- Intenta logout de nuevo
- Busca la solicitud POST a `/api/auth/logout`
- Revisa el status code y la respuesta

### Scenario 3: Ves un error como "Error en logout: ..."
**Problema**: Hubo una excepción durante el logout
**Solución**:
- Revisa el mensaje de error completo en consola
- Nota el stack trace si hay uno
- Verifica que las cookies estén habilitadas en el navegador

## Logs del Servidor

Si necesitamos debuggear en el servidor, también hay logging en `/api/auth/logout`:

```
[Logout API] POST recibida
[Logout API] Cookie de sesión encontrada
[Logout API] Sesión decodificada: { userId: "owner-1", userName: "ConectAr Propietario" }
[Logout API] Usuario cerró sesión: { userId: "owner-1", userName: "ConectAr Propietario" }
[Logout API] Cookie de sesión eliminada, retornando respuesta
```

Para ver estos logs:
1. Ve a https://vercel.com/
2. Selecciona el proyecto `ConectAr-HR-main`
3. Ve a `Deployments` > `Logs` > `Functions`
4. Busca la función `/api/auth/logout`
5. Haz click en logout en la app y revisa los logs

## Checklist de Verificación

- [ ] Puedo ver "[AppShell] Iniciando logout..." en la consola
- [ ] Puedo ver que se hace POST a `/api/auth/logout` en Network tab
- [ ] El status de la respuesta es 200
- [ ] El navegador me redirige a `/login` automáticamente
- [ ] No hay errores JavaScript en la consola
- [ ] Las cookies se eliminan correctamente (verificar Application > Cookies)

## Pasos Siguientes

Si todo funciona correctamente:
1. ✅ El logout debería ser completamente funcional
2. ✅ El usuario debería ser redirigido a login automáticamente
3. ✅ La sesión debería estar completamente limpiada

Si aún hay problemas, comparte:
- La secuencia de logs de consola
- El status de la solicitud en Network tab
- El User-Agent de tu navegador
- Cualquier mensaje de error exacto

