import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TasksPlaceholderComponent } from './tasks-placeholder.component';
import { AuthService } from '../auth/auth.service';
import { TaskService } from './task.service';
import { Role } from '@taskmgmt/data';

describe('TasksPlaceholderComponent', () => {
  let component: TasksPlaceholderComponent;
  let fixture: ComponentFixture<TasksPlaceholderComponent>;
  let authService: { currentUser: { id: string; email: string; role: Role; organizationId: string } | null };
  let taskService: { loadTasks: jasmine.Spy; getTasks: jasmine.Spy };

  const viewerUser = { id: '1', email: 'v@b.com', role: Role.Viewer, organizationId: 'o1' };
  const adminUser = { id: '2', email: 'a@b.com', role: Role.Admin, organizationId: 'o1' };

  beforeEach(async () => {
    authService = {
      currentUser: adminUser,
      get canViewAudit() {
        const r = this.currentUser?.role;
        return r === Role.Admin || r === Role.Owner;
      },
    };
    const loadTasksSpy = jasmine.createSpy('loadTasks').and.returnValue(of([]));
    const getTasksSpy = jasmine.createSpy('getTasks').and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [TasksPlaceholderComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: TaskService, useValue: { loadTasks: loadTasksSpy, getTasks: getTasksSpy } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as any;
    fixture = TestBed.createComponent(TasksPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show loading then tasks', () => {
    expect(component.loading).toBe(false);
    expect(taskService.loadTasks).toHaveBeenCalled();
  });

  it('canManageTasks is true for Admin', () => {
    expect(component.canManageTasks).toBe(true);
  });

  it('canManageTasks is false for Viewer', () => {
    authService.currentUser = viewerUser;
    fixture = TestBed.createComponent(TasksPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.canManageTasks).toBe(false);
  });
});
