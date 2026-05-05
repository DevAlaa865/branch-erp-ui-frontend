import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTargetListComponent } from './employee-target-list.component';

describe('EmployeeTargetListComponent', () => {
  let component: EmployeeTargetListComponent;
  let fixture: ComponentFixture<EmployeeTargetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTargetListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTargetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
