import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user.interface';

declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private userService = inject(UserService);

  // State management with signals
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  userToDelete = signal<User | null>(null);

  // Pagination state
  currentPage = signal(1);
  usersPerPage = 8; // 4x2 grid as shown in wireframe

  // Computed values
  totalPages = computed(() => Math.ceil(this.users().length / this.usersPerPage));

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.usersPerPage;
    const end = start + this.usersPerPage;
    return this.users().slice(start, end);
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error);
        this.loading.set(false);
        console.error('Error loading users:', error);
      }
    });
  }

  getFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`;
  }

  getUserAvatar(user: User): string {
    return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}${user.last_name}`;
  }

  // Pagination methods
  getPageNumbers(): number[] {
    const totalPagesNum = this.totalPages();
    return Array.from({ length: totalPagesNum }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Delete confirmation modal methods
  confirmDelete(user: User): void {
    this.userToDelete.set(user);
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  executeDelete(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.userService.deleteUser(user.id).subscribe({
      next: (response) => {
        // Close modal
        const modalElement = document.getElementById('deleteModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }

        // Remove user from local state (since API is mock)
        this.users.update(users => users.filter(u => u.id !== user.id));
        this.userToDelete.set(null);
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.userToDelete.set(null);
      }
    });
  }
}