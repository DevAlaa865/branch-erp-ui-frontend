import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetChartComponent } from './target-chart.component';

describe('TargetChartComponent', () => {
  let component: TargetChartComponent;
  let fixture: ComponentFixture<TargetChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
