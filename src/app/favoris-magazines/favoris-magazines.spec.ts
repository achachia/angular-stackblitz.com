import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorisMagazines } from './favoris-magazines';

describe('FavorisMagazines', () => {
  let component: FavorisMagazines;
  let fixture: ComponentFixture<FavorisMagazines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavorisMagazines]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavorisMagazines);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
