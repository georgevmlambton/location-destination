import * as yup from 'yup';

export class ProfilePatchRequest {
  name?: string;

  constructor(reqBody: unknown) {
    const schema = yup.object({
      name: yup.string().min(1, 'Name cannot be empty'),
    });

    const { name } = schema.validateSync(reqBody);

    this.name = name;
  }
}

export type ProfileResponse = {
  userId: string;
  name?: string;
};
