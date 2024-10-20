import { Router } from 'express';
import {
  ProfilePatchRequest,
  ProfileResponse,
} from '@location-destination/types/src/requests/profile';
import { IUser, User } from '../db/user';
import { ValidationError } from 'yup';

export const profileRouter = Router();

profileRouter.get('/api/profile', async (req, resp) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    const profile = createProfileResponse(req.user.uid, user);

    resp.send(profile);
  } catch (e) {
    console.error(e);
    resp.status(500).send({ message: 'Internal Server Error' });
  }
});

profileRouter.patch('/api/profile', async (req, resp) => {
  try {
    const patch = new ProfilePatchRequest(req.body);

    const user =
      (await User.findOne({ uid: req.user.uid })) ||
      new User({ uid: req.user.uid });

    if (patch.name) {
      user.name = patch.name;
    }

    if (patch.type) {
      user.type = patch.type;
    }

    if (patch.vehicle) {
      user.vehicle = patch.vehicle;
    }

    if (patch.preferredVehicle) {
      user.preferredVehicle = patch.preferredVehicle;
    }

    if (patch.photoUrl) {
      user.photoUrl = patch.photoUrl;
    }

    await user.save();
    const profile = createProfileResponse(req.user.uid, user);
    resp.send(profile);
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

function createProfileResponse(
  uid: string,
  user: IUser | null
): ProfileResponse {
  return {
    userId: uid,
    name: user?.name,
    type: user?.type,
    vehicle: user?.vehicle,
    preferredVehicle: user?.preferredVehicle,
    photoUrl: user?.photoUrl || null,
  };
}
