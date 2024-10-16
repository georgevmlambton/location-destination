import { FormikErrors, FormikTouched } from 'formik';
import { ReactNode } from 'react';

export function ProfileField<T>({
  name,
  label,
  required = false,
  errors,
  touched,
  children,
}: {
  name: keyof T;
  label: string;
  required?: boolean;
  touched: FormikTouched<T>;
  errors: FormikErrors<T>;
  children?: ReactNode;
}) {
  return (
    <div
      className={`border shadow px-3 py-4 bg-white ${touched[name] && errors[name] ? 'border-danger' : 'border-secondary-subtle'}`}
      style={{
        borderRadius: '25px',
      }}
    >
      <label className="mb-4">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}
