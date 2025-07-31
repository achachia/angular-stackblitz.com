import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLectureLivres } from './list-lecture-livres';

describe('ListLectureLivres', () => {
  let component: ListLectureLivres;
  let fixture: ComponentFixture<ListLectureLivres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLectureLivres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLectureLivres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
