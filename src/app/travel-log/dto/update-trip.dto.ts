export class UpdateTripDto {
  id!: number;
  title!: string;
  createdDate!: string;
  color!: 'vert' | 'azur' | 'bleu' | 'rose' | 'violet' | 'rouge' | 'jaune';
}
