import { Field, useField } from 'formik';
import checkLg from '../../assets/check-lg.svg';

export function ButtonCheckboxField({
  name,
  options,
}: {
  name: string;
  options: string[];
}) {
  const [{ value }] = useField<string>(name);

  return (
    <div
      className="btn-group d-flex flex-wrap justify-content-start"
      role="group"
      aria-label="Basic radio toggle button group"
    >
      {options.map((option) => (
        <label
          key={option}
          className={`btn rounded-pill me-2 ${value?.includes(option) ? 'btn-success' : 'btn-outline-dark'}`}
          {...(value?.includes(option)
            ? { style: { backgroundColor: '#00634B', border: 'none' } }
            : {})}
          htmlFor={name + '-' + option}
        >
          <Field
            type="checkbox"
            name={name}
            value={option}
            className="btn-check"
            id={name + '-' + option}
            autoComplete="off"
          />
          {option + ' '}
          {value?.includes(option) && (
            <img
              src={checkLg}
              style={{ height: '20px', paddingBottom: '3px' }}
              />
          )}
        </label>
      ))}
    </div>
  );
}
