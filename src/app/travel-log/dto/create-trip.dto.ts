export class CreateTripDto {
  title!: string;
  startDate!: string;
  color!: 'vert' | 'azur' | 'bleu' | 'rose' | 'violet' | 'rouge' | 'jaune';
}
