'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setSession } from '@/lib/session';

const ICON_SRC = '/marca-conectar-transparent.png';
const WORDMARK_SRC = '/logotipo-conectar-transparent.png';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const disabled = useMemo(() => {
    return loading || !email.trim() || !password.trim();
  }, [email, password, loading]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Credenciales incorrectas',
        });
        return;
      }

      setSession({
        userId: data.user.userId,
        userName: data.user.userName,
        role: data.user.role,
        isManager: data.user.role === 'admin' || data.user.role === 'manager',
      });

      toast({
        title: 'Bienvenido',
        description: data.user.userName,
      });

      router.push(data.redirect || '/dashboard');
    } catch (error) {
      console.error('[Login] Error:', error);
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar',
      });
    }
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden px-4 py-8"
      style={{
        background:
          'radial-gradient(circle at 12% 22%, rgba(236, 151, 218, 0.48), transparent 34%), radial-gradient(circle at 86% 24%, rgba(255, 211, 228, 0.34), transparent 31%), radial-gradient(circle at 46% 44%, rgba(175, 224, 255, 0.34), transparent 39%), linear-gradient(165deg, #7f8df0 0%, #73a8ef 46%, #b7b8f7 100%)',
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_42%,rgba(255,255,255,0.18),transparent_16%),radial-gradient(circle_at_79%_39%,rgba(255,255,255,0.17),transparent_18%),radial-gradient(circle_at_16%_70%,rgba(255,255,255,0.16),transparent_15%),radial-gradient(circle_at_88%_68%,rgba(255,255,255,0.14),transparent_14%)]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[520px] items-center">
        <div className="w-full rounded-[34px] border border-white/35 bg-white/16 px-7 py-10 shadow-[0_26px_50px_rgba(23,43,112,0.22)] backdrop-blur-[9px] sm:px-9">
          <div className="relative mb-2 text-center">
            <div className="relative z-10 mx-auto mb-0 flex w-full max-w-[210px] justify-center">
              <Image
                src={WORDMARK_SRC}
                alt="ConectAr"
                width={552}
                height={188}
                className="h-auto w-full object-contain drop-shadow-[0_4px_8px_rgba(15,27,51,0.2)]"
                priority
              />
            </div>
            <div className="relative z-10 mx-auto -mt-7 w-[245px]">
              <Image
                src={ICON_SRC}
                alt="Marca ConectAr"
                width={245}
                height={245}
                className="h-auto w-full object-contain drop-shadow-[0_10px_18px_rgba(55,109,188,0.34)]"
                priority
              />
            </div>
          </div>

          <p className="mb-1 -mt-2 text-center text-[0.68rem] font-semibold tracking-[0.35em] text-[#434f7b]">
            GESTIÓN HUMANA, CONECTADA
          </p>
          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-[#b6c3f5cc] to-transparent" />

          <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]">
                EMAIL
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c77d2]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@empresa.com"
                  className="h-[52px] w-full rounded-[13px] border border-[#93a9ec8a] bg-[#f5f8ffda] pl-12 pr-4 text-[1.02rem] text-[#3d4664] outline-none transition focus:border-[#5b7fe8] focus:ring-4 focus:ring-[#5f84eb2b]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-[0.68rem] font-bold tracking-[0.24em] text-[#66729d]">
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1accb]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-[52px] w-full rounded-[13px] border border-[#9aaeea75] bg-[#ffffffc9] pl-12 pr-14 text-[1.02rem] text-[#3d4664] outline-none transition focus:border-[#5b7fe8] focus:ring-4 focus:ring-[#5f84eb2b]"
                />
                <button
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-transparent text-[#9aa6c8] transition hover:border-[#a8b5de9c] hover:bg-white/40 hover:text-[#647abf]"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="mt-3 h-[54px] rounded-[14px] border-none bg-[linear-gradient(90deg,#3f6ff0_0%,#4979f5_100%)] px-4 text-[1.12rem] font-semibold text-white shadow-[0_14px_26px_rgba(49,90,205,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
