import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline">Chat Interno</h1>
      <p className="text-muted-foreground mt-2">
        Módulo en construcción.
      </p>
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Mensajería</CardTitle>
            <CardDescription>Comunícate con tu equipo.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
}
