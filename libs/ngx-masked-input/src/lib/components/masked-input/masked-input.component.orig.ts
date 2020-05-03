import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MaskedInputOptions } from '../../interfaces/masked-input.interface.original';

export const MASKED_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MaskedInputComponent),
  multi: true,
};

@Component({
  selector: 'ngx-masked-input',
  template: '<input #field type="string" [disabled]="disabled">',
  providers: [MASKED_VALUE_ACCESSOR],
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '(input)': 'onInput($event.target.value)',
    '(click)': 'onClick($event.target.value)',
    '(keydown)': 'onKeyDown($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaskedInputComponent implements ControlValueAccessor, OnInit {
  @ViewChild('field', { static: true }) field: ElementRef<HTMLInputElement>;

  @Input() set options(options: Partial<MaskedInputOptions>) {
    if (
      this._options.type &&
      options.type &&
      this._options.type !== options.type
    ) {
      throw new Error('Input type cannot be updated after once is set');
    }

    if (!this._options.type && !options.type) {
      throw new Error('Input type must be defined');
    }

    this._options = {
      ...this._options,
      ...options,
    };

    if (/\d/.test(this._options.prefix) || /\d/.test(this._options.suffix)) {
      this.numericAdditionals = true;
    }
  }

  numericAdditionals = false;
  previousValue = '';

  _options: Partial<MaskedInputOptions> = {
    prependSuffix: true,
    appendPrefix: true,
    float: false,
    floatSeparator: ',',
    precision: 2,
    separateThousands: true,
    separator: ' ',
  };

  disabled = false;
  touchedFn: any = null;
  changeFn: any = null;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    if (!this._options.type) {
      throw new Error('Input type must be defined');
    }
  }

  onInput(value: string) {
    if (this._options.type === 'numeric') {
      this.onNumericInput(value);
    }
  }

  onClick(value: string) {
    if (this._options.type === 'numeric') {
      this.checkRange(value);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (this._options.type === 'numeric') {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        this.checkRange((event.target as HTMLInputElement).value, true);
      }
    }
  }

  onNumericInput(value: string) {
    let updated = value || '';

    if (this.numericAdditionals) {
      updated = this.removeAdditionals(updated);
    } else {
      if (!this._options.float) {
        updated = updated.replace(/\D/g, '');
      }
    }

    if (!updated && !this._options.enableEmpty) {
      updated = '0';
    }

    if (!this._options.leadingZero) {
      updated = parseInt(updated, 10).toString();
    }

    if (this._options.separateThousands) {
      updated = [...updated]
        .reverse()
        .map((d, i) => (i % 3 === 0 ? d + this._options.separator : d))
        .reverse()
        .join('')
        .trim();
    }

    if (this._options.suffix) {
      updated = `${updated}${this._options.prependSuffix ? ' ' : ''}${
        this._options.suffix
      }`;
    }

    if (this._options.prefix) {
      updated = `${this._options.prefix}${
        this._options.appendPrefix ? ' ' : ''
      }${updated}`;
    }

    this.updateValue(updated);
  }

  removeAdditionals(value: string): string {
    let cleaned = value.replace(/\s/g, '');

    if (this._options.prefix) {
      let prefix = [...this._options.prefix];
      while (prefix.length) {
        const [char, ...rest] = prefix;

        if (cleaned[0] === char) {
          cleaned = [...cleaned].splice(1).join('');
        }

        prefix = rest;
      }
    }

    // if (this._options.suffix) {
    //   const suffix = [...this._options.suffix];
    //   while (suffix.length) {
    //     const char = suffix.slice(1);
    //     const rest = suffix.slice(0, -1);

    //     console.log(char, rest);
    //   }
    // }

    return cleaned;
  }

  writeValue(value: string): void {
    this.onInput(value);
  }

  registerOnChange(fn: any): void {
    this.changeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cd.markForCheck();
  }

  checkRange(value: string, key = false) {
    const suffixPosition =
      value.length -
      (this._options.suffix?.length + +this._options.prependSuffix) -
      (key ? 1 : 0);

    const prefixPosition =
      this._options.prefix?.length + +this._options.appendPrefix;

    if (this.field.nativeElement.selectionStart > suffixPosition) {
      this.field.nativeElement.setSelectionRange(
        suffixPosition,
        suffixPosition,
      );
    }

    if (this.field.nativeElement.selectionStart <= prefixPosition) {
      this.field.nativeElement.setSelectionRange(
        prefixPosition + (key ? 1 : 0),
        prefixPosition + (key ? 1 : 0),
      );
    }
  }

  updateValue(value: string) {
    this.previousValue = value;
    this.renderer.setProperty(this.field.nativeElement, 'value', value);
    if (this._options.suffix) {
      this.checkRange(value);
    }
  }
}
