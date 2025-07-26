import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPageListeLecture } from './list-page-liste-lecture';

describe('ListPageListeLecture', () => {
  let component: ListPageListeLecture;
  let fixture: ComponentFixture<ListPageListeLecture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPageListeLecture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPageListeLecture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
