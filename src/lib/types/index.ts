/**
 * @fileOverview Barrel de exportaciones de tipos — ConectAr HR
 * @description Punto de entrada único para todos los tipos del dominio.
 */

export * from './common';
export * from './api';
export * from './user';
export * from './employee';
export * from './attendance';
export * from './leave';
export * from './payroll';
export * from './document';

// Re-exportar tipos del esquema de BD cuando se necesiten directamente
export type { Database } from '../../types/database.types';
