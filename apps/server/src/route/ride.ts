import { Router } from 'express';
import {
  RideCreateRequest,
  RideResponse,
} from '@location-destination/types/src/requests/ride';
import { IRide, Ride } from '../db/ride';
import { geocodeAddress } from '../maps';
import { ValidationError } from 'yup';
import { IUser, User } from '../db/user';
import { Types } from 'mongoose';

export const rideRouter = Router();

rideRouter.post('/api/rides', async (req, resp) => {
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
      createdBy: { name: user.name || '' },
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

rideRouter.post('/api/rides/:id/cancel', async (req, resp) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate<{
        createdBy: IUser;
      }>('createdBy')
      .populate<{ driver: IUser }>('driver');

    if (!ride) {
      return resp.status(404).send({ message: 'Ride not found' });
    }

    ride.state = 'Cancelled';
    await ride.save();

    const response: RideResponse = createRideResponse(ride);

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

rideRouter.get('/api/rides/:id', async (req, resp) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate<{
        createdBy: IUser;
      }>('createdBy')
      .populate<{ driver: IUser }>('driver');

    if (!ride) {
      return resp.status(404).send({ message: 'Ride not found' });
    }

    await ride.save();

    const response: RideResponse = createRideResponse(ride);

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

rideRouter.get('/api/rides', async (req, resp) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return resp.status(400).send({ message: 'Unauthorized' });
    }

    const rides = await Ride.find({
      $or: [{ createdBy: user.id }, { driver: user.id }],
    })
      .populate<{ createdBy: IUser }>('createdBy')
      .populate<{ driver: IUser }>('driver');

    if (!rides || rides.length === 0) {
      return resp.status(404).send({ message: 'No rides found for this user' });
    }

    const response = rides.map((ride) => createRideResponse(ride));

    resp.json(response);
  } catch (e) {
    console.error(e);
    resp.status(500).send({ message: 'Internal Server Error' });
  }
});

export function createRideResponse(
  ride: Omit<IRide, 'createdBy' | 'driver'> & {
    _id: Types.ObjectId;
    createdBy: IUser;
    driver?: IUser;
  }
): RideResponse {
  return {
    id: ride._id.toString(),
    createdBy: { name: ride.createdBy.name || '' },
    driver: { name: ride.driver?.name || '' },
    pickupAddress: ride.pickupAddress,
    dropoffAddress: ride.dropoffAddress,
    state: ride.state,
    passengers: ride.passengers,
    preferredVehicle: ride.preferredVehicle,
    payment: ride.payment,
  };
}
