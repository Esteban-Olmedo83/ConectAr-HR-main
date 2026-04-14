'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommentThread } from '@/components/comments/comment-thread';
import { Separator } from "@/components/ui/separator";

const announcements = [
  {
    id: 1,
    title: "Actualización de Políticas de Trabajo Remoto",
    date: "15 de Julio, 2024",
    excerpt: "Hemos actualizado nuestras políticas de trabajo híbrido para el próximo trimestre. Asegúrate de revisar los nuevos lineamientos en la sección de documentos...",
  },
  {
    id: 2,
    title: "¡Celebremos Juntos Nuestro Aniversario!",
    date: "10 de Julio, 2024",
    excerpt: "Este viernes celebraremos el 5to aniversario de la compañía con un after-office especial en la terraza. ¡No te lo pierdas!",
  },
  {
    id: 3,
    title: "Nuevos Beneficios de Salud y Bienestar",
    date: "5 de Julio, 2024",
    excerpt: "Nos complace anunciar la incorporación de nuevos beneficios en nuestro plan de salud, incluyendo clases de yoga y meditación online.",
  },
];

export default function CommunicationsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Comunidad y Novedades</h1>
        <p className="text-muted-foreground mt-2">
          Mantente al día con las últimas noticias, publicaciones y anuncios de la empresa. Interactúa con el equipo.
        </p>
      </header>
      
      <div className="grid gap-6">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <CardTitle className="font-headline">{announcement.title}</CardTitle>
              <CardDescription>{announcement.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{announcement.excerpt}</p>
            </CardContent>
            <Separator />
            <div className="p-4 bg-muted/10 rounded-b-xl">
               <CommentThread 
                 context="community" 
                 entityId={`post-${announcement.id}`}
                 title="Comentarios"
               />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
