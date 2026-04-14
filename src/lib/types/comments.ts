/**
 * @fileOverview TIPOS DEL SISTEMA DE COMENTARIOS — ConectAr HR
 *
 * Define las estructuras de datos para hilos de comentarios, comentarios
 * individuales y contextos de uso (legajos, ausencias, reclutamiento, comunidad).
 */

// --------------------------------------------------------------------------
// Contextos de comentarios
// --------------------------------------------------------------------------

/**
 * Identifica en qué módulo se usa el sistema de comentarios.
 * Cada contexto mapea a una tabla o entidad distinta en el sistema.
 */
export type CommentContext =
  | 'employee'       // Legajo de empleado
  | 'leave-request'  // Solicitud de ausencia/licencia
  | 'vacancy'        // Vacante o candidato en reclutamiento
  | 'community';     // Publicación en el módulo comunidad

// --------------------------------------------------------------------------
// Reacción de emoji
// --------------------------------------------------------------------------

export interface CommentReaction {
  /** Emoji de la reacción (ej: '👍', '❤️', '🎉') */
  emoji: string;
  /** IDs de usuarios que reaccionaron con este emoji */
  userIds: string[];
}

// --------------------------------------------------------------------------
// Comentario individual
// --------------------------------------------------------------------------

export interface Comment {
  /** UUID único del comentario */
  id: string;
  /** ID del hilo al que pertenece */
  threadId: string;
  /** ID del autor (userId de la sesión) */
  authorId: string;
  /** Nombre del autor (para mostrar sin lookups) */
  authorName: string;
  /** URL del avatar del autor */
  authorAvatar: string;
  /** Contenido del comentario. Soporta @menciones en formato @{userId:Nombre} */
  content: string;
  /** Timestamp ISO 8601 de creación */
  createdAt: string;
  /** Timestamp ISO 8601 de la última edición (undefined si no fue editado) */
  editedAt?: string;
  /**
   * ID del comentario padre para respuestas anidadas.
   * undefined → comentario raíz; definido → respuesta al comentario con ese ID.
   * Se admite máximo 1 nivel de anidamiento.
   */
  parentId?: string;
  /** Lista de reacciones con sus usuarios */
  reactions: CommentReaction[];
  /** IDs de usuarios mencionados con @mención */
  mentions: string[];
  /** Si es true, el comentario fue marcado como eliminado (soft delete) */
  deleted?: boolean;
}

// --------------------------------------------------------------------------
// Hilo de comentarios
// --------------------------------------------------------------------------

export interface CommentThread {
  /** UUID único del hilo */
  id: string;
  /** Contexto o módulo donde se usa este hilo */
  context: CommentContext;
  /** ID de la entidad asociada (ID del empleado, solicitud, vacante, etc.) */
  entityId: string;
  /** Lista de comentarios del hilo, ordenados por createdAt ASC */
  comments: Comment[];
}

// --------------------------------------------------------------------------
// Helper: discriminador de permisos
// --------------------------------------------------------------------------

export interface CommentPermissions {
  /** El usuario puede agregar nuevos comentarios */
  canAdd: boolean;
  /** El usuario puede editar el comentario dado su authorId */
  canEdit: (authorId: string) => boolean;
  /** El usuario puede eliminar el comentario (autor o admin) */
  canDelete: (authorId: string) => boolean;
}
