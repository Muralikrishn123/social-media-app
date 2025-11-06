import { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

const Textarea = forwardRef(
  (
    {
      label,
      name,
      rows = 3,
      error,
      helperText,
      className = '',
      labelClassName = '',
      textareaClassName = '',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const textareaBaseStyles =
      'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6';
    const errorStyles =
      'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 pr-10';

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={name}
            className={`block text-sm font-medium leading-6 text-gray-900 mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}

        <div className="relative rounded-md shadow-sm">
          <textarea
            name={name}
            id={name}
            rows={rows}
            ref={ref}
            className={`
              ${textareaBaseStyles}
              ${error ? errorStyles : ''}
              ${textareaClassName}
              ${fullWidth ? 'w-full' : ''}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            {...props}
          />

          {error && (
            <div className="pointer-events-none absolute top-2 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
            {error}
          </p>
        ) : (
          helperText && (
            <p className="mt-1 text-sm text-gray-500" id={`${name}-description`}>
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;