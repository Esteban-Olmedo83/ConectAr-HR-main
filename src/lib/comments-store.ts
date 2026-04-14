'use client';

/**
 * @fileOverview STORE DE COMENTARIOS — ConectAr HR
 *
 * Provee operaciones CRUD para hilos de comentarios con:
 *  - Backend primario: Supabase (tabla `comment_threads` + `comments`)
 *  - Fallback: localStorage cuando Supabase no está configurado
 *  - Supabase Realtime: suscripción al canal `comments` para actualizaciones en tiempo real
 *  - Control de permisos: solo el autor puede editar/borrar; admin puede borrar cualquiera
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { getSession } from './session';
import { logEvent } from './audit-log';
import type {
  Comment,
  CommentThread,
  CommentContext,
  CommentPermissions,
} from './types/comments';

// --------------------------------------------------------------------------
// Clave de localStorage para fallback
// --------------------------------------------------------------------------
const LOCAL_KEY = 'conectar_comment_threads';

// --------------------------------------------------------------------------
// PERMISOS
// --------------------------------------------------------------------------

/**
 * Retorna el objeto de permisos de comentarios para el usuario actual.
 * Admin puede eliminar cualquier comentario; el autor puede editar/eliminar el propio.
 */
export function getCommentPermissions(): CommentPermissions {
  const session = getSession();
  const isAdmin = session.role === 'admin' || session.role === 'owner';

  return {
    canAdd: session.role !== 'guest',
    canEdit: (authorId: string) => session.userId === authorId,
    canDelete: (authorId: string) => isAdmin || session.userId === authorId,
  };
}

// --------------------------------------------------------------------------
// GET THREAD
// --------------------------------------------------------------------------

/**
 * Obtiene el hilo de comentarios para una entidad específica.
 * Si no existe, retorna un hilo vacío (sin persistirlo aún).
 *
 * @param context  Módulo donde se usa el hilo (ej: 'employee')
 * @param entityId ID de la entidad (ej: ID del empleado)
 */
export async function getThread(
  context: CommentContext,
  entityId: string
): Promise<CommentThread> {
  const emptyThread: CommentThread = {
    id: `${context}__${entityId}`,
    context,
    entityId,
    comments: [],
  };

  if (isSupabaseConfigured) {
    const client = getSupabaseClient();
    if (client) {
      const { data: comments, error } = await client
        .from('comments')
        .select('*')
        .eq('context', context)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[ConectAr][Comments] Supabase error, usando fallback:', error.message);
      } else {
        return {
          ...emptyThread,
          comments: (comments ?? []).map(_mapRowToComment),
        };
      }
    }
  }

  // Fallback: localStorage
  return _getThreadLocal(context, entityId) ?? emptyThread;
}

// --------------------------------------------------------------------------
// ADD COMMENT
// --------------------------------------------------------------------------

/**
 * Agrega un nuevo comentario al hilo de la entidad dada.
 *
 * @param context   Módulo del hilo
 * @param entityId  ID de la entidad
 * @param content   Texto del comentario (puede contener @{userId:nombre})
 * @param parentId  ID del comentario padre (para respuestas anidadas)
 * @param mentions  IDs de usuarios mencionados
 */
export async function addComment(
  context: CommentContext,
  entityId: string,
  content: string,
  parentId?: string,
  mentions: string[] = []
): Promise<Comment | null> {
  const session = getSession();
  if (session.role === 'guest') return null;

  const now = new Date().toISOString();
  const comment: Comment = {
    id: crypto.randomUUID(),
    threadId: `${context}__${entityId}`,
    authorId: session.userId ?? 'unknown',
    authorName: session.userName ?? 'Desconocido',
    authorAvatar: '',
    content: content.trim(),
    createdAt: now,
    parentId,
    reactions: [],
    mentions,
  };

  if (isSupabaseConfigured) {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.from('comments').insert([
        {
          id: comment.id,
          thread_id: comment.threadId,
          context,
          entity_id: entityId,
          author_id: comment.authorId,
          author_name: comment.authorName,
          author_avatar: comment.authorAvatar,
          content: comment.content,
          created_at: comment.createdAt,
          parent_id: comment.parentId ?? null,
          reactions: JSON.stringify(comment.reactions),
          mentions: JSON.stringify(comment.mentions),
        },
      ]);

      if (!error) {
        await logEvent('COMMENT_ADDED', `Comentario en ${context}/${entityId}`, session.userId, session.userName);
        return comment;
      }
      console.warn('[ConectAr][Comments] Supabase insert error, usando fallback:', error.message);
    }
  }

  // Fallback: localStorage
  _addCommentLocal(context, entityId, comment);
  await logEvent('COMMENT_ADDED', `Comentario en ${context}/${entityId}`, session.userId, session.userName);
  return comment;
}

