import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-custom-select',
  standalone:true,
    imports: [ CommonModule, ReactiveFormsModule,  NgSelectModule],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss']
})
export class CustomSelectComponent {

  @Input() label: string = '';
  @Input() items: any[] = [];
  @Input() bindLabel: string = 'label';
  @Input() bindValue: string = 'value';
  @Input() placeholder: string = 'الرجاء الاختيار';
 @Input() control!: FormControl<any> ;
  @Input() iconClass: string = 'fa fa-store text-blue-500 text-base';
  @Input() errorMessage: string = 'هذا الحقل مطلوب';
  @Input() searchable: boolean = true;
  @Input() clearable: boolean = false;
  @Input() dropdownPosition: 'bottom' | 'top' | 'auto' = 'bottom';
 
     // 👇 نضيف دول
  @Input() multiple: boolean = false;
  @Input() closeOnSelect: boolean = true;
}
