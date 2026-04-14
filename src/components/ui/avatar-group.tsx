'use client';

/**
 * AvatarGroup — Grupo de avatares apilados con contador de excedente.
 *
 * @example
 * <AvatarGroup
 *   users={[
 *     { name: 'Ana García', src: '/avatars/ana.jpg' },
 *     { name: 'Luis Pérez' },
 *   ]}
 *   max={4}
 *   size="sm"
 * />
 */

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface AvatarUser {
  name: string;
  src?: string;
}

export interface AvatarGroupProps {
  users: AvatarUser[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px] -ml-1.5',
  sm: 'h-8 w-8 text-xs -ml-2',
  md: 'h-10 w-10 text-sm -ml-2.5',
  lg: 'h-12 w-12 text-base -ml-3',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function AvatarGroup({
  users,
  max = 5,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  const avatarClass = cn(
    'ring-2 ring-background rounded-full first:ml-0',
    sizeClasses[size],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn('flex items-center', className)}
        role="group"
        aria-label={`${users.length} participantes`}
      >
        {visible.map((user, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Avatar className={avatarClass}>
                {user.src && (
                  <AvatarImage src={user.src} alt={user.name} />
                )}
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  avatarClass,
                  'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background',
                )}
              >
                +{overflow}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{overflow} más</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
