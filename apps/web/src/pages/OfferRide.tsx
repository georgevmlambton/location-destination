import arrowLeft from '../assets/arrow-left.svg';
import { NavButton } from '../components/nav/NavButton';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import { usePosition } from '../hook/usePosition';
import { useSocket } from '../hook/useSocket';
import { RideResponse } from '@location-destination/types/src/requests/ride';

export function OfferRide() {
  const navigate = useNavigate();
  const position = usePosition();
  const socket = useSocket();

  const [rideRequest, setRideRequest] = useState<{
    ride: RideResponse;
    distanceMin: number;
  } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapMarker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());
  const startedRef = useRef(false);

  const [showEndDialog, setShowEndDialog] = useState(false);

  const onRequestRide = useCallback(
    (ride: RideResponse, distanceMin: number) => {
      setRideRequest({ ride, distanceMin });
    },
    []
  );

  const rejectRide = (ride: RideResponse) => {
    socket?.emit('rejectRide', ride.id);
    setRideRequest(null);
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
      });
    }
  }, []);

  useEffect(() => {
    if (socket && position) {
      if (!startedRef.current) {
        socket.emit('offerRide', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        startedRef.current = true;
      } else {
        socket.emit('driverLocation', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      }

      socket.on('requestRide', onRequestRide);
    }

    if (mapRef.current && position) {
      const {
        coords: { latitude: lat, longitude: lng },
      } = position;

      mapRef.current.setCenter({ lat, lng }).setZoom(15);

      mapMarker.current
        .setLngLat({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        })
        .addTo(mapRef.current);
    }

    return () => {
      socket?.off('requestRide', onRequestRide);
    };
  }, [onRequestRide, position, socket]);

  return (
    <div className="d-flex flex-column align-items-center position-relative h-100">
      <div className="p-4 pb-5 position-relative w-100">
        <NavButton icon={arrowLeft} onClick={() => setShowEndDialog(true)} />
      </div>

      <div
        className="d-flex flex-column w-100 px-4"
        style={{
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <h3 className="text-dark-emphasis text-center">Waiting for requests</h3>

        <div ref={mapContainerRef} style={{ height: '400px' }}></div>

        <button
          type="submit"
          className="btn btn-danger rounded-pill w-100 py-2 fs-4 mb-5"
          style={{
            border: 'none',
            zIndex: 1,
          }}
          onClick={() => setShowEndDialog(true)}
        >
          End
        </button>
      </div>

      {showEndDialog && (
        <Modal
          show
          onHide={() => setShowEndDialog(false)}
          keyboard={false}
          style={{ marginTop: '62px' }}
          className="vw-100"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>Stop Rides</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to stop offering rides?</Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              className="rounded-pill"
              variant="outline-dark"
              onClick={() => setShowEndDialog(false)}
            >
              Close
            </Button>
            <Button
              className="rounded-pill"
              variant="danger"
              onClick={() => {
                navigate('/');
              }}
            >
              Stop
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {rideRequest && (
        <Modal
          show
          onHide={() => setRideRequest(null)}
          keyboard={false}
          style={{ marginTop: '62px' }}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title>
              {Math.round(rideRequest.distanceMin)}min away
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="fs-4">
              <b>Pickup:</b> {rideRequest.ride.pickupAddress}
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button
              className="rounded-pill"
              variant="outline-dark"
              onClick={() => rejectRide(rideRequest.ride)}
            >
              Cancel
            </Button>
            <Button className="rounded-pill" variant="success">
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
