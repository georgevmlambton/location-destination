import { Router } from 'express';
import {
  ProfilePatchRequest,
  ProfileResponse,
} from '@location-destination/types/src/requests/profile';
import { User } from '../db/user';

export const profileRouter = Router();

profileRouter.get('/api/profile', async (req, resp) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });

    const profile: ProfileResponse = {
      userId: req.user.uid,
      name: user?.name,
    };

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

    await user.save();

    const profile: ProfileResponse = {
      userId: req.user.uid,
      name: user?.name,
    };
    resp.send(profile);
  } catch (e) {
    console.error(e);
    resp.status(500).send({ message: 'Internal Server Error' });
  }
});
