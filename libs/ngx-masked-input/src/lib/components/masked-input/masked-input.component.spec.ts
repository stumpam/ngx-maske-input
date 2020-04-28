import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

import { MaskedInputComponent } from './masked-input.component';

describe('MaskedInputComponent with number', () => {
  let spectator: Spectator<MaskedInputComponent>;
  const createComponent = createComponentFactory(MaskedInputComponent);

  beforeEach(
    () =>
      (spectator = createComponent({
        props: {
          options: {
            type: 'numeric',
          },
        },
      })),
  );

  it('should have add a suffix to number', () => {
    spectator.setInput({ options: { suffix: 'Kč' } });
    const input = spectator.query('input');
    spectator.typeInElement('150', input);
    expect(input).toHaveValue('150 Kč');
  });

  it('should set to zero if input if empty or invalid number', () => {
    spectator.setInput({ options: { suffix: 'Kč' } });
    const input = spectator.query('input');

    spectator.typeInElement('', input);
    expect(input).toHaveValue('0 Kč');

    spectator.typeInElement('.', input);
    expect(input).toHaveValue('0 Kč');
  });

  it('should get from input just numbers in numeric mode', () => {
    spectator.setInput({ options: { suffix: 'Kč' } });
    const input = spectator.query('input');

    spectator.typeInElement('abc', input);
    expect(input).toHaveValue('0 Kč');

    spectator.typeInElement('15.5', input);
    expect(input).toHaveValue('155 Kč');
  });

  it('should have add a suffix to number without space', () => {
    spectator.setInput({ options: { suffix: 'Kč', prependSuffix: false } });
    const input = spectator.query('input');
    spectator.typeInElement('150', input);
    expect(input).toHaveValue('150Kč');
  });

  it('should have add a prefix to number', () => {
    spectator.setInput({ options: { prefix: '$' } });
    const input = spectator.query('input');
    spectator.typeInElement('150', input);
    expect(input).toHaveValue('$ 150');
  });

  it('should have add a prefix to number without space', () => {
    spectator.setInput({ options: { appendPrefix: false, prefix: '$' } });
    const input = spectator.query('input');
    spectator.typeInElement('150', input);
    expect(input).toHaveValue('$150');
  });

  it('should ignore incorrect chars in pure numeric mode', () => {
    spectator.setInput({ options: { appendPrefix: false, prefix: '$' } });
    const input = spectator.query('input');

    spectator.typeInElement('150', input);
    expect(input).toHaveValue('$150');

    spectator.typeInElement('15h0', input);
    expect(input).toHaveValue('$150');

    spectator.typeInElement('$150', input);
    expect(input).toHaveValue('$150');

    spectator.typeInElement('', input);
    expect(input).toHaveValue('$0');

    spectator.typeInElement('$150.0', input);
    expect(input).toHaveValue('$1 500');

    spectator.typeInElement('$150,0', input);
    expect(input).toHaveValue('$1 500');

    spectator.setInput({ options: { appendPrefix: true, prefix: '$' } });

    spectator.typeInElement('$150', input);
    expect(input).toHaveValue('$ 150');
  });

  it('should separate thousands if desired', () => {
    spectator.setInput({ options: { prependSuffix: true, suffix: 'Kč' } });
    const input = spectator.query('input');

    spectator.typeInElement('1500', input);
    expect(input).toHaveValue('1 500 Kč');

    spectator.typeInElement('1500000', input);
    expect(input).toHaveValue('1 500 000 Kč');

    spectator.typeInElement('150000', input);
    expect(input).toHaveValue('150 000 Kč');

    spectator.typeInElement('150 000 K', input);
    expect(input).toHaveValue('150 000 Kč');

    spectator.typeInElement('150 ', input);
    expect(input).toHaveValue('150 Kč');
  });
});

// describe('MaskedInputComponent with phone number', () => {
//   let spectator: Spectator<MaskedInputComponent>;
//   const createComponent = createComponentFactory(MaskedInputComponent);

//   beforeEach(
//     () =>
//       (spectator = createComponent({
//         props: { options: { type: 'numeric' } },
//       })),
//   );

//   it('should have a success class by default', () => {
//     const input = spectator.query('input');
//     spectator.typeInElement('150', input);
//     expect(input).toHaveValue('150');
//   });
// });
