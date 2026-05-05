import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTargetChartComponent } from './employee-target-chart.component';

describe('EmployeeTargetChartComponent', () => {
  let component: EmployeeTargetChartComponent;
  let fixture: ComponentFixture<EmployeeTargetChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTargetChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTargetChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
