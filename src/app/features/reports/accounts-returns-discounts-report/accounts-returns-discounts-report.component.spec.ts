import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsReturnsDiscountsReportComponent } from './accounts-returns-discounts-report.component';

describe('AccountsReturnsDiscountsReportComponent', () => {
  let component: AccountsReturnsDiscountsReportComponent;
  let fixture: ComponentFixture<AccountsReturnsDiscountsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsReturnsDiscountsReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsReturnsDiscountsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
