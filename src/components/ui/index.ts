/**
 * UI Component Library — ConectAr HR
 *
 * Central barrel export for all UI components.
 * Import from here in your features:
 *
 * import { DataTable, StatCard, StatusBadge, ConfirmDialog } from '@/components/ui';
 */

// ── Base Radix / shadcn components ────────────────────────────────────────────
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog';
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Badge, badgeVariants } from './badge';
export { Button, buttonVariants } from './button';
export { Calendar } from './calendar';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
export { Checkbox } from './checkbox';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './dropdown-menu';
export { Form, FormControl, FormDescription, FormField as RHFFormField, FormItem, FormLabel, FormMessage, useFormField } from './form';
export { Input } from './input';
export { Label } from './label';
export { Popover, PopoverContent, PopoverTrigger } from './popover';
export { Progress } from './progress';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from './select';
export { Separator } from './separator';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { Skeleton } from './skeleton';
export { Slider } from './slider';
export { Switch } from './switch';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Textarea } from './textarea';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
export { Toaster } from './toaster';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

// ── Custom ConectAr components ────────────────────────────────────────────────
export { DataTable } from './data-table';
export type { ColumnDef, DataTableProps, SortDirection } from './data-table';

export { StatCard } from './stat-card';
export type { StatCardProps } from './stat-card';

export { ConfirmDialog } from './confirm-dialog';
export type { ConfirmDialogProps } from './confirm-dialog';

export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

export { PageHeader } from './page-header';
export type { PageHeaderProps, BreadcrumbItem } from './page-header';

export { StatusBadge } from './status-badge';
export type { StatusBadgeProps } from './status-badge';

export { FormField } from './form-field';
export type { FormFieldProps } from './form-field';

export { FormSection } from './form-section';
export type { FormSectionProps } from './form-section';

export { LoadingOverlay } from './loading-overlay';
export type { LoadingOverlayProps } from './loading-overlay';

export { AvatarGroup } from './avatar-group';
export type { AvatarGroupProps, AvatarUser } from './avatar-group';

export { SearchInput } from './search-input';
export type { SearchInputProps } from './search-input';

export { InfoRow, InfoCard } from './info-row';
export type { InfoRowProps, InfoCardProps } from './info-row';

export {
  TableSkeleton,
  ProfileSkeleton,
  StatCardsSkeleton,
  ListSkeleton,
  FormSkeleton,
} from './section-skeleton';
export type {
  TableSkeletonProps,
  StatCardsSkeletonProps,
  ListSkeletonProps,
  FormSkeletonProps,
} from './section-skeleton';

export { FileUpload } from './file-upload';
export type { FileUploadProps } from './file-upload';

export { ErrorBoundary, ErrorFallback } from './error-boundary';
export type { ErrorFallbackProps } from './error-boundary';

export { FilterBar } from './filter-bar';
export type { FilterBarProps, FilterConfig, FilterOption } from './filter-bar';

export { StepWizard } from './step-wizard';
export type { StepWizardProps, WizardStep } from './step-wizard';

export { ActionMenu } from './action-menu';
export type { ActionMenuProps, ActionMenuItem } from './action-menu';
