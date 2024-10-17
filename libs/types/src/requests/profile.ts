import * as yup from 'yup';

export class ProfilePatchRequest {
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';

  constructor(reqBody: unknown) {
    const schema = yup.object({
      name: yup.string().min(1, 'Name cannot be empty'),
      type: yup
        .mixed<'Rider' | 'Driver' | 'Both'>()
        .oneOf(['Rider', 'Driver', 'Both']),
    });

    const { name, type } = schema.validateSync(reqBody);

    this.name = name;
    this.type = type;
  }
}

export type ProfileResponse = {
  userId: string;
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
};
