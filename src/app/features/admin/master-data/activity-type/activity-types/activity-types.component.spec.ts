import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTypesComponent } from './activity-types.component';

describe('ActivityTypesComponent', () => {
  let component: ActivityTypesComponent;
  let fixture: ComponentFixture<ActivityTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
