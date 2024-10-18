import { Router } from 'express';
import {
  ProfilePatchRequest,
  ProfileResponse,
} from '@location-destination/types/src/requests/profile';
import { IUser, User } from '../db/user';
import { ValidationError } from 'yup';
import multer from 'multer';
import { bucket } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

export const profileRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const firebaseBaseUrl = "https://firebasestorage.googleapis.com/v0/b/location-destination-d5d25.appspot.com/o/";

profileRouter.get('/api/profile', async (req, resp) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return resp.status(404).send({ message: 'User not found' });
    }

    const profile = createProfileResponse(req.user.uid, user);

    resp.send(profile);
  } catch (e) {
    console.error(e);
    resp.status(500).send({ message: 'Internal Server Error' });
  }
});

profileRouter.patch('/api/profile', upload.single('photo'), async (req, resp) => {
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

    if (req.file) {
      const fileName = `users/avatars/${req.user.uid}/avatar.jpg`;
      const file = bucket.file(fileName);
      const token = uuidv4();

      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: token,
          },
        },
      });

      stream.on('finish', async () => {
        const photoUrl = `${firebaseBaseUrl}${encodeURIComponent(fileName)}?alt=media&token=${token}`;
        user.photoUrl = photoUrl;
        await user.save();
        const profile = createProfileResponse(req.user.uid, user);
        resp.send(profile);
      });

      stream.on('error', (error) => {
        console.error('Error uploading file:', error);
        resp.status(500).send({ message: 'Error uploading photo' });
      });

      stream.end(req.file.buffer);
    } else {
      await user.save();
      const profile = createProfileResponse(req.user.uid, user);
      resp.send(profile);
    }
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
    photoUrl: user?.photoUrl || null,
  };
}
