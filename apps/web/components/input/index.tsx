import { ChangeEvent, InputHTMLAttributes, ReactNode, Ref, useId } from 'react';

import CloseCircleIcon from '@/assets/icons/colse-circle.svg';
import ErrorIcon from '@/assets/icons/error.svg';

import { inputContainerStyle } from './input.style';

type InputProps = {
  label?: string;
  prefixSlot?: ReactNode;
  suffixSlot?: ReactNode;
  message?: ReactNode;
  error?: boolean;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

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
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

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
        onClick={handleClear}
      >
        <CloseCircleIcon className="h-3 w-3" />
      </button>
    ) : null);

  return (
    <div className="flex w-full flex-col">
      {label && (
        <label htmlFor={inputId} className="text-body-05 text-black mb-2">
          {label}
        </label>
      )}
      <div className={inputContainerStyle({ error })}>
        {prefixSlot && <span className="flex items-center">{prefixSlot}</span>}
        <input
          ref={ref}
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          className={`text-body-04 text-grey-800 flex-1 outline-none placeholder:text-body-04 placeholder:text-grey-200 ${className ?? ''}`}
          {...rest}
        />
        {resolvedSuffixSlot && (
          <span className="flex items-center">{resolvedSuffixSlot}</span>
        )}
      </div>
      {message && (
        <span
          className={`text-caption-02 mt-1 flex items-center gap-1 ${error ? 'text-red-300' : 'text-grey-500'}`}
        >
          {error && <ErrorIcon className="h-4 w-4" />}
          {message}
        </span>
      )}
    </div>
  );
}

export default Input;
