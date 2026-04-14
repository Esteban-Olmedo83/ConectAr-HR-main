# Session Management Architecture

## Overview

ConectAr HR implements a cookie-based HTTP session management system using Base64-encoded JSON payloads. Sessions are validated by middleware for every request to protected routes.

```
┌─────────────────┐
│   Browser       │
│  (HTTP Client)  │
└────────┬────────┘
         │
         │ 1. Login Request
         │
         ├─────────────────────────────────────────────┐
         │                                             │
         ▼                                             ▼
    ┌──────────────┐                           ┌──────────────────┐
    │ /api/auth/   │                           │ Database/Auth    │
    │   login      │                           │ Service          │
    └──────┬───────┘                           └──────────────────┘
           │
           │ 2. Create SessionPayload
           │    (Base64 encoded)
           │
           ▼
    ┌─────────────────────────────────────────────┐
    │ Set-Cookie: conectar_session={B64_PAYLOAD}  │
    │ HttpOnly, Secure, SameSite=Lax              │
    │ maxAge=14400 (4 hours)                      │
    └─────────────────────────────────────────────┘
           │
           │ 3. Browser stores cookie
           │
           └─────────────────────────────────────────────┐
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │ Cookie Store │
                                                  │ (HttpOnly)   │
                                                  └──────────────┘
           ┌─────────────────────────────────────────────┤
           │                                             │
           │ 4. Subsequent Requests                      │
           │                                             │
           ▼                                             │
    ┌────────────────────────┐                          │
    │ GET /dashboard         │                          │
    │ Cookie: conectar_...   │◄─────────────────────────┘
    └────────────┬───────────┘
                 │
                 │ 5. Middleware Validation
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │ 1. Extract cookie from request         │
    │ 2. Decode Base64                       │
    │ 3. Parse JSON                          │
    │ 4. Check expiration (expiresAt)        │
    │ 5. Validate role for route             │
    └────────────┬───────────────────────────┘
                 │
         ┌───────┴──────────┐
         │                  │
         ▼                  ▼
    ✓ Valid         ✗ Invalid/Expired
         │                  │
         │          Redirect to /login
         │
         ▼
    ✓ Allow Request
```

## Session Payload Structure

```typescript
interface SessionPayload {
  // Identity
  sessionId: string;           // Unique session identifier
  userId: string;              // User ID from database
  userName: string;            // User display name
  
  // Authorization
  role: 'admin' | 'manager' | 'employee' | 'owner';
  isManager: boolean;          // Cache for role check
  permissions: string[];       // Future: granular permissions
  
  // Lifecycle
  createdAt: string;           // ISO timestamp of creation
  lastActivityAt: string;      // ISO timestamp of last activity
  rotatedAt: string;           // ISO timestamp of last rotation
  expiresAt: string;           // ISO timestamp of expiration
}
```

## Cookie Format

```
Header: Set-Cookie
Value: conectar_session=eyJzZXNzaW9uSWQiOiJzZXNzaW9uLXt0aW1lc3RhbXB9In0=

Flags:
  - httpOnly: true (no access from JavaScript)
  - secure: true (HTTPS only in production)
  - sameSite: lax (CSRF protection)
  - maxAge: 14400 (4 hours = 14400 seconds)
  - path: / (all routes)

Base64 Payload (decoded):
{
  "sessionId": "session-1776205591343-vjgwdbtf2",
  "userId": "user-123",
  "userName": "John Doe",
  "role": "admin",
  "isManager": true,
  "permissions": [],
  "createdAt": "2026-04-14T22:26:31.343Z",
  "lastActivityAt": "2026-04-14T22:26:31.343Z",
  "rotatedAt": "2026-04-14T22:26:31.343Z",
  "expiresAt": "2026-04-15T02:26:31.343Z"
}
```

## API Endpoints

### 1. Login (`POST /api/auth/login`)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "user-123",
    "userName": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

**Set-Cookie Header:**
```
conectar_session={BASE64_ENCODED_SESSION}; HttpOnly; Secure; SameSite=Lax; MaxAge=14400; Path=/
```

**Error Responses:**
```
401: {"error": "Invalid email or password", "remainingAttempts": 2}
429: {"error": "Too many login attempts. Try again later."}
```

---

### 2. Logout (`POST /api/auth/logout`)

**Request:**
```
POST /api/auth/logout
Cookie: conectar_session={BASE64_ENCODED_SESSION}
```

