import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnsDiscountsManagementComponent } from './returns-discounts-management.component';

describe('ReturnsDiscountsManagementComponent', () => {
  let component: ReturnsDiscountsManagementComponent;
  let fixture: ComponentFixture<ReturnsDiscountsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnsDiscountsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnsDiscountsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
