import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorisLivres } from './favoris-livres';

describe('FavorisLivres', () => {
  let component: FavorisLivres;
  let fixture: ComponentFixture<FavorisLivres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavorisLivres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavorisLivres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
