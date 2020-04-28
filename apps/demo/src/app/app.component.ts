import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MaskedInputOptions } from '@stumpam/ngx-masked-input';

@Component({
  selector: 'ngx-masked-input-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'demo';

  ctrl = new FormControl();

  options1: MaskedInputOptions = [
    { type: 'numeric', value: 0, showZero: true },
    { type: 'static', value: ' Kč', visibleIfEmpty: true },
  ];
  options3: MaskedInputOptions = [{ type: 'numeric' }];
  options2: MaskedInputOptions = [
    {
      type: 'static',
      value: '+42',
      includeInModel: true,
      hideUntouched: true,
    },
    {
      type: 'numeric',
      min: 0,
      max: 1,
      value: 0,
      hideUntouched: true,
    },
    {
      type: 'static',
      value: ' ',
      includeInModel: true,
      hideUntouched: true,
    },
    {
      type: 'numeric',
      min: 1e8,
      max: 999999999,
    },
  ];
}
