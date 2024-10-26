import * as yup from 'yup';

export class RideCreateRequest {
  pickupAddress: string;
  dropoffAddress: string;

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
    });

    const { pickupAddress, dropoffAddress } = schema.validateSync(reqBody);

    this.pickupAddress = pickupAddress;
    this.dropoffAddress = dropoffAddress;
  }
}

export type RideState = 'Searching' | 'Cancelled';

export type RideResponse = {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  state: RideState;
};
