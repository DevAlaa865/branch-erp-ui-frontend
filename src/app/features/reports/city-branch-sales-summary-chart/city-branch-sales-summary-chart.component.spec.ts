import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityBranchSalesSummaryChartComponent } from './city-branch-sales-summary-chart.component';

describe('CityBranchSalesSummaryChartComponent', () => {
  let component: CityBranchSalesSummaryChartComponent;
  let fixture: ComponentFixture<CityBranchSalesSummaryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityBranchSalesSummaryChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityBranchSalesSummaryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
