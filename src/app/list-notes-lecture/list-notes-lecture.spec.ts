import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNotesLecture } from './list-notes-lecture';

describe('ListNotesLecture', () => {
  let component: ListNotesLecture;
  let fixture: ComponentFixture<ListNotesLecture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListNotesLecture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListNotesLecture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
