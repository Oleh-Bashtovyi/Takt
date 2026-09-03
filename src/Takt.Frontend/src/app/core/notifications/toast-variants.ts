export type ToastKind = 'success' | 'error' | 'warning' | 'info';

interface ToastVariant {
  icon: string;
  container: string;
  iconColor: string;
}

export const TOAST_VARIANTS: Record<ToastKind, ToastVariant> = {
  success: {
    icon: 'check',
    container: 'border-green-200 bg-green-50 text-green-900',
    iconColor: 'text-green-600',
  },
  error: {
    icon: 'x',
    container: 'border-red-200 bg-red-50 text-red-900',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: 'warning',
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    iconColor: 'text-amber-600',
  },
  info: {
    icon: 'info',
    container: 'border-blue-200 bg-blue-50 text-blue-900',
    iconColor: 'text-blue-600',
  },
};
