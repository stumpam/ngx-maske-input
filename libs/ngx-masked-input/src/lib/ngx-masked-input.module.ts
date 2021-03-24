import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaskedInputDirective } from './directives/masked-input/masked-input.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [MaskedInputDirective],
  exports: [MaskedInputDirective],
})
export class NgxMaskedInputModule {}
