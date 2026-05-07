import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePerformanceAchievementComponent } from './employee-performance-achievement.component';

describe('EmployeePerformanceAchievementComponent', () => {
  let component: EmployeePerformanceAchievementComponent;
  let fixture: ComponentFixture<EmployeePerformanceAchievementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePerformanceAchievementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePerformanceAchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
