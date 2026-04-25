import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortageTypesComponent } from './shortage-types.component';

describe('ShortageTypesComponent', () => {
  let component: ShortageTypesComponent;
  let fixture: ComponentFixture<ShortageTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortageTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortageTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
