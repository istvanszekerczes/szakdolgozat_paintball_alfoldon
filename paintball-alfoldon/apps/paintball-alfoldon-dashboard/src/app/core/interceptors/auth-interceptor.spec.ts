import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BackendCommunicator } from '../services/backend-communicator';
import { AuthStore } from '../store/auth-store';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpTestingController;
  let backendCommunicator: BackendCommunicator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    backendCommunicator = TestBed.inject(BackendCommunicator);
  });

  afterEach(() => http.verify());

  it('sends the token with API calls, but not with the login', () => {
    backendCommunicator.login({ username: 'admin', password: 'titok' }).subscribe();
    const login = http.expectOne((r) => r.url.endsWith('/api/admin/auth/login'));
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({ token: 'jwt', expiresAt: new Date(Date.now() + 60_000).toISOString() });

    TestBed.inject(AuthStore).login('admin', 'titok').subscribe();
    http
      .expectOne((r) => r.url.endsWith('/api/admin/auth/login'))
      .flush({ token: 'jwt', expiresAt: new Date(Date.now() + 60_000).toISOString() });

    backendCommunicator.loadCars().subscribe();
    const cars = http.expectOne((r) => r.url.endsWith('/api/admin/cars'));
    expect(cars.request.headers.get('Authorization')).toBe('Bearer jwt');
    cars.flush([]);
  });
});
