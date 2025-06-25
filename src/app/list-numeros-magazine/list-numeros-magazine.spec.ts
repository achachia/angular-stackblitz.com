import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNumerosMagazine } from './list-numeros-magazine';

describe('ListNumerosMagazine', () => {
  let component: ListNumerosMagazine;
  let fixture: ComponentFixture<ListNumerosMagazine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListNumerosMagazine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListNumerosMagazine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
