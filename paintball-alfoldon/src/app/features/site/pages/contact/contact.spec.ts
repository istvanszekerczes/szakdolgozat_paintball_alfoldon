import { TestBed } from '@angular/core/testing';
import { Contact } from './contact';

describe('Contact', () => {
  it('offers phone and e-mail, and no form that would send nothing', async () => {
    const fixture = TestBed.createComponent(Contact);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('a[href="tel:+36309771486"]')).toBeTruthy();
    expect(el.querySelector('a[href="mailto:paintball@alfoldon.hu"]')).toBeTruthy();
    expect(el.textContent).toContain('06:00–22:00');
    expect(el.querySelector('form')).toBeNull();
  });
});
