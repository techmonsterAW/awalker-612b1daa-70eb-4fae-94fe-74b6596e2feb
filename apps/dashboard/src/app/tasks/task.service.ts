import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '@taskmgmt/data';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [];

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API}/tasks`).pipe(
      tap((list) => {
        this.tasks = list;
      })
    );
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${API}/tasks`, dto).pipe(
      tap((task) => {
        this.tasks = [...this.tasks, task];
      })
    );
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${API}/tasks/${id}`, dto).pipe(
      tap((updated) => {
        this.tasks = this.tasks.map((t) => (t.id === id ? updated : t));
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/tasks/${id}`).pipe(
      tap(() => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
      })
    );
  }
}
