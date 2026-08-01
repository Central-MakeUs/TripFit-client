import {
  ChangeEvent,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
  useId,
} from 'react';

import CloseCircleIcon from '@/assets/icons/colse-circle.svg';
import ErrorIcon from '@/assets/icons/error.svg';
import { cn } from '@/utils/cn';

import { textareaContainerStyle } from './textarea.style';

type TextareaProps = {
  label?: string;
  prefixSlot?: ReactNode;
  maxLength?: number;
  message?: ReactNode;
  error?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength'>;

function Textarea({
  label,
  prefixSlot,
  maxLength,
  message,
  error = false,
  id,
  className,
  ref,
  value,
  onChange,
  disabled,
  readOnly,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const currentLength = typeof value === 'string' ? value.length : 0;

  const handleClear = () => {
    onChange?.({ target: { value: '' } } as ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className="flex w-full flex-col">
      {(label || maxLength !== undefined) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label htmlFor={textareaId} className="text-body-05 text-grey-800">
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
        className={textareaContainerStyle({
          error,
          hasPrefix: Boolean(prefixSlot),
        })}
      >
        {prefixSlot && <span className="flex items-center">{prefixSlot}</span>}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          className={cn(
            'text-body-04 text-grey-800 min-w-0 w-full flex-1 resize-none outline-none placeholder:text-body-04 placeholder:text-grey-200',
            className,
          )}
          {...rest}
        />
        {!label && value && !disabled && !readOnly && (
          <span className="flex items-center">
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
          </span>
        )}
      </div>
      {message && (
        <span
          className={cn(
            'text-caption-02 mt-1 flex items-center gap-1',
            error ? 'text-red-300' : 'text-grey-400',
          )}
        >
          {error && <ErrorIcon className="h-4 w-4" />}
          {message}
        </span>
      )}
    </div>
  );
}

export default Textarea;
