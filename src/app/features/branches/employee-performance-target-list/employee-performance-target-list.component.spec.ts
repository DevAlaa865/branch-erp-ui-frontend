import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformanceTargetListComponent } from './employee-performance-target-list.component';

describe('EmployeePerformanceTargetListComponent', () => {
  let component: EmployeePerformanceTargetListComponent;
  let fixture: ComponentFixture<EmployeePerformanceTargetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePerformanceTargetListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePerformanceTargetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
