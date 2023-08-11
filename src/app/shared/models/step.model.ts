export class Step {
  id!: number;
  title!: string;
  coordinates!: [longitude: number, latitude: number];
  description?: string;
  pitcures?: string[];
  date!: string;
}
