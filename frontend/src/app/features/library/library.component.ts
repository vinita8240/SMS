import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { Book, BookCategory, BookIssue, Student } from '../../core/models/models';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ModalComponent,
    ConfirmDialogComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit {
  private api = inject(ApiService);
  private notify = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'books' | 'issues' | 'categories' = 'books';
  loadingBooks = signal<boolean>(true);
  loadingIssues = signal<boolean>(true);

  books = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  issues = signal<BookIssue[]>([]);
  categories = signal<BookCategory[]>([]);
  students = signal<Student[]>([]);

  bookSearchTerm = '';
  selectedCatId = '';

  isBookModalOpen = false;
  isIssueModalOpen = false;
  isCategoryModalOpen = false;
  isDeleteBookOpen = false;
  isDeleteCatOpen = false;
  isSubmitting = false;

  editingBook: Book | null = null;
  selectedBook: Book | null = null;
  editingCategory: BookCategory | null = null;
  selectedCat: BookCategory | null = null;

  bookForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    category_id: ['', Validators.required],
    isbn: [''],
    publisher: [''],
    edition: [''],
    copies: [1, [Validators.required, Validators.min(1)]],
    price: [0],
    rack_number: [''],
    description: ['']
  });

  issueForm: FormGroup = this.fb.group({
    book_id: ['', Validators.required],
    student_id: ['', Validators.required],
    issue_date: [new Date().toISOString().substring(0, 10), Validators.required],
    due_date: [new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10), Validators.required]
  });

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.loadBooks();
    this.loadCategories();
    this.loadIssues();
    this.loadStudents();
  }

  canManage(): boolean {
    const role = this.auth.currentUser()?.role;
    return role === 'admin' || role === 'librarian';
  }

  switchTab(tab: 'books' | 'issues' | 'categories') {
    this.activeTab = tab;
  }

  loadBooks() {
    this.loadingBooks.set(true);
    this.api.get<Book[]>('/library/books').subscribe({
      next: (res) => {
        const data = res.data || [];
        this.books.set(data);
        this.applyBookFilters();
        this.loadingBooks.set(false);
      },
      error: () => this.loadingBooks.set(false)
    });
  }

  loadIssues() {
    this.loadingIssues.set(true);
    this.api.get<BookIssue[]>('/library/issues').subscribe({
      next: (res) => {
        this.issues.set(res.data || []);
        this.loadingIssues.set(false);
      },
      error: () => this.loadingIssues.set(false)
    });
  }

  loadCategories() {
    this.api.get<BookCategory[]>('/library/categories').subscribe({
      next: (res) => this.categories.set(res.data || [])
    });
  }

  loadStudents() {
    this.api.get<Student[]>('/students', { limit: 200 }).subscribe({
      next: (res) => this.students.set(res.data || [])
    });
  }

  applyBookFilters() {
    let list = [...this.books()];
    if (this.bookSearchTerm.trim()) {
      const q = this.bookSearchTerm.toLowerCase();
      list = list.filter(b => 
        (b.name && b.name.toLowerCase().includes(q)) ||
        ((b as any).title && (b as any).title.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }
    if (this.selectedCatId) {
      list = list.filter(b => (b.book_category_id || (b as any).category_id) == this.selectedCatId);
    }
    this.filteredBooks.set(list);
  }

  onSearchBook(e: any) {
    this.bookSearchTerm = e.target.value;
    this.applyBookFilters();
  }

  onCategorySelect(e: any) {
    this.selectedCatId = e.target.value;
    this.applyBookFilters();
  }

  openAddBookModal() {
    this.editingBook = null;
    const cats = this.categories();
    this.bookForm.reset({
      title: '',
      author: '',
      category_id: cats[0]?.book_category_id || (cats[0] as any)?.id || '',
      isbn: '',
      publisher: '',
      edition: '',
      copies: 1,
      price: 0,
      rack_number: '',
      description: ''
    });
    this.isBookModalOpen = true;
  }

  openEditBookModal(b: Book) {
    this.editingBook = b;
    this.bookForm.patchValue({
      title: b.name || (b as any).title,
      author: b.author,
      category_id: b.book_category_id || (b as any).category_id,
      isbn: b.isbn || '',
      publisher: b.publisher || '',
      edition: b.edition || '',
      copies: b.quantity || (b as any).total_copies || (b as any).copies || 1,
      price: b.price || 0,
      rack_number: b.rack_number || '',
      description: b.description || ''
    });
    this.isBookModalOpen = true;
  }

  saveBook() {
    if (this.bookForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.bookForm.value;

    if (this.editingBook) {
      const id = this.editingBook.book_id || (this.editingBook as any).id;
      this.api.put(`/library/books/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Book updated');
          this.isSubmitting = false;
          this.isBookModalOpen = false;
          this.loadBooks();
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to update book');
          this.isSubmitting = false;
        }
      });
    } else {
      this.api.post('/library/books', payload).subscribe({
        next: () => {
          this.notify.success('Book added to catalog');
          this.isSubmitting = false;
          this.isBookModalOpen = false;
          this.loadBooks();
        },
        error: (err) => {
          this.notify.error(err.error?.message || 'Failed to add book');
          this.isSubmitting = false;
        }
      });
    }
  }

  confirmDeleteBook(b: Book) {
    this.selectedBook = b;
    this.isDeleteBookOpen = true;
  }

  deleteBook() {
    if (!this.selectedBook) return;
    const id = this.selectedBook.book_id || (this.selectedBook as any).id;
    this.api.delete(`/library/books/${id}`).subscribe({
      next: () => {
        this.notify.success('Book removed');
        this.isDeleteBookOpen = false;
        this.loadBooks();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to delete book');
        this.isDeleteBookOpen = false;
      }
    });
  }

  openIssueModal() {
    this.issueForm.reset({
      book_id: '',
      student_id: '',
      issue_date: new Date().toISOString().substring(0, 10),
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10)
    });
    this.isIssueModalOpen = true;
  }

  saveIssue() {
    if (this.issueForm.invalid) return;
    this.isSubmitting = true;
    this.api.post('/library/issues', this.issueForm.value).subscribe({
      next: () => {
        this.notify.success('Book issued successfully');
        this.isSubmitting = false;
        this.isIssueModalOpen = false;
        this.loadIssues();
        this.loadBooks();
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to issue book');
        this.isSubmitting = false;
      }
    });
  }

  returnBook(issue: BookIssue) {
    const id = issue.issue_id || (issue as any).id;
    this.api.post(`/library/issues/${id}/return`, {
      return_date: new Date().toISOString().substring(0, 10)
    }).subscribe({
      next: () => {
        this.notify.success('Book marked as returned');
        this.loadIssues();
        this.loadBooks();
      },
      error: (err) => this.notify.error(err.error?.message || 'Failed to process return')
    });
  }

  openAddCategoryModal() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.isCategoryModalOpen = true;
  }

  openEditCategoryModal(cat: BookCategory) {
    this.editingCategory = cat;
    this.categoryForm.patchValue({
      name: cat.name,
      description: cat.description || ''
    });
    this.isCategoryModalOpen = true;
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;
    this.isSubmitting = true;
    const payload = this.categoryForm.value;

    if (this.editingCategory) {
      const id = this.editingCategory.book_category_id || (this.editingCategory as any).id;
      this.api.put(`/library/categories/${id}`, payload).subscribe({
        next: () => {
          this.notify.success('Category updated');
          this.isSubmitting = false;
          this.isCategoryModalOpen = false;
          this.loadCategories();
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.api.post('/library/categories', payload).subscribe({
        next: () => {
          this.notify.success('Category added');
          this.isSubmitting = false;
          this.isCategoryModalOpen = false;
          this.loadCategories();
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  confirmDeleteCat(cat: BookCategory) {
    this.selectedCat = cat;
    this.isDeleteCatOpen = true;
  }

  deleteCategory() {
    if (!this.selectedCat) return;
    const id = this.selectedCat.book_category_id || (this.selectedCat as any).id;
    this.api.delete(`/library/categories/${id}`).subscribe({
      next: () => {
        this.notify.success('Category removed');
        this.isDeleteCatOpen = false;
        this.loadCategories();
      },
      error: () => this.isDeleteCatOpen = false
    });
  }
}
