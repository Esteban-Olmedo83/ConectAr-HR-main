'use client';

/**
 * @fileOverview CommentInput — ConectAr HR
 *
 * Input para escribir y enviar comentarios.
 * Soporta:
 *  - Auto-resize del textarea
 *  - Atajo de teclado: Ctrl+Enter para enviar
 *  - Modo respuesta: muestra a quién se está respondiendo
 *  - Estado de carga durante el envío
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, Reply } from 'lucide-react';
import { getSession } from '@/lib/session';

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

interface CommentInputProps {
  /** Texto del placeholder del input */
  placeholder?: string;
  /** Si se está respondiendo, nombre del autor original */
  replyingTo?: string;
  /** Si se está editando, contenido actual del comentario */
  editingContent?: string;
  /** Indica si el formulario está enviando (deshabilita el botón) */
  isLoading?: boolean;
  /** Cancelar respuesta/edición */
  onCancel?: () => void;
  /** Enviar el comentario */
  onSubmit: (content: string) => Promise<void>;
}

// --------------------------------------------------------------------------
// Componente
// --------------------------------------------------------------------------

export function CommentInput({
  placeholder = 'Escribe un comentario...',
  replyingTo,
  editingContent,
  isLoading = false,
  onCancel,
  onSubmit,
}: CommentInputProps) {
  const session = getSession();
  const [content, setContent] = useState(editingContent ?? '');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Foco automático al montar o al entrar en modo respuesta/edición
  useEffect(() => {
    textareaRef.current?.focus();
    if (editingContent) {
      setContent(editingContent);
    }
  }, [replyingTo, editingContent]);

  // Auto-resize del textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [content]);

  const isEmpty = content.trim().length === 0;

  /**
   * Maneja el atajo Ctrl+Enter para enviar sin necesidad del botón.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isEmpty) {
      e.preventDefault();
      handleSubmit();
    }
    // Escape cancela la edición/respuesta
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    if (isEmpty || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || isLoading;

  return (
    <div className="flex gap-3 items-start">
      {/* Avatar del usuario actual */}
      <Avatar className="h-8 w-8 flex-shrink-0 border shadow-sm mt-0.5">
        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
          {session.userName?.charAt(0).toUpperCase() ?? 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Área de input */}
      <div className="flex-1 rounded-xl border bg-muted/30 focus-within:border-primary/50 focus-within:bg-background transition-colors overflow-hidden">
        {/* Banner de respuesta */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3 pt-2 text-xs text-muted-foreground border-b">
            <span className="flex items-center gap-1">
              <Reply className="h-3 w-3" />
              Respondiendo a <strong className="text-foreground ml-1">@{replyingTo}</strong>
            </span>
            {onCancel && (
              <button onClick={onCancel} className="hover:text-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Banner de edición */}
        {editingContent && !replyingTo && (
          <div className="flex items-center justify-between px-3 pt-2 text-xs text-amber-600 dark:text-amber-400 border-b">
            <span>Editando comentario</span>
            {onCancel && (
              <button onClick={onCancel} className="hover:text-foreground transition-colors">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 py-3 text-sm"
        />

        {/* Footer con acciones */}
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[10px] text-muted-foreground select-none">
            Ctrl+Enter para enviar · Esc para cancelar
          </span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onCancel}
                disabled={isDisabled}
              >
                Cancelar
              </Button>
            )}
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleSubmit}
              disabled={isEmpty || isDisabled}
            >
              <Send className="h-3 w-3" />
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
