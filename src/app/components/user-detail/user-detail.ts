import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user.interface';

declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css'
})
export class UserDetail implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const userIdParam = this.route.snapshot.paramMap.get('id');
    const userId = Number(userIdParam);

    if (!userId || isNaN(userId)) {
      this.error.set('ID de usuario inválido');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error);
        this.loading.set(false);
      }
    });
  }

  getFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`;
  }

  getUserAvatar(user: User): string {
    return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`;
  }

  // Delete confirmation modal
  confirmDelete(): void {
    const modalElement = document.getElementById('deleteUserModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  executeDelete(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.userService.deleteUser(currentUser.id).subscribe({
      next: (response) => {
        // Close modal
        const modalElement = document.getElementById('deleteUserModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }

        // Navigate back to home
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Delete error:', error);
      }
    });
  }
}