import arrowLeft from '../assets/arrow-left.svg';
import { NavButton } from '../components/nav/NavButton';
import { useNavigate } from 'react-router-dom';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
// @ts-ignore
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import { usePosition } from '../hook/usePosition';
import { useSocket } from '../hook/useSocket';
import { RideResponse } from '@location-destination/types/src/requests/ride';
import { ToastContext } from '../providers/toast-provider';

export function OfferRide() {
  const navigate = useNavigate();
  const position = usePosition();
  const socket = useSocket();
  const toast = useContext(ToastContext);

  const [rideRequest, setRideRequest] = useState<{
    ride: RideResponse;
    distanceMin: number;
  } | null>(null);
  const [pickup, setPickup] = useState<{
    ride: RideResponse;
    location: { lat: number; lng: number };
  } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapMarker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());
  const pickupMarker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());
  const directions = useRef<MapboxDirections | null>(null);
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

  const end = useCallback(() => {
    if (pickup) {
      socket?.emit('cancelRide', pickup.ride.id);
    }

    toast.show('Ride was cancelled', 'danger');
    navigate('/');
  }, [navigate, pickup, socket, toast]);

  const confirmRide = async (ride: RideResponse) => {
    const geocodeUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(ride.pickupAddress)}&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`;
    const response = await fetch(geocodeUrl);
    const body = await response.json();
    const pickupLocation = {
      lat: body.features[0].geometry.coordinates[1],
      lng: body.features[0].geometry.coordinates[0],
    };

    setRideRequest(null);
    setPickup({
      location: pickupLocation,
      ride,
    });

    if (mapRef.current && directions.current && position) {
      directions.current.setOrigin([
        position.coords.longitude,
        position.coords.latitude,
      ]);
      directions.current.setDestination([
        pickupLocation.lng,
        pickupLocation.lat,
      ]);
    }

    socket?.emit('confirmRide', ride.id);
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current && position) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 13,
        accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      });

      directions.current = new MapboxDirections({
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
      });
      mapRef.current.addControl(directions.current, 'top-left');
    }
  }, [position]);

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
      socket.on('endRide', end);
    }

    if (mapRef.current && position) {
      const {
        coords: { latitude: lat, longitude: lng },
      } = position;

      mapMarker.current
        .setLngLat({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        })
        .addTo(mapRef.current);

      if (pickup) {
        pickupMarker.current.setLngLat(pickup.location).addTo(mapRef.current);
        mapRef.current.fitBounds([{ lat, lng }, pickup.location], {
          padding: 50,
        });
      } else {
        mapRef.current.setCenter({ lat, lng }).setZoom(15);
      }
    }

    return () => {
      socket?.off('requestRide', onRequestRide);
      socket?.off('endRide', end);
    };
  }, [onRequestRide, position, socket, pickup, end]);

  return (
    <div className="d-flex flex-column align-items-stretch px-4 position-relative h-100">
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
        {!pickup && (
          <h3 className="text-dark-emphasis text-center">
            Waiting for requests
          </h3>
        )}
        {pickup && (
          <h3 className="text-dark-emphasis text-center">
            Picking up {pickup.ride.createdBy.name}
          </h3>
        )}

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
            <Button className="rounded-pill" variant="danger" onClick={end}>
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
            <p className="fs-4">
              <b>Dropoff:</b> {rideRequest.ride.dropoffAddress}
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
            <Button
              className="rounded-pill"
              variant="success"
              onClick={() => confirmRide(rideRequest.ride)}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
