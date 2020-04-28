import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaskedInputComponent } from './components/masked-input/masked-input.component';

@NgModule({
  imports: [CommonModule],
  declarations: [MaskedInputComponent],
  exports: [MaskedInputComponent],
})
export class NgxMaskedInputModule {}
