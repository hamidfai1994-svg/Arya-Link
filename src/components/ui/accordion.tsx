'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextType {
  value: string | string[];
  onValueChange: (val: string) => void;
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = 'single',
      collapsible = true,
      value: controlledValue,
      defaultValue,
      onValueChange: controlledOnChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
      defaultValue || (type === 'multiple' ? [] : '')
    );

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (itemValue: string) => {
        if (type === 'single') {
          const currentValue = value as string;
          let nextValue = '';
          if (currentValue === itemValue) {
            nextValue = collapsible ? '' : currentValue;
          } else {
            nextValue = itemValue;
          }

          if (!isControlled) {
            setUncontrolledValue(nextValue);
          }
          controlledOnChange?.(nextValue);
        } else {
          const currentArray = (Array.isArray(value) ? value : []) as string[];
          const nextArray = currentArray.includes(itemValue)
            ? currentArray.filter((v) => v !== itemValue)
            : [...currentArray, itemValue];

          if (!isControlled) {
            setUncontrolledValue(nextArray);
          }
          controlledOnChange?.(nextArray);
        }
      },
      [type, collapsible, value, isControlled, controlledOnChange]
    );

    return (
      <AccordionContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
          type,
          collapsible,
        }}
      >
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = 'Accordion';

const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean }>({
  value: '',
  isOpen: false,
});

export const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const ctx = React.useContext(AccordionContext);
  const isOpen = Array.isArray(ctx?.value)
    ? ctx?.value.includes(value)
    : ctx?.value === value;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        ref={ref}
        className={cn('border rounded-2xl overflow-hidden transition-colors', className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const accCtx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => accCtx?.onValueChange(itemCtx.value)}
      className={cn(
        'flex flex-1 items-center justify-between py-3.5 px-4 font-bold text-xs transition-all w-full text-right cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground',
          itemCtx.isOpen && 'rotate-180 text-foreground'
        )}
      />
    </button>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const itemCtx = React.useContext(AccordionItemContext);

  if (!itemCtx.isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden text-xs transition-all px-4 pb-4 pt-1 border-t border-border/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AccordionContent.displayName = 'AccordionContent';
