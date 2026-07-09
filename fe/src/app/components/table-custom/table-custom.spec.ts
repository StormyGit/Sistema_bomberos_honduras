import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCustomComponent } from './table-custom';

describe('TableCustom', () => {
  let component: TableCustomComponent;
  let fixture: ComponentFixture<TableCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableCustomComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
