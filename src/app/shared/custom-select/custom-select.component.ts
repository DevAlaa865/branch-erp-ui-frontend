import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss']
})
export class CustomSelectComponent {

  @Input() label: string = '';
  @Input() items: any[] = [];
  @Input() bindLabel: string = 'label';
  @Input() bindValue: string = 'value';
  @Input() placeholder: string = 'الرجاء الاختيار';
  @Input() control!: AbstractControl  | null ;
  @Input() iconClass: string = 'fa fa-store text-blue-500 text-base';
  @Input() errorMessage: string = 'هذا الحقل مطلوب';
  @Input() searchable: boolean = true;
  @Input() clearable: boolean = false;
  @Input() dropdownPosition: 'bottom' | 'top' | 'auto' = 'bottom';
  @Input() multiple: boolean = false;
  @Input() closeOnSelect: boolean = true;
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<any>();


  isOpen = false;
  searchTerm = '';

  // ✅ الحل هنا
  get selectedLabel(): string {
    if (!this.control?.value) return this.placeholder;

    if (this.multiple) {
      const selectedItems = this.items.filter(item =>
        (this.control?.value || []).includes(item[this.bindValue])
      );
      return selectedItems.map(i => i[this.bindLabel]).join(', ') || this.placeholder;
    }

    const found = this.items.find(i => i[this.bindValue] === this.control?.value);
    return found ? found[this.bindLabel] : this.placeholder;
  }

  get filteredItems() {
    if (!this.searchable || !this.searchTerm.trim()) return this.items;
    return this.items.filter(item =>
      item[this.bindLabel]?.toString().includes(this.searchTerm)
    );
  }

toggleDropdown() {
  if (this.disabled) return;   // 👈 يمنع الفتح
  this.isOpen = !this.isOpen;
}


 selectItem(item: any) {
  if (this.multiple) {
    const current = this.control?.value || [];
    const exists = current.includes(item[this.bindValue]);

    if (exists) {
      this.control?.setValue(current.filter((v: any) => v !== item[this.bindValue]));
    } else {
      this.control?.setValue([...current, item[this.bindValue]]);
    }
  } else {
    this.control?.setValue(item[this.bindValue]);
    if (this.closeOnSelect) this.isOpen = false;
  }

  // 🔹 بعد تحديث القيمة نبعث الحدث للأب
  this.selectionChange.emit(this.control?.value);
}


  isSelected(item: any) {
    if (this.multiple) {
      return (this.control?.value || []).includes(item[this.bindValue]);
    }
    return this.control?.value === item[this.bindValue];
  }
}