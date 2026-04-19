'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, Building2, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type TokenState = 'loading' | 'valid' | 'invalid' | 'activated' | 'success';

interface InvitationData {
  companyName: string;
  adminEmail:  string;
  plan:        string;
  modules:     string[];
  expiresAt:   string;
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [state,       setState]       = useState<TokenState>('loading');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [invitation,  setInvitation]  = useState<InvitationData | null>(null);
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [formError,   setFormError]   = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) { setState('invalid'); setErrorMsg('No se proporcionó un token de activación.'); return; }

    fetch(`/api/auth/activate?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setInvitation(data);
          setState('valid');
        } else {
          setErrorMsg(data.error ?? 'Token inválido.');
          setState(data.error?.includes('ya fue utilizada') ? 'activated' : 'invalid');
        }
      })
      .catch(() => { setErrorMsg('Error de conexión. Intentá de nuevo.'); setState('invalid'); });
  }, [token]);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (password.length < 8) { setFormError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirm) { setFormError('Las contraseñas no coinciden.'); return; }

    setSubmitting(true);
    try {
      const res  = await fetch('/api/auth/activate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setState('success');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setFormError(data.error ?? 'Error al activar la cuenta.');
      }
    } catch {
      setFormError('Error de conexión. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logotipo-conectar-transparent.png" alt="ConectAr" width={160} height={54} className="h-12 w-auto object-contain" />
        </div>

        {/* ── Loading ── */}
        {state === 'loading' && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Verificando invitación…</p>
            </CardContent>
          </Card>
        )}

        {/* ── Invalid / expired ── */}
        {(state === 'invalid' || state === 'activated') && (
          <Card className="border-destructive/30">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  {state === 'activated' ? 'Invitación ya utilizada' : 'Invitación inválida'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Ir al login</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Success ── */}
        {state === 'success' && (
          <Card className="border-green-300 dark:border-green-800">
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">¡Cuenta activada con éxito!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {invitation?.companyName} está lista. Redirigiendo al login…
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Activation form ── */}
        {state === 'valid' && invitation && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Activar cuenta de empresa</CardTitle>
              </div>
              <CardDescription>
                Completá los datos para activar tu empresa en ConectAr HR.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Company info */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">{invitation.companyName}</span>
                  <Badge variant="outline" className="ml-auto text-xs">{invitation.plan}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{invitation.adminEmail}</span>
                </div>
                {invitation.modules.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {invitation.modules.map(m => (
                      <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Password form */}
              <form onSubmit={handleActivate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Crear contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repetí la contraseña"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                </div>

                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Activando…</>
                    : 'Activar empresa'}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                Invitación válida hasta{' '}
                {new Date(invitation.expiresAt).toLocaleString('es-AR', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
