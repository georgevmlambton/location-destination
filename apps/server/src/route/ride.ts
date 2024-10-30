import { Router } from 'express';
import {
  RideCreateRequest,
  RideResponse,
} from '@location-destination/types/src/requests/ride';
import { Ride } from '../db/ride';
import { geocodeAddress } from '../maps';
import { ValidationError } from 'yup';
import { User } from '../db/user';

export const rideRouter = Router();

rideRouter.post('/api/ride', async (req, resp) => {
  try {
    const createReq = new RideCreateRequest(req.body);

    const pickupLocation = await geocodeAddress(createReq.pickupAddress);

    if (!pickupLocation) {
      return resp.status(400).send({ message: 'Invalid pickup address' });
    }

    const dropoffLocation = await geocodeAddress(createReq.dropoffAddress);

    if (!dropoffLocation) {
      return resp.status(400).send({ message: 'Invalid dropoff address' });
    }

    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return resp.status(400).send({ message: 'Unauthorized' });
    }

    const ride = await new Ride({
      pickupAddress: createReq.pickupAddress,
      dropoffAddress: createReq.dropoffAddress,
      state: 'Searching',
      passengers: createReq.passengers,
      preferredVehicle: user.preferredVehicle,
      createdBy: user.id,
    }).save();

    const response: RideResponse = {
      id: ride.id,
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      state: ride.state,
      passengers: ride.passengers,
      preferredVehicle: ride.preferredVehicle,
    };

    resp.send(response);
  } catch (e) {
    console.error(e);

    if (e instanceof ValidationError) {
      return resp
        .status(400)
        .send({ message: 'Validation Errors: ' + e.errors.join(', ') });
    }

    resp.status(500).send({ message: 'Internal Server Error' });
  }
});

rideRouter.post('/api/ride/:id/cancel', async (req, resp) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return resp.status(404).send({ message: 'Ride not found' });
    }

    ride.state = 'Cancelled';
    await ride.save();

    const response: RideResponse = {
      id: ride.id,
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      state: ride.state,
      passengers: ride.passengers,
      preferredVehicle: ride.preferredVehicle,
    };

    resp.send(response);
  } catch (e) {
    console.error(e);

    if (e instanceof ValidationError) {
      return resp
        .status(400)
        .send({ message: 'Validation Errors: ' + e.errors.join(', ') });
    }

    resp.status(500).send({ message: 'Internal Server Error' });
  }
});