// --------------------------------------------------------------------------
// EDIT COMMENT
// --------------------------------------------------------------------------

/**
 * Edita el contenido de un comentario existente.
 * Solo el autor puede editar su propio comentario.
 *
 * @returns true si se editó correctamente, false si no tiene permiso
 */
export async function editComment(
  commentId: string,
  newContent: string
): Promise<boolean> {
  const session = getSession();
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    const client = getSupabaseClient();
    if (client) {
      // RLS en Supabase asegura que solo el autor puede actualizar
      const { error } = await client
        .from('comments')
        .update({ content: newContent, edited_at: now })
        .eq('id', commentId)
        .eq('author_id', session.userId ?? '');

      if (!error) {
        await logEvent('COMMENT_EDITED', `Comentario ${commentId} editado`, session.userId, session.userName);
        return true;
      }
      console.warn('[ConectAr][Comments] Supabase update error:', error.message);
    }
  }

  // Fallback: localStorage
  const updated = _editCommentLocal(commentId, newContent, session.userId ?? '');
  if (updated) await logEvent('COMMENT_EDITED', `Comentario ${commentId} editado`, session.userId, session.userName);
  return updated;
}

// --------------------------------------------------------------------------
// DELETE COMMENT (soft delete)
// --------------------------------------------------------------------------

/**
 * Elimina un comentario (soft delete: marca como deleted=true).
 * Admin puede borrar cualquier comentario; usuario solo el propio.
 *
 * @returns true si se eliminó correctamente
 */
export async function deleteComment(
  commentId: string
): Promise<boolean> {
  const session = getSession();
  const isAdmin = session.role === 'admin' || session.role === 'owner';

  if (isSupabaseConfigured) {
    const client = getSupabaseClient();
    if (client) {
      // RLS + lógica de negocio: admin borra cualquiera, usuario solo el suyo
      const filter = isAdmin
        ? client.from('comments').update({ deleted: true }).eq('id', commentId)
        : client.from('comments').update({ deleted: true }).eq('id', commentId).eq('author_id', session.userId ?? '');

      const { error } = await filter;
      if (!error) {
        await logEvent('COMMENT_DELETED', `Comentario ${commentId} eliminado`, session.userId, session.userName);
        return true;
      }
      console.warn('[ConectAr][Comments] Supabase delete error:', error.message);
    }
  }

  // Fallback: localStorage
  const deleted = _deleteCommentLocal(commentId, session.userId ?? '', isAdmin);
  if (deleted) await logEvent('COMMENT_DELETED', `Comentario ${commentId} eliminado`, session.userId, session.userName);
  return deleted;
}

// --------------------------------------------------------------------------
// REACT TO COMMENT
// --------------------------------------------------------------------------

/**
 * Agrega o quita una reacción emoji a un comentario.
 * Si el usuario ya reaccionó con ese emoji, la elimina (toggle).
 */
