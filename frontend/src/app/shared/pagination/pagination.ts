import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrls: ['./pagination.css']
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  totalPages = 0;
  pages: (number | null)[] = [];

  ngOnChanges() {
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    this.buildPages();
  }

  buildPages() {
    const total = this.totalPages;
    const cur = this.currentPage;
    const result: (number | null)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) result.push(i);
    } else {
      result.push(1);
      if (cur > 3) result.push(null);
      const from = Math.max(2, cur - 1);
      const to   = Math.min(total - 1, cur + 1);
      for (let i = from; i <= to; i++) result.push(i);
      if (cur < total - 2) result.push(null);
      result.push(total);
    }
    this.pages = result;
  }

  go(page: number | null) {
    if (page === null || page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  get startItem() { return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get endItem()   { return Math.min(this.currentPage * this.pageSize, this.totalItems); }
}
