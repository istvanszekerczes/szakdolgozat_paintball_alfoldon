import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from '../../../../app.routes';
import { serverRoutes } from '../../../../app.routes.server';
import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('links to the home page and to booking', async () => {
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('nem található');
    expect(el.querySelector('a[href="/"]')).toBeTruthy();
    expect(el.querySelector('a[href="/foglalas"]')).toBeTruthy();
    expect(TestBed.inject(Title).getTitle()).toContain('nem található');
  });

  it('keeps search engines away only while it is shown', async () => {
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="robots"')?.content).toBe('noindex');

    fixture.destroy();
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});

describe('unknown URLs', () => {
  it('render the 404 page instead of redirecting home', () => {
    const fallback = routes.at(-1)!;
    expect(fallback.path).toBe('**');
    expect(fallback.redirectTo).toBeUndefined();
    expect(fallback.loadComponent).toBeDefined();
  });

  it('answer with status 404 on the server', () => {
    const fallback = serverRoutes.at(-1)!;
    expect(fallback.path).toBe('**');
    expect('status' in fallback && fallback.status).toBe(404);
  });

  it('are the only routes rendered on demand: every real page is prerendered', () => {
    const pages = routes.filter((r) => r.path !== '**').map((r) => r.path);
    const prerendered = serverRoutes.slice(0, -1).map((r) => r.path);
    expect(prerendered.sort()).toEqual([...pages].sort());
  });
});
