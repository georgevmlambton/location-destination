import { Router } from 'express';
import {
  RideCreateRequest,
  RideResponse,
} from '@location-destination/types/src/requests/ride';
import { Ride } from '../db/ride';
import { geocodeAddress } from '../maps';
import { ValidationError } from 'yup';
import { IUser, User } from '../db/user';

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

    resp.status(500).send({ message: 'Internal Server Error' });
  }
});

rideRouter.post('/api/ride/:id/cancel', async (req, resp) => {
  try {
    const ride = await Ride.findById(req.params.id).populate<{
      createdBy: IUser;
    }>('createdBy');

    if (!ride) {
      return resp.status(404).send({ message: 'Ride not found' });
    }

    ride.state = 'Cancelled';
    await ride.save();

    const response: RideResponse = {
      id: ride.id,
      createdBy: { name: ride.createdBy.name || '', uid: ride.createdBy.uid },
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

rideRouter.get('/api/ride/:id', async (req, resp) => {
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

    const response: RideResponse = {
      id: ride.id,
      createdBy: { name: ride.createdBy.name || '', uid: ride.createdBy.uid },
      driver: { name: ride.driver.name || '' },
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      state: ride.state,
      passengers: ride.passengers,
      preferredVehicle: ride.preferredVehicle,
      payment: ride.payment,
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

    const response = rides.map(ride => ({
      id: ride.id,
      pickupAddress: ride.pickupAddress,
      dropoffAddress: ride.dropoffAddress,
      payment: ride.payment,
      driver: ride.driver,
      createdBy: ride.createdBy,
    }));
    
    resp.json(response);
  } catch (e) {
    console.error(e);
    resp.status(500).send({ message: 'Internal Server Error' });
  }
});