**Response (200):**
```json
{
  "success": true,
  "redirect": "/login",
  "message": "Sesión cerrada correctamente"
}
```

**Set-Cookie Header (Delete):**
```
conectar_session=; HttpOnly; Secure; SameSite=Lax; MaxAge=0; Path=/
```

**Notes:**
- Works even without active session
- `maxAge: 0` signals cookie deletion to browser
- `value: ''` clears cookie content
- GET requests also supported (redirects to POST)

---

### 3. Refresh Session (`POST /api/auth/refresh-session`)

**Request:**
```
POST /api/auth/refresh-session
Cookie: conectar_session={BASE64_ENCODED_SESSION}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sesión renovada correctamente.",
  "session": {
    "userId": "user-123",
    "userName": "John Doe",
    "role": "admin",
    "expiresAt": "2026-04-15T02:35:00.000Z",
    "sessionId": "session-1776205591343-vjgwdbtf2"
  }
}
```

**Set-Cookie Header (Updated):**
```
conectar_session={NEW_BASE64_WITH_EXTENDED_EXPIRY}; HttpOnly; Secure; SameSite=Lax; MaxAge=14400; Path=/
```

**Error Responses:**
```
401: {"success": false, "message": "No hay sesión activa."}
401: {"success": false, "message": "Sesión inválida o expirada."}
429: {"success": false, "message": "Demasiadas solicitudes de refresco..."}
500: {"success": false, "message": "Error interno del servidor."}
```

**Rate Limiting:**
- 30 attempts per IP per hour
- Tracked per endpoint

---

## Middleware Flow

**Location:** `/src/middleware.ts`

```
1. Extract Cookie
   ├─ Get 'conectar_session' from request.cookies
   ├─ Decode Base64
   └─ Parse JSON
       
2. Validate Session
   ├─ Check if parsing succeeded
   ├─ Check expiration (new Date(expiresAt) < new Date())
   └─ Extract role from sessionData
       
3. Route-Based Access Control
   ├─ Public Routes (/login, /signup)
   │  └─ Always allow
   │  └─ Redirect to dashboard if already authenticated
   │
   ├─ Owner Routes (/owner/*)
   │  └─ Require: session + !expired + role==='owner'
   │  └─ Otherwise: redirect to /login with error=unauthorized
   │
   ├─ Protected Routes (/dashboard, /employees, etc)
   │  └─ Require: session + !expired + role !== 'guest'
   │  └─ Otherwise: redirect to /login with error=authentication_required
   │
   └─ Other Routes
      └─ Allow all (static assets, APIs, etc)
```

## Library Integration

### `/src/lib/session.ts`

**Core Functions:**

```typescript
// Create Base64-encoded session for login
setSessionCookie(sessionData: {
  userId: string;
  userName: string;
  role: 'admin' | 'manager' | 'employee' | 'owner';
  isManager: boolean;
}): string
// Returns: Base64(JSON) string for cookie value

// Decode and parse session from cookie
parseSessionCookie(cookieValue: string): SessionPayload | null
// Returns: SessionPayload object or null if invalid

// Extend session TTL by 4 hours (used by refresh endpoint)
extendSessionCookie(session: SessionPayload): string
// Returns: Base64 with new expiresAt

// Register session as active (for audit trail)
trackActiveSession(session: SessionPayload): void
// Returns: void (logging only)
```

### `/src/lib/audit-log.ts`

**Centralized Logging:**

```typescript
logEvent(
  eventType: string,      // 'LOGIN', 'LOGOUT', 'SESSION_REFRESHED', etc
  message: string,        // Human-readable message
  userId?: string,        // User ID (optional)
  userName?: string,      // User name (optional)
  level?: 'info' | 'warn' | 'error'
): void

// Examples:
logEvent('USER_LOGOUT', 'User closed session', 'user-123', 'John Doe');
logEvent('SESSION_DECODE_ERROR', 'Failed to decode Base64', undefined, undefined, 'warn');
logEvent('REFRESH_SESSION_ERROR', 'Session expired', undefined, undefined, 'error');
```

### `/src/lib/rate-limiter.ts`

**Rate Limiting:**

