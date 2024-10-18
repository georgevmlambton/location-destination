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
import { useContext, useRef, useState, useEffect } from 'react';
import { UserContext } from '../../providers/user-provider';
import { ButtonRadioField } from '../../components/form/ButtonRadioField';
import { useNavigate } from 'react-router-dom';
import { ProfilePatchRequest } from '@location-destination/types/src/requests/profile';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
});

function isRequiredFieldsFilled(values: ProfilePatchRequest) {
  return !!values.name && !!values.type;
}

export function Profile() {
  const navigate = useNavigate();
  const { profile, isProfileSetupDone, updateProfile, signOut, user } =
  useContext(UserContext);
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || '');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.photoUrl) {
      setPhotoUrl(profile.photoUrl);
    }
  }, [profile]);

  async function submit(values: ProfilePatchRequest) {
    let uploadedPhotoUrl = photoUrl;
  
    if (file) {
      const storage = getStorage();
      const storageRef = ref(storage, `/users/avatars/${user?.uid}/avatar.jpg`);
  
      await uploadBytes(storageRef, file);
 
      uploadedPhotoUrl = await getDownloadURL(storageRef);
      values.photoUrl = uploadedPhotoUrl;
    }
    await updateProfile(values);
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile && selectedFile.type === 'image/jpeg' && selectedFile.size < 1048576) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => setPhotoUrl(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      alert('Please select a valid JPG image under 1MB');
    }
  };

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
            src={profile?.photoUrl || personFill}
            alt="Profile Avatar"
            style={{
              width: '100px',
              height: '100px',
              border: '2px solid #CCCCCC',
              background: 'white',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg"
            style={{ display: 'none' }}
            onChange={handleFileChange}
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
          initialValues={{ name: profile.name, type: profile.type, photoUrl: profile.photoUrl }}
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
