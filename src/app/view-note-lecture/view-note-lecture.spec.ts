import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNoteLecture } from './view-note-lecture';

describe('ViewNoteLecture', () => {
  let component: ViewNoteLecture;
  let fixture: ComponentFixture<ViewNoteLecture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNoteLecture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewNoteLecture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
