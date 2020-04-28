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
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';

import {
  MaskedInputOption,
  MaskedInputOptions,
  NumericOption,
  NumericSection,
  Section,
  StaticOption,
  StaticSection,
  TextOption,
  TextSection,
} from '../../interfaces/masked-input.interface';

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
    '(input)': 'onInput($event.data)',
    '(keydown)': 'keyDown($event)',
    '(selectionChange)': 'selectionChange($event)',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaskedInputComponent implements ControlValueAccessor, OnInit {
  @ViewChild('field', { static: true }) field: ElementRef<HTMLInputElement>;

  @Input() set options(options: MaskedInputOptions) {
    if (!options.length) {
      throw new Error('Input options has to be set!');
    }

    this.sections = this.parseOptions(options);

    this.generateOutput();
  }

  sections: Section[] = [];
  active = false;
  previous = '';
  selection = [0, 0];
  tempSelection = [0, 0];
  activeSectionIndex = 0;

  disabled = false;
  touchedFn: any = null;
  changeFn: any = null;

  reverse = false;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    // const composition = merge(
    //   fromEvent(this.field.nativeElement, 'compositionstart').pipe(
    //     mapTo(false),
    //   ),
    //   fromEvent(this.field.nativeElement, 'compositionend').pipe(mapTo(true)),
    // ).pipe(startWith(true));
    // fromEvent(this.field.nativeElement, 'input')
    //   .pipe
    //   // skipUntil(composition)
    //   ()
    //   .subscribe(console.log);
    fromEvent(document, 'selectionchange')
      .pipe(
        // skipUntil(composition),
        map(() => document.getSelection()),
        filter(event => event.focusNode?.contains(this.field.nativeElement)),
        map(() => [
          this.field.nativeElement.selectionStart,
          this.field.nativeElement.selectionEnd,
        ]),
        distinctUntilChanged(
          (prev, curr) => prev[0] === curr[0] && prev[1] === curr[1],
        ),
        tap(console.log),
      )
      .subscribe(selection => (this.selection = selection));
  }

  parseOptions(options: MaskedInputOptions): Section[] {
    const parsers = {
      numeric: this.parseNumericOption.bind(this),
      text: this.parseTextOption.bind(this),
      static: this.parseStaticOption.bind(this),
    };

    return options.map((section: MaskedInputOption, index: number) =>
      parsers[section.type](section, index),
    );
  }

  parseNumericOption(section: NumericOption, index: number): NumericSection {
    if (section.value !== void 0) {
      (section as any).value = this.checkMinMax(section);

      return {
        ...section,
        show: section.value !== void 0 ? section.value.toString() : '',
        valid: !!section.value,
        filled: this.isNumericFilled(section, 'value'),
        index,
      };
    }

    return { ...section, show: '', valid: false, filled: false, index };
  }

  parseTextOption(section: TextOption, index: number): TextSection {
    return {
      ...section,
      show: section.value,
      valid: false,
      filled: false,
      index,
    };
  }

  parseStaticOption(section: StaticOption, index: number): StaticSection {
    return {
      ...section,
      show: section.value,
      valid: true,
      filled: true,
      index,
    };
  }

  checkNumericValidity(section: NumericOption): boolean {
    return (
      section.value &&
      section.value < section.max &&
      section.value > section.min
    );
  }

  isNumericFilled(section: NumericOption, value: 'value' | 'show'): boolean {
    if (section.value < 0) {
      if (section.min) {
        return (
          section.min.toString().length === section[value].toString().length
        );
      }
    } else {
      if (section.max) {
        return (
          section.max.toString().length === section[value].toString().length
        );
      }
    }

    return false;
  }

  onInput(value: string) {
    const sections = this.getSectionsBySelection(!!value);

    sections.forEach(section => this.sectionUpdate(value, section));

    // if (this.selection[0] === this.selection[1]) {
    //   this.appendValue(value);
    //   console.log(this.getSectionsBySelection());
    // }

    this.reverse = false;

    this.generateOutput();
  }

  sectionUpdate(value: string, section: Section) {
    const processors = {
      numeric: this.processNumericSection.bind(this),
      text: this.processTextSection.bind(this),
      static: this.processStaticSection.bind(this),
    };

    if (section.hideUntouched) {
      section = this.getNextNotHidden(section);
    }

    processors[section.type](value, section);
  }

  getNextNotHidden(section: Section) {
    let next = false;

    const found = this.sections.find(s => {
      if (s === section) next = true;

      return next && !s.hideUntouched;
    });

    return found || this.sections[this.sections.length - 1];
  }

  // appendValue(value: string) {
  //   const processors = {
  //     numeric: this.processNumericSection.bind(this),
  //     text: this.processTextSection.bind(this),
  //     static: this.processStaticSection.bind(this),
  //   };

  //   let i = 0;
  //   while (value && i < 100) {
  //     const section = this.sections[i];
  //     if (!section.filled) {
  //       value = processors[section.type](value, section);
  //     }

  //     if (this.sections.length - 1 === i) {
  //       value = '';
  //     }

  //     i++;
  //   }
  // }

  getSelectionInSection(section: Section, value: boolean): [number, number] {
    let selectionStart = this.selection[0];
    let selectionEnd = this.selection[1];
    let length = 0;
    // console.log(this.selection);

    this.sections.find(s => {
      const isDesiredSection = s === section;
      length = s.show.length;

      if (!isDesiredSection) {
        selectionStart = selectionStart - length;
        selectionEnd = selectionEnd - length;
      }

      return isDesiredSection;
    });

    if (selectionStart <= 0) {
      selectionStart = 0;
    }

    if (selectionEnd > length + 1) {
      selectionEnd = length + 1;
    }

    return [selectionStart, selectionEnd];
  }

  getSectionsBySelection(forward: boolean): Section[] {
    let length = 0;
    const modify = forward ? 0 : 1;

    const found = this.sections.filter(section => {
      const condition =
        length <= this.selection[0] - modify &&
        length + section.show.length >= this.selection[1] - modify;

      length = length + section.show.length;
      return condition;
    });

    return found.length ? found : [this.sections[0]];
  }

  processNumericSection(value: string, section: NumericSection) {
    if (Number.isNaN(+value)) return;

    const selection = this.getSelectionInSection(section, value === void 0);

    section.show = this.replaceText(value, section, selection, true);
    const num = !section.show && !section.showZero ? void 0 : +section.show;

    section.filled = this.isNumericFilled(section, 'show');

    section.show = section.filled
      ? this.checkMinMax(section, num).toString()
      : num === void 0
      ? ''
      : num.toString();
  }

  processTextSection(value: string, section: TextSection): string {
    return value;
  }

  processStaticSection(value: string, section: StaticSection): string {
    return value;
  }

  replaceText(
    value: string | null,
    section: Section,
    selection: [number, number],
    checkZero = false,
  ): string {
    let retVal = '';
    let selectionStart = 0;
    let selectionEnd = 0;

    if (value === null) {
      const equal = selection[0] === selection[1];

      retVal =
        section.show.slice(0, selection[0] - (this.reverse ? 0 : 1)) +
        section.show.slice(selection[1] + 1 - (this.reverse ? 0 : 1));

      selectionStart = selection[0] - 1;
      selectionEnd = selectionStart;

      // console.log(selection, selectionStart, selectionEnd);

      // if (selection[0] === selection[1]) {
      //   retVal =
      //     section.show.slice(0, selection[0] - 1 + (this.reverse ? 1 : 0)) +
      //     section.show.slice(selection[1] + (this.reverse ? 1 : 0));
      // } else {
      //   retVal =
      //     section.show.slice(0, selection[0]) +
      //     section.show.slice(selection[1] + 1);
      // }
    } else {
      retVal =
        checkZero && section.show === '0'
          ? value
          : section.show.slice(0, selection[0]) +
            value +
            section.show.slice(selection[1]);

      selectionStart = selection[0] + 1;
      selectionEnd = selectionStart;
    }

    this.setSelection([selectionStart, selectionEnd], section.index);

    return retVal;
  }

  checkMinMax(section: NumericSection, value: number): number;
  checkMinMax(section: NumericOption): number;
  checkMinMax(section: NumericSection, value?: number): number {
    let num = value !== void 0 ? value : +section.value;

    if (num !== void 0 && section.min && num < section.min) {
      if (section.modifyMin) {
        num = section.min;
      } else {
        num = +num.toString().slice(0, section.min.toString().length);
        section.valid = false;
      }
    }

    if (num !== void 0 && section.max && num > section.max) {
      if (section.modifyMax) {
        num = section.max;
      } else {
        num = +num.toString().slice(0, section.max.toString().length);
        section.valid = false;
      }
    }

    return num;
  }

  // onClick(value: string) {
  //   if (this._options.type === 'numeric') {
  //     this.checkRange(value);
  //   }
  // }

  keyDown(event: KeyboardEvent) {
    this.active = true;

    if (event.key === 'Delete') {
      this.reverse = true;
    }

    // console.log(event);
    // if (this._options.type === 'numeric') {
    //   if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    //     this.checkRange((event.target as HTMLInputElement).value, true);
    //   }
    // }
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

  generateOutput() {
    const value = this.sections.reduce(
      (output, section) =>
        output + (section.hideUntouched && !this.active ? '' : section.show),
      '',
    );
    this.updateValue(value);
  }

  setSelection(range: [number, number], index: number) {
    const selection = [0, 0];
    this.sections.find(section => {
      const condition = section.index === index;

      if (section.index < index) {
        const length =
          section.hideUntouched && !this.active ? 0 : section.show.length;

        selection[0] = selection[0] + length;
        selection[1] = selection[1] + length;
      }

      if (condition) {
        selection[0] = selection[0] + range[0];
        selection[1] = selection[1] + range[1];
      }

      return condition;
    });

    this.tempSelection = selection;
    console.log(this.tempSelection);
  }

  updateValue(value: string) {
    this.previous = value;
    this.renderer.setProperty(this.field.nativeElement, 'value', value);

    this.field.nativeElement.setSelectionRange(
      this.tempSelection[0],
      this.tempSelection[1],
    );

    this.selection = this.tempSelection;
  }
}
