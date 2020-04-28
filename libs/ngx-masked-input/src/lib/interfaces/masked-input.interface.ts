export type MaskedInputOptions = MaskedInputOption[];

export type MaskedInputOption =
  | MaskedInputNumericOption
  | MaskedInputStaticOption
  | MaskedInputTextOption;

export interface MaskedInputNumericOption {
  type: 'numeric';
  value?: number;
  float?: boolean;
  floatSeparator?: string;
  precision?: number;
  separateThousands?: boolean;
  separator?: string;
  leadingZero?: number | boolean;
  showZero?: boolean;
  min?: number;
  modifyMin?: number;
  max?: number;
  modifyMax?: number;
  hideUntouched?: boolean;
  updateInvalid?: boolean;
}

export interface MaskedInputTextOption {
  type: 'string';
  value?: string;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  placeholder?: string;
  hideUntouched?: boolean;
}

export interface MaskedInputStaticOption {
  type: 'static';
  value: string;
  visibleIfEmpty?: boolean;
  deletable?: boolean;
  partiallyDelete?: boolean;
  includeInModel?: boolean;
  hideUntouched?: boolean;
}

export type Section = NumericSection | TextSection | StaticSection;

export type NumericSection = Readonly<MaskedInputNumericOption> & SectionData;
export type TextSection = Readonly<MaskedInputTextOption> & SectionData;
export type StaticSection = Readonly<MaskedInputStaticOption> & SectionData;

export type NumericOption = Readonly<MaskedInputNumericOption>;
export type TextOption = Readonly<MaskedInputTextOption>;
export type StaticOption = Readonly<MaskedInputStaticOption>;

export interface SectionData {
  show: string;
  valid: boolean;
  filled: boolean;
  index: number;
}
