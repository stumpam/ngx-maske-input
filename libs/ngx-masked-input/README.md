# NgxMaskedInput

Angular Date masked input directive for now just for numbers. It can handle string prefixes and suffixes;

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
<input ngxMaskedInput [formControl]="ctrl" [options]="options">
```

3. Set up in parent component

```typescript
// Except type are all fields optional
options: MaskedInputOptions = {
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
  // Emit just number without prefix or suffix, default true
  emitNumber: boolean;
  // If true leaves at first input empty, default false
  startEmpty: boolean;
};
```

### Works with [formly](https://formly.dev)
