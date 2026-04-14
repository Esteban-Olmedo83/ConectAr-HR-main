
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = () => {
        // En una aplicación real, aquí llamarías a Firebase Auth para crear el usuario.
        // Por ahora, solo mostraremos una notificación y redirigiremos al login.
        console.log(`Intento de registro para: ${email}`);

        // Simulación de éxito
        toast({
            title: '¡Registro Exitoso!',
            description: 'Ahora puedes iniciar sesión con tus nuevas credenciales.',
        });

        router.push('/login');
    };

    return (
        <Card className="w-full max-w-sm">
             <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <Logo className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline">
                    <div>Crear una Cuenta</div>
                </CardTitle>
                <CardDescription>
                   Ingresa tus datos para registrarte en la plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="nombre@empresa.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                        id="password" 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" onClick={handleSignup}>
                    Registrarse
                </Button>
                <div className="text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="underline font-medium text-primary">
                        Inicia sesión
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
