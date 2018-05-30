import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodmatchComponent } from './moodmatch.component';

describe('MoodmatchComponent', () => {
  let component: MoodmatchComponent;
  let fixture: ComponentFixture<MoodmatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodmatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodmatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
