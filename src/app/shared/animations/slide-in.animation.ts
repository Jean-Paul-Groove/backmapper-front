import { animate, animation, style } from '@angular/animations';

export const slideInAnimation = animation([
  style({
    transform: 'translatex(100%)',
    opacity: 0,
  }),
  animate(
    '200ms ease-out',
    style({
      transform: 'translatex(0)',
      opacity: 1,
    })
  ),
]);
