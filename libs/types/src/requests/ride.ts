import * as yup from 'yup';

export class RideCreateRequest {
  pickupAddress: string;
  dropoffAddress: string;
  passengers: number;
  preferredVehicle?: ('Electric' | 'Hybrid' | 'Gas')[];

  constructor(reqBody: unknown) {
    const schema = yup.object({
      pickupAddress: yup
        .string()
        .min(1, 'Pickup address cannot be empty')
        .required('Pickup address is required'),
      dropoffAddress: yup
        .string()
        .min(1, 'Drop-off address cannot be empty')
        .required('Drop-off address is required'),
      passengers: yup
        .number()
        .min(1, 'Cannot book for less than 1 passenger')
        .required(),
      preferredVehicle: yup
        .array()
        .of(
          yup
            .mixed<'Electric' | 'Hybrid' | 'Gas'>()
            .oneOf(['Electric', 'Hybrid', 'Gas'])
            .required()
        ),
    });

    const { pickupAddress, dropoffAddress, passengers, preferredVehicle } =
      schema.validateSync(reqBody);

    this.pickupAddress = pickupAddress;
    this.dropoffAddress = dropoffAddress;
    this.passengers = passengers;
    this.preferredVehicle = preferredVehicle;
  }
}

export type RideState =
  | 'Searching'
  | 'Cancelled'
  | 'PickingUp'
  | 'Started'
  | 'Completed';

export type RideResponse = {
  id: string;
  createdBy: {
    name: string;
  };
  driver?: {
    name: string;
  };
  pickupAddress: string;
  dropoffAddress: string;
  state: RideState;
  passengers: number;
  preferredVehicle?: ('Electric' | 'Hybrid' | 'Gas')[];
};
