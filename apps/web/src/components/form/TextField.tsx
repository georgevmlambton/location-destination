import { ErrorMessage, Field, FormikErrors, FormikTouched } from 'formik';

export function TextField<T>({
  name,
  touched,
  errors,
}: {
  name: keyof T;
  touched: FormikTouched<T>;
  errors: FormikErrors<T>;
}) {
  return (
    <>
      <Field
        type="text"
        className={`form-control rounded-pill py-2 fs-6 ${touched[name] && errors[name] ? 'border-danger' : 'border-secondary-subtle'}`}
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
