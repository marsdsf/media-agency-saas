'use client';

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

// ============ BUTTON ============
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-gradient-to-r from-[#1a1a1a] to-[#111] hover:from-[#222] hover:to-[#1a1a1a] text-white border border-[#333] hover:border-white/20 hover:shadow-lg hover:shadow-white/5 hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:-translate-y-0.5 active:translate-y-0',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 active:translate-y-0',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
Button.displayName = 'Button';

// ============ INPUT ============
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-600',
            'focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20',
            'transition-all duration-200',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

// ============ TEXTAREA ============
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  label,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white placeholder:text-gray-600',
          'focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20',
          'transition-all duration-200 resize-none',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

// ============ SELECT ============
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  label,
  error,
  options,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#222] text-white',
          'focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20',
          'transition-all duration-200',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';

// ============ CARD ============
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      className={cn(
        'bg-gradient-to-br from-[#0a0a0a] to-[#080808] border border-[#1a1a1a] rounded-2xl',
        onClick && 'cursor-pointer hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-b border-[#1a1a1a]', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

// ============ BADGE ============
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-[#1a1a1a] to-[#222] text-gray-300 border border-[#333]',
    success: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30',
    info: 'bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/20',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

// ============ AVATAR ============
interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (src) {
    return (
      <div className={cn('rounded-full overflow-hidden', sizes[size])}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name || ''} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-full bg-white flex items-center justify-center font-semibold text-black',
      sizes[size]
    )}>
      {initials || '?'}
    </div>
  );
}

// ============ MODAL ============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative w-full mx-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col',
        sizes[size]
      )}>
        {title && (
          <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============ SWITCH ============
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked = false, onCheckedChange, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black',
        checked ? 'bg-white' : 'bg-[#333]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-gray-400'
        )}
      />
    </button>
  );
}

// ============ TABS ============
interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-[#0a0a0a] rounded-xl', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-white text-black'
              : 'text-gray-400 hover:text-white'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

