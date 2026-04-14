'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, GripVertical, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CommentThread } from '@/components/comments/comment-thread';

import type { Vacancy, KanbanLane, VacancyStatus, Candidate } from '@/lib/definitions';
import { initialVacancies } from '@/lib/mock-data';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const lanes: KanbanLane[] = [
    { id: 'Nuevas Vacantes', title: 'Nuevas Vacantes' },
    { id: 'En Proceso de Selección', title: 'En Proceso de Selección' },
    { id: 'Entrevistas', title: 'Entrevistas' },
    { id: 'Oferta Enviada', title: 'Oferta Enviada' },
    { id: 'Contratado', title: 'Contratado' },
];

function KanbanCard({ vacancy, onOpenComments }: { vacancy: Vacancy, onOpenComments?: (v: Vacancy) => void }) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: vacancy.id,
        data: {
            type: 'Vacancy',
            vacancy,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-4 rounded-lg bg-card border-2 border-primary opacity-50"
            >
                <div className="flex justify-between items-start">
                    <p className="font-bold text-sm pr-2">{vacancy.title}</p>
                    {onOpenComments && (
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenComments(vacancy)}>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{vacancy.department}</p>
            </div>
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none mb-4 bg-card hover:shadow-md transition-shadow"
        >
            <CardHeader className="p-3">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-sm pr-2">{vacancy.title}</p>
                    <div className="flex gap-1 items-center">
                        {onOpenComments && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1" onClick={(e) => { e.stopPropagation(); onOpenComments(vacancy); }}>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">{vacancy.department}</p>
            </CardHeader>
            {vacancy.candidates.length > 0 && (
                <CardContent className="p-3 pt-0">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold">Candidatos ({vacancy.candidates.length})</p>
                        <div className="flex -space-x-2 overflow-hidden">
                            {vacancy.candidates.map(candidate => (
                                <Avatar key={candidate.id} className="h-6 w-6 border-2 border-card">
                                    <AvatarImage src={candidate.avatar} data-ai-hint="person face" />
                                    <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

function KanbanLane({ lane, vacancies, onOpenComments }: { lane: KanbanLane; vacancies: Vacancy[], onOpenComments?: (v: Vacancy) => void }) {
    const vacanciesIds = useMemo(() => {
        return vacancies.map(v => v.id);
    }, [vacancies]);

    const { setNodeRef } = useSortable({
        id: lane.id,
        data: {
            type: 'Lane',
        },
    });

    const count = vacancies.length;

    return (
        <div
            ref={setNodeRef}
            className="w-72 flex-shrink-0"
        >
            <div className="bg-muted rounded-t-lg p-3 flex justify-between items-center">
                <h3 className="font-semibold text-sm">{lane.title}</h3>
                <Badge variant="secondary">{count}</Badge>
            </div>
            <ScrollArea className="h-[60vh] bg-muted/50 rounded-b-lg">
                 <div className="p-4 pt-2">
                    <SortableContext items={vacanciesIds}>
                        {vacancies.map(vacancy => (
                            <KanbanCard key={vacancy.id} vacancy={vacancy} onOpenComments={onOpenComments} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    );
}


export default function TalentPage() {
    const [vacancies, setVacancies] = useState<Vacancy[]>(initialVacancies);
    const [activeVacancy, setActiveVacancy] = useState<Vacancy | null>(null);
    const [vacancyForComments, setVacancyForComments] = useState<Vacancy | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    const vacanciesByLane = useMemo(() => {
        return lanes.reduce((acc, lane) => {
            acc[lane.id] = vacancies.filter(v => v.status === lane.id);
            return acc;
        }, {} as Record<VacancyStatus, Vacancy[]>);
    }, [vacancies]);

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Vacancy') {
            setActiveVacancy(event.active.data.current.vacancy);
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveVacancy(null);
        const { active, over } = event;
        if (!over) return;
        if (active.id === over.id) return;
    }
    
    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;
        
        const isActiveAVacancy = active.data.current?.type === 'Vacancy';
        const isOverAVacancy = over.data.current?.type === 'Vacancy';
        const isOverALane = over.data.current?.type === 'Lane';

        if (!isActiveAVacancy) return;

        // Dropping a Vacancy over another Vacancy
        if (isActiveAVacancy && isOverAVacancy) {
             setVacancies(vacancies => {
                const activeIndex = vacancies.findIndex(v => v.id === activeId);
                const overIndex = vacancies.findIndex(v => v.id === overId);

                if (vacancies[activeIndex].status !== vacancies[overIndex].status) {
                    vacancies[activeIndex].status = vacancies[overIndex].status;
                    return arrayMove(vacancies, activeIndex, overIndex -1);
                }

                return arrayMove(vacancies, activeIndex, overIndex);
            })
        }

        // Dropping a Vacancy over a Lane
        if (isActiveAVacancy && isOverALane) {
             setVacancies(vacancies => {
                const activeIndex = vacancies.findIndex(v => v.id === activeId);
                vacancies[activeIndex].status = overId as VacancyStatus;
                return arrayMove(vacancies, activeIndex, activeIndex);
            })
        }
    }


  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Gestión de Talento</h1>
          <p className="text-muted-foreground mt-2">
            Administra el ciclo de vida completo de los empleados, desde la vacante hasta el offboarding.
          </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Vacante
        </Button>
      </header>

      <div className="flex-1 -mx-4">
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <ScrollArea className="h-full whitespace-nowrap">
                <div className="flex gap-4 p-4">
                    {lanes.map(lane => (
                        <KanbanLane
                            key={lane.id}
                            lane={lane}
                            vacancies={vacanciesByLane[lane.id]}
                            onOpenComments={setVacancyForComments}
                        />
                    ))}
                </div>
            </ScrollArea>
             {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeVacancy && (
                        <KanbanCard vacancy={activeVacancy} />
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
      </div>

      <Dialog open={!!vacancyForComments} onOpenChange={(open) => !open && setVacancyForComments(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notas sobre Vacante: {vacancyForComments?.title}</DialogTitle>
            <DialogDescription>
              Departamento de {vacancyForComments?.department}
            </DialogDescription>
          </DialogHeader>
          {vacancyForComments && (
            <div className="mt-4">
              <CommentThread 
                context="vacancy" 
                entityId={vacancyForComments.id} 
                title="Comentarios del Proceso"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
