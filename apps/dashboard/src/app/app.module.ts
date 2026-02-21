import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TasksPlaceholderComponent } from './tasks/tasks-placeholder.component';
import { AuditPlaceholderComponent } from './audit/audit-placeholder.component';
import { authGuard, auditGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';

const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TasksPlaceholderComponent, canActivate: [authGuard] },
  { path: 'audit', component: AuditPlaceholderComponent, canActivate: [authGuard, auditGuard] },
  { path: '**', redirectTo: '/tasks' },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    LoginComponent,
    TasksPlaceholderComponent,
    AuditPlaceholderComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
