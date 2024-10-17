import arrowLeft from '../../assets/arrow-left.svg';
import boxArrowRight from '../../assets/box-arrow-right.svg';
import personFill from '../../assets/person-fill.svg';
import check2 from '../../assets/check2.svg';
import x from '../../assets/x.svg';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { Toast, ToastContainer } from 'react-bootstrap';
import { TextField } from '../../components/form/TextField';
import { NavButton } from '../../components/nav/NavButton';
import { ProfileField } from './ProfileField';
import { useContext } from 'react';
import { UserContext } from '../../providers/user-provider';
import { ButtonRadioField } from '../../components/form/ButtonRadioField';
import { useNavigate } from 'react-router-dom';
import { ProfilePatchRequest } from '@location-destination/types/src/requests/profile';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
});

function isRequiredFieldsFilled(values: ProfilePatchRequest) {
  return !!values.name && !!values.type;
}

export function Profile() {
  const navigate = useNavigate();
  const { profile, isProfileSetupDone, updateProfile, signOut } =
    useContext(UserContext);

  async function submit(values: ProfilePatchRequest) {
    await updateProfile(values);
  }

  return (
    <div className="w-100 h-100" style={{ background: '#F8F8F8' }}>
      <div className="p-4 pb-5 position-relative overflow-hidden">
        <div
          className="position-absolute top-0"
          style={{
            backgroundColor: '#00634B',
            height: '100%',
            width: '150%',
            left: '-25%',
            borderRadius: '0 0 50% 50%',
          }}
        />
        <div className="d-flex justify-content-between position-relative">
          <NavButton
            icon={arrowLeft}
            hidden={!isProfileSetupDone}
            onClick={() => navigate('/')}
          />
          <NavButton icon={boxArrowRight} onClick={signOut} />
        </div>

        <div className="d-flex align-items-end mt-5 position-relative">
          <img
            className="rounded-circle"
            src={personFill}
            style={{
              width: '100px',
              height: '100px',
              border: '2px solid #CCCCCC',
              borderRadius: '50%',
              background: 'white',
            }}
          />
          <h2
            className="ms-3 pb-3 placeholder-glow flex-grow-1"
            style={{ color: profile?.name ? 'white' : 'rgb(189, 189, 189)' }}
          >
            {!profile && (
              <span className="placeholder" style={{ width: '100%' }}></span>
            )}
            {profile && (profile.name || '(Your Name)')}
          </h2>
        </div>
      </div>

      {profile && (
        <Formik
          initialValues={{ name: profile.name, type: profile.type }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            await submit(values);
            setSubmitting(false);
            resetForm({ values });
          }}
        >
          {({ isSubmitting, errors, touched, dirty, resetForm, values }) => (
            <Form className="px-4 mt-5">
              <ProfileField
                errors={errors}
                touched={touched}
                name="name"
                label="Name"
                required
              >
                <TextField touched={touched} errors={errors} name="name" />
              </ProfileField>

              <ProfileField
                className="mt-4"
                errors={errors}
                touched={touched}
                name="name"
                label="Name"
                required
              >
                <ButtonRadioField
                  name="type"
                  options={['Rider', 'Driver', 'Both']}
                />
              </ProfileField>

              {dirty && isRequiredFieldsFilled(values) && (
                <div className="d-flex position-absolute bottom-0 end-0 p-4">
                  <button
                    disabled={isSubmitting}
                    onClick={() => resetForm()}
                    className="btn btn-light d-flex justify-content-center align-content-center p-2 me-3"
                    style={{
                      border: '1px solid #CCCCCC',
                      borderRadius: '50%',
                      boxShadow: 'rgba(0, 0, 0, 0.4) 0px 6px 16px',
                      width: '52px',
                      height: '52px',
                    }}
                  >
                    <img src={x} />
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="btn btn-light d-flex justify-content-center align-content-center p-2"
                    style={{
                      border: '1px solid #CCCCCC',
                      borderRadius: '50%',
                      boxShadow: 'rgba(0, 0, 0, 0.4) 0px 6px 16px',
                      width: '52px',
                      height: '52px',
                    }}
                  >
                    <img src={check2} />
                  </button>
                </div>
              )}

              {!isRequiredFieldsFilled(values) && (
                <ToastContainer position="bottom-end" className="p-2">
                  <Toast animation bg="danger">
                    <Toast.Body className="text-white">
                      Please fill all required fields
                    </Toast.Body>
                  </Toast>
                </ToastContainer>
              )}
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
}