export async function toggleReaction(
  context: CommentContext,
  entityId: string,
  commentId: string,
  emoji: string
): Promise<CommentThread | null> {
  const session = getSession();
  if (session.role === 'guest') return null;

  // Para simplificar, las reacciones siempre se maneja en localStorage
  // (Supabase requeriría una función RPC para el toggle atómico)
  const thread = _getThreadLocal(context, entityId);
  if (!thread) return null;

  const comment = thread.comments.find((c) => c.id === commentId);
  if (!comment) return null;

  const userId = session.userId ?? 'unknown';
  const existing = comment.reactions.find((r) => r.emoji === emoji);

  if (existing) {
    if (existing.userIds.includes(userId)) {
      // Quitar reacción
      existing.userIds = existing.userIds.filter((id) => id !== userId);
      if (existing.userIds.length === 0) {
        comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
      }
    } else {
      existing.userIds.push(userId);
    }
  } else {
    comment.reactions.push({ emoji, userIds: [userId] });
  }

  _saveThreadLocal(thread);
  return thread;
}

// --------------------------------------------------------------------------
// SUPABASE REALTIME SUBSCRIPTION
// --------------------------------------------------------------------------

/**
 * Suscribe a actualizaciones en tiempo real del hilo de comentarios.
 * Solo activo si Supabase está configurado.
 *
 * @param context   Contexto del hilo
 * @param entityId  ID de la entidad
 * @param onUpdate  Callback llamado cuando llegan nuevos datos
 * @returns Función para cancelar la suscripción
 */
export function subscribeToThread(
  context: CommentContext,
  entityId: string,
  onUpdate: (comments: Comment[]) => void
): () => void {
  if (!isSupabaseConfigured) {
    // Sin Supabase: retornar noop
    return () => {};
  }

  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel(`comments:${context}:${entityId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `entity_id=eq.${entityId}`,
      },
      async () => {
        // Re-fetch completo al recibir cambio
        const thread = await getThread(context, entityId);
        onUpdate(thread.comments);
      }
    )
    .subscribe();

  // Retornar función de limpieza
  return () => {
    client.removeChannel(channel);
  };
}

// --------------------------------------------------------------------------
// Helpers de localStorage
// --------------------------------------------------------------------------

function _getAllThreadsLocal(): Record<string, CommentThread> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function _getThreadLocal(context: CommentContext, entityId: string): CommentThread | null {
  const key = `${context}__${entityId}`;
  return _getAllThreadsLocal()[key] ?? null;
}

function _saveThreadLocal(thread: CommentThread): void {
  if (typeof window === 'undefined') return;
  const all = _getAllThreadsLocal();
  all[thread.id] = thread;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

function _addCommentLocal(context: CommentContext, entityId: string, comment: Comment): void {
  const key = `${context}__${entityId}`;
  const all = _getAllThreadsLocal();
  if (!all[key]) {
    all[key] = { id: key, context, entityId, comments: [] };
  }
  all[key].comments.push(comment);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
}

function _editCommentLocal(commentId: string, newContent: string, userId: string): boolean {
  const all = _getAllThreadsLocal();
  for (const thread of Object.values(all)) {
    const comment = thread.comments.find((c) => c.id === commentId && c.authorId === userId);
    if (comment) {
      comment.content = newContent;
      comment.editedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
      return true;
    }
  }
  return false;
}

function _deleteCommentLocal(commentId: string, userId: string, isAdmin: boolean): boolean {
  const all = _getAllThreadsLocal();
  for (const thread of Object.values(all)) {
    const comment = thread.comments.find(
      (c) => c.id === commentId && (isAdmin || c.authorId === userId)
    );
    if (comment) {
      comment.deleted = true;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
      return true;
    }
  }
  return false;
}

// --------------------------------------------------------------------------
// Helper: mapeo de fila Supabase → Comment
// --------------------------------------------------------------------------
function _mapRowToComment(row: any): Comment {
  return {
    id: row.id,
    threadId: row.thread_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar ?? '',
    content: row.content,
    createdAt: row.created_at,
    editedAt: row.edited_at ?? undefined,
    parentId: row.parent_id ?? undefined,
    reactions: row.reactions ? JSON.parse(row.reactions) : [],
    mentions: row.mentions ? JSON.parse(row.mentions) : [],
    deleted: row.deleted ?? false,
  };
}
