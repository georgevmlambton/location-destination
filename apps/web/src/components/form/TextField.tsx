import { ErrorMessage, Field, FormikErrors, FormikTouched } from 'formik';

export function TextField<T>({
  name,
  placeholder,
  className = '',
  touched,
  errors,
}: {
  name: keyof T;
  placeholder?: string;
  className?: string;
  touched: FormikTouched<T>;
  errors: FormikErrors<T>;
}) {
  return (
    <>
      <Field
        placeholder={placeholder}
        type="text"
        className={`form-control rounded-pill py-2 fs-6 ${touched[name] && errors[name] ? 'border-danger' : 'border-secondary-subtle'} ${className}`}
        name={name}
      />
      <ErrorMessage
        name={name.toString()}
        className="text-danger ms-2"
        component="p"
      />
    </>
  );
}
