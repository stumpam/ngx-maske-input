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

  ctrl = new FormControl(null, {updateOn: 'blur'});

  options1: Partial<MaskedInputOptions> = {
    type: 'numeric',
    suffix: 'Kč',
    min: 1,
  };

  constructor() {
    this.ctrl.valueChanges.subscribe(console.log);
  }
}
