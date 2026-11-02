import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactFormComponent } from './contact-form.component';

describe('ContactFormComponent', () => {
  let fixture: ComponentFixture<ContactFormComponent>;
  let form: ContactFormComponent['form'];

  beforeEach(async () => {
    fixture = TestBed.createComponent(ContactFormComponent);
    form = fixture.componentInstance.form;
    await fixture.whenStable();
  });

  it('refuses phone text without enough digits', async () => {
    form.controls.phone.setValue('abc');
    form.controls.phone.markAsTouched();
    fixture.componentRef.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(form.controls.phone.valid).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Érvénytelen telefonszám.');

    form.controls.phone.setValue('+36 30 123 4567');
    expect(form.controls.phone.valid).toBe(true);
  });

  it('refuses spaces as a name', () => {
    form.controls.name.setValue('   ');
    expect(form.controls.name.valid).toBe(false);
    form.controls.name.setValue('Teszt Elek');
    expect(form.controls.name.valid).toBe(true);
  });
});
