import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaskedInputComponent } from './directives/masked-input/masked-input.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [MaskedInputComponent],
  exports: [MaskedInputComponent],
})
export class NgxMaskedInputModule {}
