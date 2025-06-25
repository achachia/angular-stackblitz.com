import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListThemesLivres } from './list-themes-livres';

describe('ListThemesLivres', () => {
  let component: ListThemesLivres;
  let fixture: ComponentFixture<ListThemesLivres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListThemesLivres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListThemesLivres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
