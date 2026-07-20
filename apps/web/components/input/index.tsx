import {
  ChangeEvent,
  InputHTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref,
  useId,
} from 'react';

import CloseCircleIcon from '@/assets/icons/colse-circle.svg';
import ErrorIcon from '@/assets/icons/error.svg';
import { cn } from '@/utils/cn';

import { inputContainerStyle } from './input.style';

type InputProps = {
  label?: string;
  prefixSlot?: ReactNode;
  suffixSlot?: ReactNode;
  message?: ReactNode;
  error?: boolean;
  ref?: Ref<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onClick'> & {
    onClick?: MouseEventHandler<HTMLDivElement>;
  };

function Input({
  label,
  prefixSlot,
  suffixSlot,
  message,
  error = false,
  id,
  className,
  ref,
  value,
  onChange,
  disabled,
  readOnly,
  onClick,
  maxLength,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const currentLength = typeof value === 'string' ? value.length : 0;

  const handleClear = () => {
    onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
  };

  const resolvedSuffixSlot =
    suffixSlot ??
    (value && !disabled && !readOnly ? (
      <button
        type="button"
        aria-label="지우기"
        className="cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          handleClear();
        }}
      >
        <CloseCircleIcon className="h-4 w-4" />
      </button>
    ) : null);

  return (
    <div className="flex w-full flex-col">
      {(label || maxLength !== undefined) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="text-body-05 text-grey-800">
              {label}
            </label>
          )}
          {maxLength !== undefined && (
            <span
              className={cn(
                'text-caption-02',
                error ? 'text-red-300' : 'text-grey-400',
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      <div
        className={inputContainerStyle({
          error,
          hasPrefix: Boolean(prefixSlot),
        })}
        onClick={onClick}
      >
        {prefixSlot && (
          <span className="flex items-center w-6 h-6 [&>svg]:size-full">
            {prefixSlot}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          className={cn(
            'text-body-04 text-grey-800 min-w-0 flex-1 outline-none placeholder:text-body-04 placeholder:text-grey-300 disabled:text-grey-300 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none',
            className,
          )}
          {...rest}
        />
        {resolvedSuffixSlot && (
          <span className="flex items-center">{resolvedSuffixSlot}</span>
        )}
      </div>
      {message && (
        <span
          className={cn(
            'text-caption-02 mt-1 flex items-center gap-1',
            error ? 'text-red-300' : 'text-grey-500',
          )}
        >
          {error && <ErrorIcon className="h-4 w-4" />}
          {message}
        </span>
      )}
    </div>
  );
}

export default Input;