```typescript
// Check if IP is rate-limited for endpoint
isRateLimited(ip: string, endpoint: string): boolean

// Record an attempt (increments counter)
recordAttempt(ip: string, endpoint: string): void

// Get number of remaining attempts before lockout
getRemainingAttempts(ip: string, endpoint: string): number

// Clear rate limit records after successful auth
clearAttempts(ip: string, endpoint: string): void

// Configuration by endpoint:
const ENDPOINT_LIMITS = {
  '/api/auth/login': { max: 5, ttlMs: 15 * 60 * 1000 },
  '/api/auth/signup': { max: 3, ttlMs: 15 * 60 * 1000 },
  '/api/auth/refresh-session': { max: 30, ttlMs: 60 * 60 * 1000 },
};
```

## Security Considerations

### 1. Cookie Security

| Property | Value | Purpose |
|----------|-------|---------|
| `httpOnly` | true | Prevents XSS attacks (no JS access) |
| `secure` | true | HTTPS only in production |
| `sameSite` | lax | CSRF protection |
| `maxAge` | 14400 | 4-hour session TTL |
| `path` | / | Available to entire application |

### 2. Encoding Strategy

- **Why Base64?** Human-readable for debugging; prevents accidental JSON parsing
- **No Encryption:** Sessions assumed to be transmitted over HTTPS
- **Future:** Consider JWT (encrypted) if cross-domain needed

### 3. Expiration Strategy

- **Server-side validation:** Middleware checks `expiresAt` timestamp
- **Browser ignores maxAge:** Cookie may persist; validation prevents use
- **No refresh token:** 4-hour sessions; users can call `/api/auth/refresh-session`

### 4. CSRF Protection

- `sameSite: lax` prevents cross-site cookie submission
- Cookie auto-sent only for same-origin requests
- Form submissions must have explicit credentials

### 5. Rate Limiting

- **Per-endpoint:** Different limits for login/signup/refresh
- **Per-IP:** Track by client IP (x-forwarded-for header)
- **Sliding window:** Resets every 24 hours per date key

## Failure Modes & Recovery

### Scenario 1: Cookie Corruption

**Detection:**
```typescript
try {
  const json = atob(cookieValue);           // Decode Base64
  const session = JSON.parse(json);         // Parse JSON
} catch {
  // Cookie is corrupted
  return null; // Middleware treats as unauthenticated
}
```

**Recovery:**
- Middleware redirects to `/login`
- User must re-authenticate
- New clean session created

### Scenario 2: Session Expiration

**Detection:**
```typescript
const isExpired = new Date(session.expiresAt) < new Date();
```

**Recovery:**
- Middleware redirects to `/login` with `error=authentication_required`
- User can either login again or use `/api/auth/refresh-session` if called before expiry

### Scenario 3: Role Change

**Current Behavior:**
- Role is cached in session
- Changes take effect only after re-login
- Consider: Check role in every request to DB (future optimization)

**Workaround:**
- Admin can force logout by clearing user's sessions (future feature)
- User logs out and logs back in to refresh role

## Observability

### Logs Captured

```
[LOGIN] - Successful login
[LOGOUT] - Logout request
[USER_LOGOUT] - Logout completed
[LOGOUT_ERROR] - Error during logout
[SESSION_DECODED] - Session successfully decoded
[SESSION_DECODE_ERROR] - Failed to decode session
[NO_SESSION_ON_LOGOUT] - Logout without active session
[SESSION_REFRESHED] - Session TTL extended
[REFRESH_SESSION_ERROR] - Error during refresh
[REFRESH_RATE_LIMITED] - Rate limit exceeded
```

### Metrics to Track

```
- Login success rate (%)
- Logout count (per hour)
- Session refresh count (per hour)
- Rate limit hits (per IP)
- Invalid session attempts (per hour)
- Avg session duration (minutes)
- Session expiration rate (%)
```

## Future Improvements

### 1. JWT-based Sessions
- Stateless validation (no DB lookup)
- Asymmetric signing (public key validation)
- Better for microservices

### 2. Redis Session Store
- Replace in-memory rate limiting
- Persist active sessions
- Distributed session tracking

### 3. Granular Permissions
- Move beyond role-based (RBAC)
- Implement attribute-based access (ABAC)
- Fine-grained resource-level permissions

### 4. Session Rotation
- Rotate sessionId periodically
- Invalidate old tokens
- Detect session fixation attacks

### 5. Biometric Re-authentication
- Require 2FA for sensitive operations
- Session binding to device fingerprint
- Progressive authentication

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Status:** PRODUCTION READY
