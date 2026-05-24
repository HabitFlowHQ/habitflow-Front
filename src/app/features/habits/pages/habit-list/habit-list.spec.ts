import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitList } from './habit-list';

describe('HabitList', () => {
  let component: HabitList;
  let fixture: ComponentFixture<HabitList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitList],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
