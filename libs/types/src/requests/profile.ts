import * as yup from 'yup';

export class ProfilePatchRequest {
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    licensePlate?: string;
  };

  constructor(reqBody: unknown) {
    const schema = yup.object({
      name: yup.string().min(1, 'Name cannot be empty'),
      type: yup
        .mixed<'Rider' | 'Driver' | 'Both'>()
        .oneOf(['Rider', 'Driver', 'Both']),
      vehicle: yup.object({
        make: yup.string(),
        model: yup.string(),
        year: yup.number().min(1900),
        color: yup.string(),
        licensePlate: yup.string(),
      }),
    });

    const { name, type, vehicle } = schema.validateSync(reqBody);

    this.name = name;
    this.type = type;
    this.vehicle = vehicle;
  }
}

export type ProfileResponse = {
  userId: string;
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  vehicle?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    licensePlate?: string;
  };
};
