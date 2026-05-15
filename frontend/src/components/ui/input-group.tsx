import * as React from 'react';
import { cn } from '@/lib/utils';

export function InputGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center rounded-md border border-hairline bg-canvas focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30 transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type InputGroupInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-mute outline-none',
        '[&:has(+_[data-align=inline-start])]:pl-10',
        className,
      )}
      {...props}
    />
  ),
);
InputGroupInput.displayName = 'InputGroupInput';

type Align = 'inline-start' | 'inline-end';

interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: Align;
}

export function InputGroupAddon({
  children,
  align = 'inline-start',
  className,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-align={align}
      className={cn(
        'pointer-events-none absolute top-1/2 -translate-y-1/2 flex items-center text-mute',
        align === 'inline-start' && 'left-3',
        align === 'inline-end' && 'right-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
