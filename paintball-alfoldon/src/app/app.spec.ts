import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand and the primary navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.brand')?.textContent).toContain('Paintball Alföldön');
    expect(el.querySelector('nav[aria-label="Fő navigáció"]')).toBeTruthy();
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content');
  });

  it('lists every venue in the footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.site-footer [data-venue]').length).toBe(7);
  });

  it('keeps the venue menu open when the trigger is clicked after hovering', () => {
    const app = TestBed.createComponent(App).componentInstance;

    app.openVenues();
    app.toggleVenues();
    expect(app.venuesOpen()).toBe(true);

    app.toggleVenues();
    expect(app.venuesOpen()).toBe(false);
  });

  it('toggles the venue menu by keyboard, without a hover', () => {
    const app = TestBed.createComponent(App).componentInstance;

    app.toggleVenues();
    expect(app.venuesOpen()).toBe(true);
    app.toggleVenues();
    expect(app.venuesOpen()).toBe(false);
  });

  it('toggles the mobile menu and closes it with Escape', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;

    app.toggleMenu();
    await fixture.whenStable();
    expect(app.menuOpen()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('#mobile-menu')).toBeTruthy();

    app.onEscape();
    await fixture.whenStable();
    expect(app.menuOpen()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('#mobile-menu')).toBeNull();
  });
});
