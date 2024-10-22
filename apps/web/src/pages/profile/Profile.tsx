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
import {
  ProfilePatchRequest,
  VehicleType,
} from '@location-destination/types/src/requests/profile';
import { ButtonCheckboxField } from '../../components/form/ButtonCheckboxField';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup
    .mixed<'Rider' | 'Driver' | 'Both'>()
    .oneOf(['Rider', 'Driver', 'Both']),
  vehicleMake: yup.string().when('type', {
    is: (type: string) => type === 'Driver' || type === 'Both',
    then: (schmea) => schmea.required('Required field'),
  }),
  vehicleModel: yup.string().when('type', {
    is: (type: string) => type === 'Driver' || type === 'Both',
    then: (schmea) => schmea.required('Required field'),
  }),
  vehicleYear: yup
    .number()
    .typeError('Must be a valid year')
    .min(1900, 'Must be greater than 1900')
    .when('type', {
      is: (type: string) => type === 'Driver' || type === 'Both',
      then: (schmea) => schmea.required('Required field'),
    }),
  vehicleColor: yup.string().when('type', {
    is: (type: string) => type === 'Driver' || type === 'Both',
    then: (schmea) => schmea.required('Required field'),
  }),
  vehicleLicensePlate: yup.string().when('type', {
    is: (type: string) => type === 'Driver' || type === 'Both',
    then: (schmea) => schmea.required('Required field'),
  }),
  capacity: yup.number().min(1, 'Must be greater than 0'),
  vehicleType: yup
    .mixed<'Electric' | 'Gas' | 'Hybrid'>()
    .oneOf(['Electric', 'Gas', 'Hybrid']),
});

