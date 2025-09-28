import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, map, of } from 'rxjs';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse
} from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://peticiones.online/api/users';
  private usersCache: User[] = [];

  getAllUsers(): Observable<User[]> {
    return this.http.get<PaginatedResponse<User>>(this.apiUrl).pipe(
      map(response => {
        const users = response.results.map(user => ({
          ...user,
          avatar: user.image || user.avatar
        }));
        this.usersCache = users;
        return users;
      }),
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<User> {
    const cachedUser = this.usersCache.find(user => user.id === id);
    if (cachedUser) {
      return of(cachedUser);
    }

    // Load all users first, then find the specific one
    return this.getAllUsers().pipe(
      map(users => {
        const foundUser = users.find(user => user.id === id);
        if (foundUser) {
          return foundUser;
        } else {
          throw new Error('Usuario no encontrado');
        }
      }),
      catchError((error) => {
        return throwError(() => 'Usuario no encontrado');
      })
    );
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('UserService Error:', errorMessage);
    return throwError(() => errorMessage);
  }
}