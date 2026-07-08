import { InputHTMLAttributes, ReactNode, Ref, useId } from 'react';

import { inputContainerStyle } from './input.style';

type InputProps = {
  label?: string;
  prefixSlot?: ReactNode;
  suffixSlot?: ReactNode;
  errorMessage?: string;
  ref?: Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

function Input({
  label,
  prefixSlot,
  suffixSlot,
  errorMessage,
  id,
  className,
  ref,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasError = Boolean(errorMessage);

  return (
    <div className="flex w-full flex-col">
      {label && (
        <label htmlFor={inputId} className="text-body-05 text-black mb-2">
          {label}
        </label>
      )}
      <div className={inputContainerStyle({ error: hasError })}>
        {prefixSlot && <span className="flex items-center">{prefixSlot}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`text-body-06 flex-1 outline-none placeholder:text-grey-300 ${className ?? ''}`}
          {...rest}
        />
        {suffixSlot && <span className="flex items-center">{suffixSlot}</span>}
      </div>
      {errorMessage && (
        <span className="text-caption-02 text-red-500 mt-[5.5px] flex items-center gap-[3.13px]">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export default Input;
