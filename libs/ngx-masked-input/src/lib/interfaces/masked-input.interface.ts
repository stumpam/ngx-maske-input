export interface MaskedInputOptions {
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
  emitNumber: boolean;
  startEmpty: boolean;
  formatZip: boolean;
  ignoreEdgeOnBlur: boolean;
}
