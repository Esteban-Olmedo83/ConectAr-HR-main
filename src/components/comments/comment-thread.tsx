'use client';

/**
 * @fileOverview CommentThread — ConectAr HR
 *
 * Componente principal del sistema de comentarios.
 * Orquesta la carga, visualización, suscripción en tiempo real y
 * manipulación de comentarios (agregar, editar, borrar, responder, reaccionar).
 *
 * Soporta respuestas con 1 nivel de anidamiento visual.
 */

import { useEffect, useState, useMemo } from 'react';
import { MessageSquareOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import {
  getThread,
  addComment,
  editComment,
  deleteComment,
  toggleReaction,
  subscribeToThread,
  getCommentPermissions,
} from '@/lib/comments-store';
import type {
  Comment,
  CommentContext,
  CommentPermissions,
} from '@/lib/types/comments';
import { useToast } from '@/hooks/use-toast';

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

interface CommentThreadProps {
  /** Contexto/Módulo donde se usa el hilo */
  context: CommentContext;
  /** ID de la entidad relacionada (legajo, solicitud, etc) */
  entityId: string;
  /** Título a mostrar arriba del componente */
  title?: string;
}

// --------------------------------------------------------------------------
// Componente
// --------------------------------------------------------------------------

export function CommentThread({
  context,
  entityId,
  title = 'Notas y Comentarios',
}: CommentThreadProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<CommentPermissions | null>(null);

  // Estados de UI
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  // ------------------------------------------------------------------------
  // Efectos de carga y suscripción
  // ------------------------------------------------------------------------

  useEffect(() => {
    // 1. Cargar permisos locales
    setPermissions(getCommentPermissions());

    // 2. Cargar datos iniciales
    let isMounted = true;
    setIsLoading(true);

    getThread(context, entityId)
      .then((thread) => {
        if (isMounted) {
          setComments(thread.comments);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('[CommentThread] Error loading thread:', err);
        if (isMounted) setIsLoading(false);
      });

    // 3. Suscribirse a Realtime (Supabase)
    const unsubscribe = subscribeToThread(context, entityId, (updatedComments) => {
      if (isMounted) setComments(updatedComments);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [context, entityId]);

  // ------------------------------------------------------------------------
  // Lógica de datos agrupada por hilos (raíz + respuestas)
  // ------------------------------------------------------------------------

  // Agrupamos los comentarios en estructura de árbol (solo 1 nivel soportado)
  const groupedComments = useMemo(() => {
    const roots = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => !!c.parentId);

    return roots.map((root) => ({
      ...root,
      replies: replies.filter((r) => r.parentId === root.id),
    }));
  }, [comments]);

  // Contar los comentarios no eliminados
  const activeCommentCount = comments.filter((c) => !c.deleted).length;

  // ------------------------------------------------------------------------
  // Handlers de Input (Nuevo, Respuesta, Edición)
  // ------------------------------------------------------------------------

  const handleSubmit = async (content: string) => {
    // Modo: Edición
    if (editingComment) {
      const success = await editComment(editingComment.id, content);
      if (success) {
        // Optimistic update
        setComments((prev) =>
          prev.map((c) => (c.id === editingComment.id ? { ...c, content, editedAt: new Date().toISOString() } : c))
        );
        toast({ title: 'Comentario editado', description: 'Tus cambios fueron guardados.' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'No tienes permiso para editar este comentario.' });
      }
      setEditingComment(null);
      return;
    }

    // Modo: Nuevo o Respuesta
    const parentId = replyingTo?.id; // undefined si es nuevo comentario raíz
    const newComment = await addComment(context, entityId, content, parentId);

    if (newComment) {
      setComments((prev) => [...prev, newComment]);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo agregar el comentario.' });
    }

    setReplyingTo(null);
  };

  const handleCancelInput = () => {
    setReplyingTo(null);
    setEditingComment(null);
  };

  // ------------------------------------------------------------------------
  // Handlers de Acciones del Item
  // ------------------------------------------------------------------------

  const handleReply = (commentId: string, authorName: string) => {
    // Si queremos responder a una respuesta, se asocia al padre raíz (anidamiento de 1 nivel)
    const target = comments.find((c) => c.id === commentId);
    const parentRootId = target?.parentId ?? commentId;
    setReplyingTo({ id: parentRootId, name: authorName });
    setEditingComment(null);
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleDelete = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, deleted: true } : c))
      );
      toast({ title: 'Comentario eliminado' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No pudimos eliminar el comentario.' });
    }
  };

  const handleReact = async (commentId: string, emoji: string) => {
    const updatedThread = await toggleReaction(context, entityId, commentId, emoji);
    if (updatedThread) {
      // Reemplazamos todos los comentarios para asegurar consistencia
      setComments(updatedThread.comments);
    }
  };

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  if (isLoading || !permissions) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin mb-2" />
        <p className="text-sm">Cargando comentarios...</p>
      </div>
    );
  }

  const isInputFocused = !!replyingTo || !!editingComment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="font-bold">
          {activeCommentCount} {activeCommentCount === 1 ? 'nota' : 'notas'}
        </Badge>
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/20">
          <MessageSquareOff className="h-8 w-8 text-muted-foreground/50 mb-3 block" />
          <h4 className="font-semibold text-muted-foreground mb-1">Sin comentarios</h4>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            Agrega observaciones, notas o menciones usando el campo a continuación.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedComments.map((rootComment) => (
            <div key={rootComment.id} className="relative group/thread">
              {/* Línea conectora visual para respuestas */}
              {rootComment.replies.length > 0 && (
                <div className="absolute left-4 top-10 bottom-4 w-px bg-border group-hover/thread:bg-primary/20 transition-colors" />
              )}

              {/* Comentario Raíz */}
              <CommentItem
                comment={rootComment}
                permissions={permissions}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
              />

              {/* Respuestas anidadas */}
              {rootComment.replies.length > 0 && (
                <div className="space-y-4 mt-2">
                  {rootComment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      permissions={permissions}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReact={handleReact}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input de comentario */}
      {permissions.canAdd && (
        <div className={`pt-4 sticky bottom-4 transition-transform ${isInputFocused ? 'scale-[1.02] shadow-2xl bg-background rounded-xl p-2 -mx-2' : ''}`}>
          <CommentInput
            placeholder={
              replyingTo
                ? `Escribe tu respuesta a ${replyingTo.name}...`
                : 'Agregar un nuevo comentario (@nombre para mencionar)'
            }
            replyingTo={replyingTo?.name}
            editingContent={editingComment?.content}
            onSubmit={handleSubmit}
            onCancel={isInputFocused ? handleCancelInput : undefined}
          />
        </div>
      )}
    </div>
  );
}
