import { Step } from './step.model';

export class Trip {
  constructor(
    id: number,
    title: string,
    startDate: string,
    steps: Step[],
    color: 'vert' | 'azur' | 'bleu' | 'rose' | 'violet' | 'rouge' | 'jaune'
  ) {
    this.id = id;
    this.title = title;
    this.startDate = startDate;
    this.steps = steps;
    this.color = color;
  }
  id: number;
  title: string;
  startDate: string;
  steps: Step[];
  color: 'vert' | 'azur' | 'bleu' | 'rose' | 'violet' | 'rouge' | 'jaune';
}
