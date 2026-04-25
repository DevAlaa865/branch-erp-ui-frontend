import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule ],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss']
})
export class CustomSelectComponent {

  @Input() label: string = '';
  @Input() items: any[] = [];
  @Input() bindLabel: string = 'label';
  @Input() bindValue: string = 'value';
  @Input() placeholder: string = 'الرجاء الاختيار';
  @Input() control!: FormControl<any>;
  @Input() iconClass: string = 'fa fa-store text-blue-500 text-base';
  @Input() errorMessage: string = 'هذا الحقل مطلوب';
  @Input() searchable: boolean = true;
  @Input() clearable: boolean = false;
  @Input() dropdownPosition: 'bottom' | 'top' | 'auto' = 'bottom';
  @Input() multiple: boolean = false;
  @Input() closeOnSelect: boolean = true;

  isOpen = false;
  searchTerm = '';

  get filteredItems() {
    if (!this.searchable || !this.searchTerm.trim()) return this.items;
    return this.items.filter(item =>
      item[this.bindLabel]?.toString().includes(this.searchTerm)
    );
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectItem(item: any) {
    if (this.multiple) {
      const current = this.control.value || [];
      const exists = current.includes(item[this.bindValue]);

      if (exists) {
        this.control.setValue(current.filter((v: any) => v !== item[this.bindValue]));
      } else {
        this.control.setValue([...current, item[this.bindValue]]);
      }
    } else {
      this.control.setValue(item[this.bindValue]);
      if (this.closeOnSelect) this.isOpen = false;
    }
  }

  isSelected(item: any) {
    if (this.multiple) {
      return (this.control.value || []).includes(item[this.bindValue]);
    }
    return this.control.value === item[this.bindValue];
  }
}
