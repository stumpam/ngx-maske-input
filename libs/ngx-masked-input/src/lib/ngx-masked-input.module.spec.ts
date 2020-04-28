import { async, TestBed } from '@angular/core/testing';
import { NgxMaskedInputModule } from './ngx-masked-input.module';

describe('NgxMaskedInputModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxMaskedInputModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgxMaskedInputModule).toBeDefined();
  });
});
