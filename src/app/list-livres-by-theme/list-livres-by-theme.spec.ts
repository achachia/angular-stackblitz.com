import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLivresByTheme } from './list-livres-by-theme';

describe('ListLivresByTheme', () => {
  let component: ListLivresByTheme;
  let fixture: ComponentFixture<ListLivresByTheme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLivresByTheme]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListLivresByTheme);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
