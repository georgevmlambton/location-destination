import arrowLeft from '../assets/arrow-left.svg';
import background from '../assets/background.png';
import { NavButton } from '../components/nav/NavButton';
import { ToastContext } from '../providers/toast-provider';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import { io, Socket } from 'socket.io-client';
import { auth } from '../firebase';

export function OfferRide() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapMarker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());

  const [showEndDialog, setShowEndDialog] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    let cancel = false;

    const initializeSocket = async () => {
      const token = await auth.currentUser?.getIdToken();

      if (cancel) {
        return;
      }

      const socket = io(import.meta.env.VITE_API_URL, {
        extraHeaders: { Authorization: `Bearer ${token}` },
      });

      setSocket(socket);
    };

    if (!socket) {
      initializeSocket();
    }

    return () => {
      cancel = true;
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
      });
    }
  }, []);

  useEffect(() => {
    const id = window.navigator.geolocation.watchPosition(
      setPosition,
      (error) => toast.show(error.message, 'danger'),
      { enableHighAccuracy: true }
    );

    return () => {
      window.navigator.geolocation.clearWatch(id);
    };
  }, [toast]);

  useEffect(() => {
    if (socket && position) {
      socket.emit('offerRide', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
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
  }, [position, socket]);

  return (
    <div
      className="d-flex flex-column align-items-center position-relative"
      style={{
        height: '100vh',
        background:
          'linear-gradient(180deg, rgba(189,229,199,1) 0%, rgba(248,248,248,1) 30%, rgba(255,255,255,1) 100%)',
      }}
    >
      <img
        className="position-absolute"
        src={background}
        style={{
          height: 'auto',
          bottom: '-38%',
          left: '-49%',
          opacity: '24%',
          width: '160%',
        }}
      />

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
    </div>
  );
}
