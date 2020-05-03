# NgxMaskedInput

Angular Date masked input for now just for numbers. It can handle string prefixes and suffixes;


## Quick Start

1. Import NgxMaskedInputModule to your project.

```typescript
import { NgxMaskedInputModule } from '@stumpam/ngx-masked-input';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxMaskedInputModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

2. Use in HTML template

```typescript
<ngx-masked-input [formControl]="ctrl" [options]="options"></ngx-masked-input>
```

3. Set up in parent component

```typescript
options: DateInputOptions = {
  // For now just for numeric inputs!
  type: 'numeric';
  prefix: string;
  appendPrefix: boolean;
  suffix: string;
  prependSuffix: boolean;
  float: boolean;
  floatSeparator: string;
  precision: number;
  separateThousands: boolean;
  separator: string;
  leadingZero: boolean;
  enableEmpty: boolean;
  min: number;
  max: number;
};
```

### Works with [formly](https://formly.dev)

If you want to add attributes directly to input element make custom Formly field and initialize it on `ngOnInit`

```typescript
ngOnInit() {
    this.attributes = {
      id: this.id,
      ...this.to.attributes,
    };
  }
```

and use it in the template

```HTML
<ngx-date-input [formControl]="formControl" [options]="to.dateOptions" [attributes]="attributes"></ngx-date-input>
```

> ⚠ Caution
>
> Attributes are bound just once on ngOnIput hook. Changes are matter of future improvements.
