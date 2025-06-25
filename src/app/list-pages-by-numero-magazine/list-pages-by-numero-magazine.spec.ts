import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPagesByNumeroMagazine } from './list-pages-by-numero-magazine';

describe('ListPagesByNumeroMagazine', () => {
  let component: ListPagesByNumeroMagazine;
  let fixture: ComponentFixture<ListPagesByNumeroMagazine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPagesByNumeroMagazine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPagesByNumeroMagazine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
