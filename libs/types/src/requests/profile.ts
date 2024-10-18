import * as yup from 'yup';

export class ProfilePatchRequest {
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  photoUrl?: string | null;

  constructor(reqBody: unknown) {
    const schema = yup.object({
      name: yup.string().min(1, 'Name cannot be empty'),
      type: yup
        .mixed<'Rider' | 'Driver' | 'Both'>()
        .oneOf(['Rider', 'Driver', 'Both']),
      photoUrl: yup.string().url('Invalid URL').notRequired(),
    });

    const { name, type, photoUrl} = schema.validateSync(reqBody);

    this.name = name;
    this.type = type;
    this.photoUrl = photoUrl;
  }
}

export type ProfileResponse = {
  userId: string;
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  photoUrl?: string | null;
};
