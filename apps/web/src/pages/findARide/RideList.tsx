import { useEffect, useState } from 'react';
import lightning from '../../assets/lightning-charge-fill.svg';
import fuel from '../../assets/fuel-pump-fill.svg';
import rideList1 from '../../assets/ride-list-1.svg';
import rideList2 from '../../assets/ride-list-2.svg';
import rideList3 from '../../assets/ride-list-3.svg';
import { NavButton } from '../../components/nav/NavButton';
import arrowLeft from '../../assets/arrow-left.svg';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import * as yup from 'yup';
import { Button, Modal } from 'react-bootstrap';
import { getInstance } from '../../axios';
import { RideResponse } from '@location-destination/types/src/requests/ride';
import { NearbyRide } from '@location-destination/types/src/ride';
import { useSocket } from '../../hook/useSocket';

const validationSchema = yup.object().shape({
  pickup: yup.string().required('Pickup is required'),
  dropoff: yup.string().required('Dropoff is required'),
});

function getVehicleBackground(ride: NearbyRide) {
  switch (ride.type) {
    case 'Electric':
      return rideList1;
    case 'Hybrid':
      return rideList2;
    default:
      return rideList3;
  }
}

function getVehicleIcon(ride: NearbyRide) {
  switch (ride.type) {
    case 'Electric':
      return [lightning];
    case 'Hybrid':
      return [lightning, fuel];
    default:
      return [fuel];
  }
}

export function RideList() {
  const [rides, setRides] = useState<NearbyRide[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState<NearbyRide | null>(null);
  const [sent, setSent] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const ride: RideResponse = location.state.ride;

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.emit('findRide', ride.id);
      socket.on('nearbyRides', setRides);
    }

    return () => {
      socket?.off('nearbyRides', setRides);
    };
  }, [socket, ride]);

  const handleCancelClick = () => {
    setShowModal(true);
  };

  const handleYesCancel = async () => {
    const axios = await getInstance();
    await axios.post(`/api/ride/${ride.id}/cancel`);
    navigate('/find-a-ride');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const sendRequest = (ride: NearbyRide) => {
    socket?.emit('requestRide', ride.id);
    setSelectedRide(null);
    setSent([...sent, ride.id]);
  };

  return (
    <div className="d-flex flex-column align-items-center position-relative h-100">
      <div className="p-4 pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={handleCancelClick} />
      </div>

      <Formik
        initialValues={{
          pickup: ride.pickupAddress,
          dropoff: ride.dropoffAddress,
        }}
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

      <div className="w-100 mt-4 text-center">
        {rides.length === 0 ? (
          <p>No rides found.</p>
        ) : (
          <div className="d-flex flex-column align-items-center">
            {rides.map((ride) => (
              <div
                role={sent.includes(ride.id) ? '' : 'button'}
                onClick={
                  sent.includes(ride.id)
                    ? undefined
                    : () => setSelectedRide(ride)
                }
                key={ride.id}
                className="position-relative mb-4"
                style={{
                  backgroundImage: `url(${getVehicleBackground(ride)})`,
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
                {sent.includes(ride.id) && (
                  <p className="text-white text-end me-3">
                    <em>Request Sent</em>
                  </p>
                )}
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
                    {getVehicleIcon(ride).map((icon, index) => (
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
                  {ride.waitTimeMinutes} min
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="position-absolute bottom-0 start-0 w-100 p-4 pb-5">
        <button
          onClick={handleCancelClick}
          className="btn btn-danger rounded-pill w-100 py-2 fs-4"
          style={{
            zIndex: 1,
          }}
        >
          Cancel
        </button>
      </div>

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

      {selectedRide && (
        <Modal
          show
          onHide={handleCloseModal}
          keyboard={false}
          style={{ marginTop: '62px' }}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>Send Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>Send a request to this ride?</Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              className="rounded-pill"
              variant="outline-dark"
              onClick={() => setSelectedRide(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-pill"
              variant="success"
              onClick={() => sendRequest(selectedRide)}
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
