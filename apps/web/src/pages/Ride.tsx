import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NavButton } from '../components/nav/NavButton';
import arrowLeft from '../assets/arrow-left.svg';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { getInstance } from '../axios';
import { RideResponse } from '@location-destination/types/src/requests/ride';
import { useSocket } from '../hook/useSocket';
import { ToastContext } from '../providers/toast-provider';
import mapboxgl from 'mapbox-gl';
import carFrontFill from '../assets/car-front-fill.svg';
import styles from './Ride.module.css';

const driverMarkerEl = document.createElement('div');
driverMarkerEl.innerHTML = `<img class="carIcon" src="${carFrontFill}"></img>`;
driverMarkerEl.className = styles.driverMarker;

export function Ride() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const ride: RideResponse = location.state.ride;

  const [showModal, setShowModal] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pickupLocation, setPickupLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [startTheRide, setStartTheRide] = useState<{
    ride: RideResponse
  } | null>();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapMarker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());
  const driverMarker = useRef<mapboxgl.Marker>(
    new mapboxgl.Marker(driverMarkerEl)
  );

  const socket = useSocket();

  const cancel = useCallback(async () => {
    const axios = await getInstance();
    await axios.post(`/api/ride/${ride.id}/cancel`);
    toast.show('Ride was cancelled', 'danger');
    socket?.emit('cancelRide');
    navigate('/');
  }, [socket, navigate, ride.id, toast]);

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
    }

    const geocodeUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(ride.pickupAddress)}&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;
    fetch(geocodeUrl)
      .then((response) => response.json())
      .then((body) =>
        setPickupLocation({
          lat: body.features[0].geometry.coordinates[1],
          lng: body.features[0].geometry.coordinates[0],
        })
      );
  }, [ride]);

  useEffect(() => {
    if (socket) {
      socket.emit('ride', ride.id);
      socket.on('driverLocation', setDriverLocation);
      socket.on('endRide', cancel);
      socket.on('startRide', setStartTheRide);
    }

    return () => {
      socket?.off('driverLocation', setDriverLocation);
      socket?.off('endRide', cancel);
      socket?.off('startRide', setStartTheRide)
    };
  }, [cancel, ride.id, socket]);

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

  useEffect(() => {
    if (startTheRide) {
      console.log(startTheRide);
    }
  }, [startTheRide]);

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

      <h3 className="text-dark-emphasis text-center">
        {ride.driver?.name} is on their way
      </h3>

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
            <Button className="rounded-pill" variant="danger" onClick={cancel}>
              Yes, Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
