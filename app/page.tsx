'use client';

import { FormEvent, useMemo, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@empresa.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const disabled = useMemo(() => !email.trim() || !password.trim(), [email, password]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert(`Inicio de sesión solicitado para: ${email}`);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="logo-orb" aria-hidden />
        <h1 className="brand">ConectAr</h1>
        <p className="tagline">GESTIÓN HUMANA, CONECTADA</p>

        <form onSubmit={handleSubmit} className="form" noValidate>
          <label htmlFor="email">EMAIL</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@empresa.com"
          />

          <label htmlFor="password">CONTRASEÑA</label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
            <button
              className="toggle-password"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>

          <button type="button" className="forgot-password">
            ¿Olvidé mi contraseña?
          </button>

          <button type="submit" disabled={disabled} className="submit-btn">
            Iniciar Sesión
          </button>
        </form>
      </section>
    </main>
  );
}
