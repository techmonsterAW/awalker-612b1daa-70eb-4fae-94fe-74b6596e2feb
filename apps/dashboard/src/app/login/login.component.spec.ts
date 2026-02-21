import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error on invalid credentials', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 401, error: { message: 'Invalid credentials' } })));
    component.form.setValue({ email: 'a@b.com', password: 'wrong' });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'wrong' });
    fixture.detectChanges();
    expect(component.error).toBe('Invalid credentials');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect and store token on valid login', () => {
    authService.login.and.returnValue(of({ accessToken: 'token', user: { id: '1', email: 'a@b.com', role: 'admin', organizationId: 'o1' } }));
    component.form.setValue({ email: 'admin@example.com', password: 'password123' });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });
});
