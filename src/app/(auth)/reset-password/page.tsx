'use client';

/**
 * @fileOverview Reset Password Page — ConectAr HR
 *
 * Página de recuperación de contraseña en 3 pasos. Mantiene la estética
 * consistente con el resto del módulo de autenticación (glassmorphism,
 * gradiente de marca) y delega toda la lógica de pasos al ResetForm.
 */

import Image from 'next/image';
import { ResetForm } from './components/reset-form';

const WORDMARK_SRC = '/logotipo-conectar-transparent.png';
const ICON_SRC = '/marca-conectar-transparent.png';

export default function ResetPasswordPage() {
  return (
    <main
      className="relative min-h-screen w-full overflow-hidden px-4 py-8"
      style={{
        background:
          'radial-gradient(circle at 12% 22%, rgba(236, 151, 218, 0.48), transparent 34%), radial-gradient(circle at 86% 24%, rgba(255, 211, 228, 0.34), transparent 31%), radial-gradient(circle at 46% 44%, rgba(175, 224, 255, 0.34), transparent 39%), linear-gradient(165deg, #7f8df0 0%, #73a8ef 46%, #b7b8f7 100%)',
      }}
    >
      {/* Overlay de destellos */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_42%,rgba(255,255,255,0.18),transparent_16%),radial-gradient(circle_at_79%_39%,rgba(255,255,255,0.17),transparent_18%),radial-gradient(circle_at_16%_70%,rgba(255,255,255,0.16),transparent_15%),radial-gradient(circle_at_88%_68%,rgba(255,255,255,0.14),transparent_14%)]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[520px] items-center py-8">
        <div className="w-full rounded-[34px] border border-white/35 bg-white/16 px-7 py-8 shadow-[0_26px_50px_rgba(23,43,112,0.22)] backdrop-blur-[9px] sm:px-9">
          {/* Logo */}
          <div className="relative mb-4 text-center">
            <div className="relative z-10 mx-auto mb-0 flex w-full max-w-[160px] justify-center">
              <Image
                src={WORDMARK_SRC}
                alt="ConectAr"
                width={552}
                height={188}
                className="h-auto w-full object-contain drop-shadow-[0_4px_8px_rgba(15,27,51,0.2)]"
                priority
              />
            </div>
            <div className="relative z-10 mx-auto -mt-6 w-[130px]">
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

          {/* Header */}
          <div className="mb-1 text-center">
            <p className="text-[0.68rem] font-semibold tracking-[0.35em] text-[#434f7b]">
              RECUPERAR CONTRASEÑA
            </p>
          </div>
          <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-[#b6c3f5cc] to-transparent" />

          <ResetForm />
        </div>
      </section>
    </main>
  );
}
