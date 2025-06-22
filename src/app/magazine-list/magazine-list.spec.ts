import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagazineList } from './magazine-list';

describe('MagazineList', () => {
  let component: MagazineList;
  let fixture: ComponentFixture<MagazineList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagazineList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagazineList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