function isRequiredFieldsFilled(values: {
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  vehicleLicensePlate?: string;
  vehicleType?: 'Electric' | 'Gas' | 'Hybrid';
}) {
  return (
    !!values.name &&
    !!values.type &&
    (values.type === 'Driver' || values.type == 'Both'
      ? !!values.vehicleMake &&
        !!values.vehicleModel &&
        !!values.vehicleYear &&
        !!values.vehicleColor &&
        !!values.vehicleLicensePlate &&
        !!values.vehicleType
      : true)
  );
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

  async function submit(values: {
    name?: string;
    type?: 'Rider' | 'Driver' | 'Both';
    preferredVehicle?: VehicleType[];
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleColor?: string;
    vehicleLicensePlate?: string;
    vehicleCapacity?: number;
    vehicleType?: 'Electric' | 'Gas' | 'Hybrid';
  }) {
    let uploadedPhotoUrl = photoUrl;
    const req: ProfilePatchRequest = {
      name: values.name,
      type: values.type,
      preferredVehicle: values.preferredVehicle,
    };

    if (values.type === 'Driver' || values.type == 'Both') {
      req.vehicle = {
        make: values.vehicleMake,
        model: values.vehicleModel,
        year: values.vehicleYear ? parseInt(values.vehicleYear) : undefined,
        color: values.vehicleColor,
        licensePlate: values.vehicleLicensePlate,
        capacity: values.vehicleCapacity,
        vehicleType: values.vehicleType,
      };
    }

    if (file) {
      const storage = getStorage();
      const storageRef = ref(storage, `/users/avatars/${user?.uid}/avatar.jpg`);

      await uploadBytes(storageRef, file);

      uploadedPhotoUrl = await getDownloadURL(storageRef);
      req.photoUrl = uploadedPhotoUrl;
    }

    await updateProfile(req);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (
      selectedFile &&
      selectedFile.type === 'image/jpeg' &&
      selectedFile.size < 1048576
    ) {
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
          initialValues={{
            name: profile.name,
            type: profile.type,
            vehicleMake: profile.vehicle?.make,
            vehicleModel: profile.vehicle?.model,
            vehicleYear: profile.vehicle?.year?.toString(),
            vehicleColor: profile.vehicle?.color,
            vehicleLicensePlate: profile.vehicle?.licensePlate,
            vehicleCapacity: profile?.vehicle?.capacity || 4,
            vehicleType: profile?.vehicle?.vehicleType,
            preferredVehicle: profile.preferredVehicle,
            photoUrl: profile.photoUrl,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            console.log('Form values:', values);
            setSubmitting(true);
            await submit(values);
            setSubmitting(false);
            resetForm({ values });
          }}
        >
          {({
            isSubmitting,
            errors,
            touched,
            dirty,
            resetForm,
            values,
            setFieldValue,
          }) => (
            <Form className="px-4 mt-5 pb-5 mb-5">
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
                label="How do you plan to use this app?"
                required
              >
                <ButtonRadioField
                  name="type"
                  options={['Rider', 'Driver', 'Both']}
                />
              </ProfileField>

              {(values.type === 'Driver' || values.type == 'Both') && (
                <>
                  <ProfileField
                    className="mt-4"
                    errors={errors}
                    touched={touched}
                    label="Vehicle Details"
                    required
                  >
                    <TextField
                      className="mt-3"
                      placeholder="Make"
                      touched={touched}
                      errors={errors}
                      name="vehicleMake"
                    />
                    <TextField
                      className="mt-3"
                      placeholder="Model"
                      touched={touched}
                      errors={errors}
                      name="vehicleModel"
                    />
                    <TextField
                      className="mt-3"
                      placeholder="Year"
                      touched={touched}
                      errors={errors}
                      name="vehicleYear"
                    />
                    <TextField
                      className="mt-3"
                      placeholder="Color"
                      touched={touched}
                      errors={errors}
                      name="vehicleColor"
                    />
                    <TextField
                      className="mt-3"
                      placeholder="License Plate"
                      touched={touched}
                      errors={errors}
                      name="vehicleLicensePlate"
                    />
                  </ProfileField>

                  <ProfileField
                    className="mt-4"
                    errors={errors}
                    touched={touched}
                    label="Vehicle type"
                    required
                  >
                    <ButtonRadioField
                      name="vehicleType"
                      options={['Electric', 'Gas', 'Hybrid']}
                    />
                  </ProfileField>
                  
                  <ProfileField
                    className="mt-4"
                    errors={errors}
                    touched={touched}
                    label="Passenger Capacity"
                  >
                    <div className="container">
                      <div className="row justify-content-start">
                        <button
                          type="button"
                          className="col col-auto btn text-white d-flex justify-content-center align-items-center p-0 pb-1"
                          style={{
                            backgroundColor: '#00634B',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                          }}
                          onClick={() =>
                            setFieldValue(
                              'vehicleCapacity',
                              Math.max(1, values.vehicleCapacity - 1)
                            )
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className={`col col-1 form-control w-auto text-center border-0 user-select-none`}
                          name={'vehicleCapacity'}
                          readOnly
                          value={values.vehicleCapacity}
                        />
                        <button
                          type="button"
                          className="col col-auto btn text-white d-flex justify-content-center align-items-center p-0 pb-1"
                          style={{
                            backgroundColor: '#00634B',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                          }}
                          onClick={() =>
                            setFieldValue(
                              'vehicleCapacity',
                              values.vehicleCapacity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </ProfileField>
                </>
              )}

              {(values.type === 'Rider' || values.type === 'Both') && (
                <ProfileField
                  className="mt-4"
                  errors={errors}
                  touched={touched}
                  name="name"
                  label="What type of vehicle would you prefer to ride in?"
                >
                  <ButtonCheckboxField
                    name="preferredVehicle"
                    options={['Electric', 'Gas', 'Hybrid']}
                  />
                </ProfileField>
              )}

              {(dirty || file) && isRequiredFieldsFilled(values) && (
                <div className="d-flex position-fixed bottom-0 end-0 p-4">
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
                <ToastContainer
                  position="bottom-end"
                  className="position-fixed p-2"
                >
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
