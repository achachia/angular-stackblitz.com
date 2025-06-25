import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListThemesMagazine } from './list-themes-magazine';

describe('ListThemesMagazine', () => {
  let component: ListThemesMagazine;
  let fixture: ComponentFixture<ListThemesMagazine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListThemesMagazine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListThemesMagazine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
