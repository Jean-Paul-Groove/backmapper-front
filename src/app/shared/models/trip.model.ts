import { Step } from './step.model';

export class Trip {
  id!: number;
  title!: string;
  startDate!: string;
  steps!: Step[];
  color!: 'vert' | 'azur' | 'bleu' | 'rose' | 'violet' | 'rouge' | 'jaune';
}
