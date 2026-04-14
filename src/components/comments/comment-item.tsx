'use client';

/**
 * @fileOverview CommentItem — ConectAr HR
 *
 * Componente que representa un comentario individual dentro de un hilo.
 * Muestra: avatar, autor, tiempo relativo, contenido, reacciones, y acciones (editar/borrar/responder).
 *
 * PERMISOS:
 *  - Solo el autor puede editar su comentario.
 *  - El autor y los administradores (admin/owner) pueden eliminar.
 *  - Cualquier usuario autenticado puede reaccionar.
 */

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Pencil, Trash2, Reply, SmilePlus } from 'lucide-react';
import type { Comment, CommentPermissions } from '@/lib/types/comments';

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

interface CommentItemProps {
  comment: Comment;
  permissions: CommentPermissions;
  onReply?: (commentId: string, authorName: string) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  onReact?: (commentId: string, emoji: string) => void;
  isReply?: boolean;
}

// --------------------------------------------------------------------------
// Emojis disponibles
// --------------------------------------------------------------------------
const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '😮', '😅', '🙌'];

// --------------------------------------------------------------------------
// Helper: tiempo relativo
// --------------------------------------------------------------------------

/**
 * Formatea una fecha ISO en tiempo relativo legible.
 * Ej: "hace 2 horas", "hace 3 días"
 */
function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'ahora mismo';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;

  return new Date(isoString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Resalta @menciones en el contenido del comentario.
 * Formato reconocido: @{userId:NombreCompleto} o simplemente @Nombre
 */
function parseContent(content: string): React.ReactNode[] {
  const parts = content.split(/(@\{[^}]+\}|@\w+)/g);
  return parts.map((part, i) => {
    const mentionMatch = part.match(/^@\{[^:]+:(.+)\}$/) ?? part.match(/^(@\w+)$/);
    if (mentionMatch) {
      return (
        <span key={i} className="text-primary font-semibold">
          @{mentionMatch[1]}
        </span>
      );
    }
    return part;
  });
}

// --------------------------------------------------------------------------
// Componente
// --------------------------------------------------------------------------

export function CommentItem({
  comment,
  permissions,
  onReply,
  onEdit,
  onDelete,
  onReact,
  isReply = false,
}: CommentItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const canEdit = permissions.canEdit(comment.authorId);
  const canDelete = permissions.canDelete(comment.authorId);
  const hasActions = canEdit || canDelete || !!onReply;

  // Comentario eliminado (soft delete)
  if (comment.deleted) {
    return (
      <div className={`flex gap-3 ${isReply ? 'ml-10 mt-2' : ''}`}>
        <div className="w-8 h-8" />
        <p className="text-xs text-muted-foreground italic py-2">
          Este comentario fue eliminado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`group flex gap-3 ${isReply ? 'ml-10 mt-2' : ''}`}>
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0 border shadow-sm">
          <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
            {comment.authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Encabezado */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold">{comment.authorName}</span>
            {isReply && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                respuesta
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.editedAt && (
              <span className="text-[10px] text-muted-foreground italic">(editado)</span>
            )}
          </div>

          {/* Texto del comentario */}
          <p className="text-sm mt-0.5 leading-relaxed break-words">
            {parseContent(comment.content)}
          </p>

          {/* Reacciones */}
          {comment.reactions.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {comment.reactions
                .filter((r) => r.userIds.length > 0)
                .map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => onReact?.(comment.id, reaction.emoji)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-muted/50 hover:bg-primary/10 hover:border-primary/30 text-xs transition-colors"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="font-semibold text-muted-foreground">{reaction.userIds.length}</span>
                  </button>
                ))}
            </div>
          )}

          {/* Acciones rápidas (visibles en hover) */}
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onReply(comment.id, comment.authorName)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Responder
              </Button>
            )}

            {/* Picker de emojis */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowEmojiPicker((v) => !v)}
              >
                <SmilePlus className="h-3 w-3" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-1 flex gap-1 p-1.5 rounded-xl border bg-popover shadow-lg z-10">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact?.(comment.id, emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-base hover:scale-125 transition-transform p-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menú de acciones (editar/borrar) */}
        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                <MoreVertical className="h-3 w-3" />
                <span className="sr-only">Más opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit?.(comment)}>
                  <Pencil className="mr-2 h-3 w-3" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Diálogo de confirmación de borrado */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El comentario será marcado como eliminado y
              no podrá recuperarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.(comment.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
