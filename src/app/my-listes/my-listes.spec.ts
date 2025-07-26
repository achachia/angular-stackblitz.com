import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyListes } from './my-listes';

describe('MyListes', () => {
  let component: MyListes;
  let fixture: ComponentFixture<MyListes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyListes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyListes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
