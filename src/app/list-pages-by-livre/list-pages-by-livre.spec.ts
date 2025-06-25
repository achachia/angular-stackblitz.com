import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPagesByLivre } from './list-pages-by-livre';

describe('ListPagesByLivre', () => {
  let component: ListPagesByLivre;
  let fixture: ComponentFixture<ListPagesByLivre>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPagesByLivre]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPagesByLivre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
