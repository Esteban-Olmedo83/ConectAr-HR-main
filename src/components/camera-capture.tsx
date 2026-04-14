'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Camera, AlertTriangle } from 'lucide-react';

interface CameraCaptureProps {
  onPhotoTaken: (imageSrc: string) => void;
}

export function CameraCapture({ onPhotoTaken }: CameraCaptureProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, habilita los permisos de la cámara en tu navegador para usar esta función.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onPhotoTaken(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md bg-muted rounded-md overflow-hidden border">
        <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
        {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Acceso a Cámara Requerido</AlertTitle>
                    <AlertDescription>
                        Por favor, permite el acceso a la cámara para usar esta función. Puede que necesites cambiar los permisos en la configuración de tu navegador.
                    </AlertDescription>
                </Alert>
            </div>
        )}
         {hasCameraPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <p>Solicitando permiso de cámara...</p>
            </div>
        )}
      </div>
      <Button onClick={handleCapture} disabled={!hasCameraPermission}>
        <Camera className="mr-2 h-4 w-4" />
        Tomar Foto
      </Button>
    </div>
  );
}
