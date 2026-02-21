import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task } from '@taskmgmt/data';

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
}
