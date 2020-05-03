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
// Except type are all fields optional
options: DateInputOptions = {
  // For now just for numeric inputs!
  type: 'numeric';
  // Prefix string
  prefix: string;
  // Whether it will place a space between prefix and number
  appendPrefix: boolean;
  // Suffix string
  suffix: string;
  // Whether it will place a space between suffix and number
  prependSuffix: boolean;
  // Whether it should separate thousands
  separateThousands: boolean;
  // Thousands separator, default <space>
  separator: string;
  // Minimum number
  min: number;
  // Maximum number
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
<ngx-masked-input [formControl]="formControl" [options]="to.dateOptions" [attributes]="attributes"></ngx-masked-input>
```

> ⚠ Caution
>
> Attributes are bound just once on ngOnIput hook. Changes are matter of future improvements.
