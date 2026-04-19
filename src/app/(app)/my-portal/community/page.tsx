'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getSession } from '@/lib/session';
import { Heart, ThumbsUp, Smile, Send, MessageCircle, Plus, Trash2, ToggleLeft, ToggleRight, Pin, Edit2, X, Check } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Reaction {
  emoji: string;
  label: string;
  count: number;
  reacted: boolean;
}

interface Comment {
  id: string;
  authorName: string;
  authorInitials: string;
  text: string;
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  authorName: string;
  pinned: boolean;
  reactionsEnabled: boolean;
  commentsEnabled: boolean;
  reactions: Reaction[];
  comments: Comment[];
}

// ─── Datos Mock ───────────────────────────────────────────────────────────────

const REACTION_TEMPLATES: Omit<Reaction, 'count' | 'reacted'>[] = [
  { emoji: '👍', label: 'Me gusta' },
  { emoji: '❤️', label: 'Me encanta' },
  { emoji: '😊', label: 'Me alegra' },
  { emoji: '👏', label: 'Aplaudo' },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    title: '¡Feliz Aniversario ConectAr!',
    body: 'Este mes cumplimos 5 años. Queremos agradecer a cada integrante del equipo por su compromiso y dedicación. ¡Juntos seguimos creciendo! El viernes tenemos un after-office especial en la terraza a las 18hs. ¡Los esperamos!',
    createdAt: new Date('2026-04-15T10:00:00'),
    authorName: 'Administración',
    pinned: true,
    reactionsEnabled: true,
    commentsEnabled: true,
    reactions: [
      { emoji: '👍', label: 'Me gusta', count: 12, reacted: false },
      { emoji: '❤️', label: 'Me encanta', count: 8, reacted: false },
      { emoji: '😊', label: 'Me alegra', count: 5, reacted: false },
      { emoji: '👏', label: 'Aplaudo', count: 3, reacted: false },
    ],
    comments: [
      { id: 'c1', authorName: 'María González', authorInitials: 'MG', text: '¡Felicidades a todos! Muy orgullosa de ser parte de este equipo.', createdAt: new Date('2026-04-15T10:30:00') },
      { id: 'c2', authorName: 'Juan Fernández', authorInitials: 'JF', text: 'El viernes ahí voy! 🎉', createdAt: new Date('2026-04-15T11:00:00') },
    ],
  },
  {
    id: 'p2',
    title: 'Actualización de Políticas de Home Office',
    body: 'A partir del próximo mes, los empleados que trabajen en modalidad híbrida podrán fichar su jornada desde el nuevo módulo de asistencia virtual. Por favor revisen el manual de uso disponible en Mi Portal.',
    createdAt: new Date('2026-04-12T09:00:00'),
    authorName: 'RRHH',
    pinned: false,
    reactionsEnabled: true,
    commentsEnabled: false,
    reactions: [
      { emoji: '👍', label: 'Me gusta', count: 7, reacted: false },
      { emoji: '❤️', label: 'Me encanta', count: 1, reacted: false },
      { emoji: '😊', label: 'Me alegra', count: 2, reacted: false },
      { emoji: '👏', label: 'Aplaudo', count: 0, reacted: false },
    ],
    comments: [],
  },
  {
    id: 'p3',
    title: 'Nuevos Beneficios de Salud',
    body: 'Nos complace anunciar la incorporación de nuevos beneficios: clases de yoga online los martes y jueves, y sesiones de mindfulness disponibles en la plataforma de bienestar. Accedé con tu usuario institucional.',
    createdAt: new Date('2026-04-08T14:00:00'),
    authorName: 'RRHH',
    pinned: false,
    reactionsEnabled: false,
    commentsEnabled: false,
    reactions: REACTION_TEMPLATES.map(r => ({ ...r, count: 0, reacted: false })),
    comments: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PostCard({
  post,
  isAdmin,
  onReact,
  onComment,
  onToggleReactions,
  onToggleComments,
  onDelete,
  onTogglePin,
  onEditPost,
}: {
  post: Post;
  isAdmin: boolean;
  onReact: (postId: string, emoji: string) => void;
  onComment: (postId: string, text: string) => void;
  onToggleReactions: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onDelete: (postId: string) => void;
  onTogglePin: (postId: string) => void;
  onEditPost: (postId: string, title: string, body: string) => void;
}) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const session = getSession();

  const handleSaveEdit = () => {
    onEditPost(post.id, editTitle, editBody);
    setIsEditing(false);
  };

  const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <Card className={`${post.pinned ? 'border-primary/40 bg-primary/5' : ''}`}>
      <CardContent className="pt-5 pb-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{getInitials(post.authorName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{post.authorName}</span>
                {post.pinned && <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary/40 text-primary"><Pin className="h-2.5 w-2.5 mr-0.5" />Fijado</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onTogglePin(post.id)} title={post.pinned ? 'Desfijar' : 'Fijar'}>
                <Pin className={`h-3.5 w-3.5 ${post.pinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsEditing(true); setEditTitle(post.title); setEditBody(post.body); }} title="Editar">
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(post.id)} title="Eliminar">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Body */}
        {isEditing ? (
          <div className="space-y-2">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" className="font-semibold" />
            <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={4} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={!editTitle.trim()}><Check className="h-3.5 w-3.5 mr-1" />Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}><X className="h-3.5 w-3.5 mr-1" />Cancelar</Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-base leading-snug">{post.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{post.body}</p>
          </>
        )}

        {/* Conteo de reacciones */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <span className="flex gap-0.5">
              {post.reactions.filter(r => r.count > 0).map(r => (
                <span key={r.emoji}>{r.emoji}</span>
              ))}
            </span>
            <span>{totalReactions} reacciones</span>
          </div>
        )}

        {/* Admin toggles */}
        {isAdmin && (
          <div className="flex items-center gap-3 pt-1 border-t flex-wrap">
            <button
              className={`flex items-center gap-1.5 text-xs transition-colors ${post.reactionsEnabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
              onClick={() => onToggleReactions(post.id)}
            >
              {post.reactionsEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              Reacciones {post.reactionsEnabled ? 'activadas' : 'desactivadas'}
            </button>
            <button
              className={`flex items-center gap-1.5 text-xs transition-colors ${post.commentsEnabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
              onClick={() => onToggleComments(post.id)}
            >
              {post.commentsEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              Comentarios {post.commentsEnabled ? 'activados' : 'desactivados'}
            </button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 pb-4 px-5">
        {/* Reacciones */}
        {post.reactionsEnabled && (
          <div className="flex items-center gap-1 w-full flex-wrap">
            {post.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => onReact(post.id, r.emoji)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all ${r.reacted ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/50'}`}
                title={r.label}
              >
                <span>{r.emoji}</span>
                {r.count > 0 && <span>{r.count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Comentarios */}
        {(post.commentsEnabled || post.comments.length > 0) && (
          <div className="w-full space-y-2">
            {post.comments.length > 0 && (
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5" onClick={() => setShowComments(v => !v)}>
                <MessageCircle className="h-3.5 w-3.5" />
                {showComments ? 'Ocultar' : `Ver ${post.comments.length} comentario${post.comments.length > 1 ? 's' : ''}`}
              </button>
            )}

            {showComments && (
              <div className="space-y-2">
                {post.comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-muted">{c.authorInitials}</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 rounded-lg px-3 py-2 flex-1 min-w-0">
                      <p className="text-xs font-semibold">{c.authorName}</p>
                      <p className="text-sm mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {post.commentsEnabled && (
              <div className="flex items-end gap-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/15 text-primary">{getInitials(session?.userName ?? 'U')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Escribí un comentario..."
                    className="min-h-[40px] max-h-24 text-sm resize-none"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={1}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) { e.preventDefault(); onComment(post.id, commentText); setCommentText(''); } }}
                  />
                  <Button size="icon" variant="ghost" className="h-10 w-10 shrink-0" disabled={!commentText.trim()} onClick={() => { onComment(post.id, commentText); setCommentText(''); }}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CommunityPage() {
  const session = getSession();
  const isAdmin = session?.role === 'admin' || session?.role === 'manager';

  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newReactionsEnabled, setNewReactionsEnabled] = useState(true);
  const [newCommentsEnabled, setNewCommentsEnabled] = useState(true);

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const handleReact = (postId: string, emoji: string) => {
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      reactions: p.reactions.map(r => r.emoji !== emoji ? r : {
        ...r,
        reacted: !r.reacted,
        count: r.reacted ? r.count - 1 : r.count + 1,
      }),
    }));
  };

  const handleComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      authorName: session?.userName ?? 'Usuario',
      authorInitials: getInitials(session?.userName ?? 'U'),
      text: text.trim(),
      createdAt: new Date(),
    };
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, comments: [...p.comments, comment] }));
  };

  const handleToggleReactions = (postId: string) => {
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, reactionsEnabled: !p.reactionsEnabled }));
  };

  const handleToggleComments = (postId: string) => {
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, commentsEnabled: !p.commentsEnabled }));
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleTogglePin = (postId: string) => {
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, pinned: !p.pinned }));
  };

  const handleEditPost = (postId: string, title: string, body: string) => {
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, title, body }));
  };

  const handlePublish = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      body: newBody.trim(),
      createdAt: new Date(),
      authorName: session?.userName ?? 'Administración',
      pinned: false,
      reactionsEnabled: newReactionsEnabled,
      commentsEnabled: newCommentsEnabled,
      reactions: REACTION_TEMPLATES.map(r => ({ ...r, count: 0, reacted: false })),
      comments: [],
    };
    setPosts(prev => [post, ...prev]);
    setNewTitle('');
    setNewBody('');
    setNewReactionsEnabled(true);
    setNewCommentsEnabled(true);
    setShowNewPostForm(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-headline">Comunidad</h1>
          <p className="text-muted-foreground text-sm mt-1">Novedades e interacción del equipo.</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowNewPostForm(v => !v)}>
            <Plus className="h-4 w-4 mr-2" />Nueva publicación
          </Button>
        )}
      </div>

      {/* Formulario nueva publicación (solo admin) */}
      {isAdmin && showNewPostForm && (
        <Card className="border-primary/30">
          <CardContent className="pt-5 space-y-3">
            <h3 className="font-semibold text-sm">Crear publicación</h3>
            <Input placeholder="Título de la publicación" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Textarea placeholder="Escribí el contenido aquí..." rows={4} value={newBody} onChange={e => setNewBody(e.target.value)} />
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <button
                className={`flex items-center gap-1.5 transition-colors ${newReactionsEnabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                onClick={() => setNewReactionsEnabled(v => !v)}
              >
                {newReactionsEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                Reacciones
              </button>
              <button
                className={`flex items-center gap-1.5 transition-colors ${newCommentsEnabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                onClick={() => setNewCommentsEnabled(v => !v)}
              >
                {newCommentsEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                Comentarios
              </button>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handlePublish} disabled={!newTitle.trim() || !newBody.trim()}>
                <Send className="h-4 w-4 mr-2" />Publicar
              </Button>
              <Button variant="outline" onClick={() => setShowNewPostForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {sortedPosts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no hay publicaciones.</p>
          </div>
        )}
        {sortedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            isAdmin={isAdmin}
            onReact={handleReact}
            onComment={handleComment}
            onToggleReactions={handleToggleReactions}
            onToggleComments={handleToggleComments}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
            onEditPost={handleEditPost}
          />
        ))}
      </div>
    </div>
  );
}
