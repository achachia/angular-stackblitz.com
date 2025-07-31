import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListeLivreeLecture } from './view-liste-livree-lecture';

describe('ViewListeLivreeLecture', () => {
  let component: ViewListeLivreeLecture;
  let fixture: ComponentFixture<ViewListeLivreeLecture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewListeLivreeLecture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewListeLivreeLecture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
