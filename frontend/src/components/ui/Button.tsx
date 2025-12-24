import { ComponentPropsWithoutRef, ElementType } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps<T extends ElementType = 'button'> = {
  variant?: ButtonVariant;
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

const baseStyles = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-charcoal text-ivory hover:bg-gold hover:text-charcoal shadow-card',
  secondary: 'bg-platinum text-charcoal hover:bg-gold/30',
  ghost: 'text-charcoal hover:text-gold',
};

export function Button<T extends ElementType = 'button'>({
  variant = 'primary',
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';
  return <Component className={clsx(baseStyles, variants[variant], className)} {...props} />;
}
