import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NavButton } from '../components/nav/NavButton';
import arrowLeft from '../assets/arrow-left.svg';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { RideResponse } from '@location-destination/types/src/requests/ride';
import { useSocket } from '../hook/useSocket';
import { ToastContext } from '../providers/toast-provider';
import mapboxgl from 'mapbox-gl';
import carFrontFill from '../assets/car-front-fill.svg';
// @ts-ignore
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import styles from './Ride.module.css';
import { geocode } from '../map';

const driverMarkerEl = document.createElement('div');
driverMarkerEl.innerHTML = `<img class="carIcon" src="${carFrontFill}"></img>`;
driverMarkerEl.className = styles.driverMarker;

export function Ride() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [ride, setRide] = useState<RideResponse>(location.state.ride);

  const [showModal, setShowModal] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pickupLocation, setPickupLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapMarker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());
  const driverMarker = useRef<mapboxgl.Marker>(
    new mapboxgl.Marker(driverMarkerEl)
  );
  const directions = useRef<MapboxDirections>(
    new MapboxDirections({
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      unit: 'metric',
      profile: 'mapbox/driving',
      controls: {
        inputs: false,
        instructions: false,
        profileSwitcher: false,
      },
      placeholder: {
        origin: 'Start Location',
        destination: 'End Location',
      },
    })
  );

  const socket = useSocket();

  const cancel = useCallback(async () => {
    toast.show('Ride was cancelled', 'danger');
    navigate('/');
  }, [navigate, toast]);

  const end = useCallback(() => {
    toast.show('Ride complete', 'success');
    navigate('/ride/summary', { state: { ride } });
  }, [navigate, toast, ride]);

  const handleCancelClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
      });

      mapRef.current.addControl(directions.current, 'top-left');

      geocode(ride.pickupAddress).then(setPickupLocation);
    }
  }, [ride]);

  const startRide = useCallback(
    async (ride: RideResponse) => {
      setRide(ride);

      if (pickupLocation) {
        const dropoffLocation = await geocode(ride.dropoffAddress);
        directions.current.setOrigin([pickupLocation.lng, pickupLocation.lat]);
        directions.current.setDestination([
          dropoffLocation.lng,
          dropoffLocation.lat,
        ]);
        setPickupLocation(dropoffLocation);
      }
    },
    [pickupLocation]
  );

  useEffect(() => {
    if (socket) {
      socket.emit('ride', ride.id);
      socket.on('driverLocation', setDriverLocation);
      socket.on('cancelRide', cancel);
      socket.on('startRide', startRide);
      socket.on('endRide', end);
    }

    return () => {
      socket?.off('driverLocation', setDriverLocation);
      socket?.off('cancelRide', cancel);
      socket?.off('startRide', startRide);
      socket?.off('endRide', end);
    };
  }, [cancel, end, ride.id, socket, startRide]);

  useEffect(() => {
    if (mapRef.current) {
      if (driverLocation) {
        driverMarker.current.setLngLat(driverLocation).addTo(mapRef.current);
      }

      if (pickupLocation) {
        mapMarker.current.setLngLat(pickupLocation).addTo(mapRef.current);
      }

      if (pickupLocation && driverLocation) {
        mapRef.current.fitBounds([pickupLocation, driverLocation], {
          padding: 50,
        });
      }
    }
  }, [pickupLocation, driverLocation]);

  return (
    <div className="d-flex flex-column align-items-stretch px-4 position-relative h-100">
      <div className="p-4 pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={handleCancelClick} />
      </div>

      <Formik
        initialValues={{
          pickup: ride.pickupAddress,
          dropoff: ride.dropoffAddress,
        }}
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
                  disabled
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
                  disabled
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

      {ride.state === 'PickingUp' && (
        <h3 className="text-dark-emphasis text-center">
          {ride.driver?.name} is on their way
        </h3>
      )}

      {ride.state === 'Started' && (
        <h3 className="text-dark-emphasis text-center">Enjoy your ride</h3>
      )}

      <div ref={mapContainerRef} style={{ height: '400px' }}></div>

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
              onClick={() => {
                socket?.emit('cancelRide');
                cancel();
              }}
            >
              Yes, Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
