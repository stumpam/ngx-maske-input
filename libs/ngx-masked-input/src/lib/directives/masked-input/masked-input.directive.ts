import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MaskedInputOptions } from '../../interfaces/masked-input.interface';

const MASKED_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MaskedInputDirective),
  multi: true,
};

@Directive({
  selector: '[ngxMaskedInput]',
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '(blur)': 'onBlur()',
    '(input)': 'onInput($event.target.value)',
    '(click)': 'onClick($event.target.value)',
    '(keydown)': 'onKeyDown($event)',
  },
  providers: [MASKED_VALUE_ACCESSOR],
})
export class MaskedInputDirective implements ControlValueAccessor {
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

    if (this._options.formatZip) {
      this._options.min = 1e4;
      this._options.max = 79999;
    }

    if (/\d/.test(this._options.prefix) || /\d/.test(this._options.suffix)) {
      this.numericAdditionals = true;
    }
  }

  @Output() blurred = new EventEmitter();

  numericAdditionals = false;
  previousValue = '';

  _options: Partial<MaskedInputOptions> = {
    type: 'numeric',
    prependSuffix: true,
    appendPrefix: true,
    float: false,
    floatSeparator: ',',
    precision: 2,
    separateThousands: true,
    separator: ' ',
    emitNumber: true,
  };

  disabled = false;
  touchedFn: any = null;
  changeFn: any = null;
  private first = true;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    private readonly field: ElementRef<HTMLInputElement>,
  ) {}

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

  onNumericInput(value: string | number | null) {
    if (!value && value !== 0) return;

    let updated = value.toString();

    if (this.first) {
      this.first = false;
      if (!updated && this._options.startEmpty) return;
    }

    if (this.numericAdditionals) {
      updated = this.removeAdditionals(updated);
    } else {
      if (!this._options.float) {
        updated = updated.replace(/\D/g, '');

        if (this._options.max) {
          const maxLng = this._options.max.toString().length;

          if (updated.length > maxLng) {
            updated = updated.slice(0, maxLng);
          }
        }
      }
    }

    if (!updated && !this._options.enableEmpty) {
      updated = '0';
    }

    if (!this._options.leadingZero) {
      updated = updated.replace(/\b0+/g, '');
    }

    if (this._options.separateThousands) {
      updated = [...updated]
        .reverse()
        .map((d, i) => (i % 3 === 0 ? d + this._options.separator : d))
        .reverse()
        .join('')
        .trim();
    } else if (this._options.formatZip) {
      updated =
        updated.length > 3
          ? `${updated.slice(0, 3)} ${updated.slice(3)}`
          : updated;
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
    if (!value) return;

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

  onBlur() {
    if (
      this._options.min &&
      +this.field.nativeElement.value.replace(/\D/g, '') < this._options.min
    ) {
      this.onInput(this._options.min.toString());
    }

    if (
      this._options.max &&
      +this.field.nativeElement.value.replace(/\D/g, '') > this._options.max
    ) {
      this.onInput(this._options.max.toString());
    }

    this.touchedFn?.();
  }

  updateValue(value: string) {
    this.previousValue = value;
    this.renderer.setProperty(this.field.nativeElement, 'value', value);

    if (this._options.suffix) {
      this.checkRange(value);
    }

    const newValue = this._options.emitNumber
      ? value.replace(/\D/g, '')
      : value;

    this.changeFn?.(newValue);
  }
}
