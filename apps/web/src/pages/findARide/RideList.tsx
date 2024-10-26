import React, { useState } from 'react';
import lightning from '../../assets/lightning-charge-fill.svg';
import fuel from '../../assets/fuel-pump-fill.svg';
import rideList1 from '../../assets/ride-list-1.svg';
import rideList2 from '../../assets/ride-list-2.svg';
import rideList3 from '../../assets/ride-list-3.svg';
import { NavButton } from '../../components/nav/NavButton';
import arrowLeft from '../../assets/arrow-left.svg';
import background from '../../assets/background.png';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import * as yup from 'yup';
import { Button, Modal } from 'react-bootstrap';

type Ride = {
  id: number;
  car: string;
  type: string;
  icon?: string;
  icons?: string[];
  waitTime: string;
  backgroundImage: string;
};

const rideList: Ride[] = [
  {
    id: 1,
    car: '2022 Nissan Leaf',
    type: 'Electric',
    icon: lightning,
    waitTime: '2 min',
    backgroundImage: rideList1,
  },
  {
    id: 2,
    car: '2018 Toyota Camry',
    type: 'Hybrid',
    icons: [lightning, fuel],
    waitTime: '3 min',
    backgroundImage: rideList2,
  },
  {
    id: 3,
    car: '2011 Chevrolet Cruze',
    type: 'Gas',
    icon: fuel,
    waitTime: '7 min',
    backgroundImage: rideList3,
  },
];

const validationSchema = yup.object().shape({
  pickup: yup.string().required('Pickup is required'),
  dropoff: yup.string().required('Dropoff is required'),
});

export function RideList() {
  const [rides, setRides] = useState<Ride[]>(rideList);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup = '', dropoff = '' } = location.state || {};

  const handleCancelClick = () => {
    setShowModal(true);
  };

  const handleYesCancel = () => {
    navigate('/find-a-ride');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="d-flex flex-column align-items-center position-relative">
      <div className="p-4 pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={handleCancelClick} />
      </div>

      <Formik
        initialValues={{ pickup, dropoff }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          navigate('/find-a-ride', {
            state: { pickup: values.pickup, dropoff: values.dropoff },
          });
        }}
      >
        {({ errors, touched }) => (
          <Form className="d-flex flex-column">
            <div className="mb-4">
              <div className="position-relative mb-0">
                <span className="position-absolute top-50 translate-middle-y ms-3">
                  <i className="bi bi-geo-alt"></i>
                </span>
                <Field
                  type="text"
                  placeholder="Pickup Address"
                  className={`form-control py-2 ps-5 fs-5 ${
                    touched.pickup && errors.pickup
                      ? 'border-danger'
                      : 'border-secondary'
                  }`}
                  name="pickup"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D1D1',
                    borderRadius: '10px 10px 0 0',
                    marginBottom: '-1px',
                  }}
                />
              </div>

              <div className="position-relative">
                <span className="position-absolute top-50 translate-middle-y ms-3">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
                <Field
                  type="text"
                  placeholder="Drop-off Address"
                  className={`form-control py-2 ps-5 fs-5 ${
                    touched.dropoff && errors.dropoff
                      ? 'border-danger'
                      : 'border-secondary'
                  }`}
                  name="dropoff"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D1D1',
                    borderRadius: '0 0 10px 10px',
                  }}
                />
              </div>
            </div>

            <ErrorMessage
              name="pickup"
              className="text-danger ms-2"
              component="p"
            />
            <ErrorMessage
              name="dropoff"
              className="text-danger ms-2"
              component="p"
            />
          </Form>
        )}
      </Formik>

      <h4 className="text-center mt-4">Looking for nearby rides...</h4>

      <div className="w-100 mt-4">
        {rides.length === 0 ? (
          <p>No rides found.</p>
        ) : (
          <div className="d-flex flex-column align-items-center">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="position-relative mb-4"
                style={{
                  backgroundImage: `url(${ride.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '75%',
                  height: '150px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '25%',
                    left: '5%',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  <p className="mb-0">{ride.car}</p>
                  <small className="d-flex align-items-center">
                    {ride.type}
                    {ride.icon && (
                      <img
                        src={ride.icon}
                        alt={`${ride.type} icon`}
                        className="ms-2"
                        style={{
                          width: '24px',
                          height: '24px',
                          filter: 'invert(100%) brightness(100%)',
                        }}
                      />
                    )}
                    {ride.icons &&
                      ride.icons.map((icon, index) => (
                        <img
                          key={index}
                          src={icon}
                          alt={`${ride.type} icon ${index + 1}`}
                          className="ms-2"
                          style={{
                            width: '24px',
                            height: '24px',
                            filter: 'invert(100%) brightness(100%)',
                          }}
                        />
                      ))}
                  </small>
                </div>
                <p
                  style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '5%',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {ride.waitTime}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleCancelClick}
        className="btn btn-danger rounded-pill mt-4"
        style={{ zIndex: 1, width: '80%', marginBottom: '20px' }}
      >
        Cancel
      </button>

      {showModal && (
        <Modal
          show
          onHide={handleCloseModal}
          keyboard={false}
          style={{ marginTop: '62px' }}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>Cancel Ride</Modal.Title>
          </Modal.Header>
          <Modal.Body>Do you really want to cancel your ride?</Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              className="rounded-pill"
              variant="outline-dark"
              onClick={handleCloseModal}
            >
              Close
            </Button>
            <Button
              className="rounded-pill"
              variant="danger"
              onClick={handleYesCancel}
            >
              Yes, Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
