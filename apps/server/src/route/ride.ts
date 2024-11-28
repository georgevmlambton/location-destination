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
import { Account } from '../db/account';

export const rideRouter = Router();

rideRouter.get('/rides/active', async (req, resp) => {
  const activeRide = await findActiveRide(req.user.uid);

  if (activeRide) {
    return resp.send(createRideResponse(activeRide));
  }

  return resp.status(404).send({ message: 'No active rides' });
});

rideRouter.post('/rides', async (req, resp) => {
  try {
    if (await findActiveRide(req.user.uid)) {
      return resp
        .status(409)
        .send({ message: 'You already have an active ride' });
    }

    const user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      return resp.status(400).send({ message: 'Unauthorized' });
    }

    const account = await Account.findOne({ user: user.id });

    if ((account?.amount ?? 0) < 0) {
      return resp
        .status(400)
        .send({ message: 'Please pay off your balance before booking a ride' });
    }

    const createReq = new RideCreateRequest(req.body);

    const pickupLocation = await geocodeAddress(createReq.pickupAddress);

    if (!pickupLocation) {
      return resp.status(400).send({ message: 'Invalid pickup address' });
    }

    const dropoffLocation = await geocodeAddress(createReq.dropoffAddress);

    if (!dropoffLocation) {
      return resp.status(400).send({ message: 'Invalid dropoff address' });
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
      createdBy: { name: user.name || '', uid: user.uid },
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

    resp.status(500).send({ message: e.message });
  }
});

rideRouter.post('/rides/:id/cancel', async (req, resp) => {
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

rideRouter.get('/rides/:id', async (req, resp) => {
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

rideRouter.get('/rides', async (req, resp) => {
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

async function findActiveRide(uid: string) {
  const user = await User.findOne({ uid });

  if (user) {
    const activeRide = await Ride.findOne({
      createdBy: user.id,
      state: { $nin: ['Cancelled', 'Completed'] },
    })
      .populate<{
        createdBy: IUser;
      }>('createdBy')
      .populate<{ driver: IUser }>('driver');

    if (activeRide) {
      return activeRide;
    }
  }

  return null;
}

export function createRideResponse(
  ride: Omit<IRide, 'createdBy' | 'driver'> & {
    _id: Types.ObjectId;
    createdBy: IUser;
    driver?: IUser;
  }
): RideResponse {
  return {
    id: ride._id.toString(),
    createdBy: { name: ride.createdBy.name || '', uid: ride.createdBy.uid },
    driver: { name: ride.driver?.name || '' },
    pickupAddress: ride.pickupAddress,
    dropoffAddress: ride.dropoffAddress,
    state: ride.state,
    passengers: ride.passengers,
    preferredVehicle: ride.preferredVehicle,
    payment: ride.payment,
  };
}
