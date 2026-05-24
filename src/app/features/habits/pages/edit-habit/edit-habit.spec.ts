import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHabit } from './edit-habit';

describe('EditHabit', () => {
  let component: EditHabit;
  let fixture: ComponentFixture<EditHabit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHabit],
    }).compileComponents();

    fixture = TestBed.createComponent(EditHabit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
