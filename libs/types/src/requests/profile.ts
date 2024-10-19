import * as yup from 'yup';

export class ProfilePatchRequest {
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  preferredVehicle?: VehicleType[];

  constructor(reqBody: unknown) {
    const schema = yup.object({
      name: yup.string().min(1, 'Name cannot be empty'),
      type: yup
        .mixed<'Rider' | 'Driver' | 'Both'>()
        .oneOf(['Rider', 'Driver', 'Both']),
      preferredVehicle: yup
        .array()
        .of(
          yup
            .mixed<VehicleType>()
            .oneOf(['Electric', 'Hybrid', 'Gas'])
            .required()
        ),
    });

    const { name, type, preferredVehicle } = schema.validateSync(reqBody);

    this.name = name;
    this.type = type;
    this.preferredVehicle = preferredVehicle;
  }
}

export type VehicleType = 'Electric' | 'Hybrid' | 'Gas';

export type ProfileResponse = {
  userId: string;
  name?: string;
  type?: 'Rider' | 'Driver' | 'Both';
  preferredVehicle?: VehicleType[];
};
