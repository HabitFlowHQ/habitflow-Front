import { Routes } from '@angular/router';

// -Habit Page
import { HabitList }   from './features/habits/pages/habit-list/habit-list';
import { HabitDetail } from './features/habits/pages/habit-detail/habit-detail';
import { CreateHabit } from './features/habits/pages/create-habit/create-habit';
import { EditHabit }   from './features/habits/pages/edit-habit/edit-habit';

// -Task Page
import { TaskList }   from './features/tasks/pages/task-list/task-list';
import { TaskDetail } from './features/tasks/pages/task-detail/task-detail';
import { CreateTask } from './features/tasks/pages/create-task/create-task';
import { EditTask }   from './features/tasks/pages/edit-task/edit-task';

export const routes: Routes = [

  {path: '', redirectTo: 'habits', pathMatch: 'full'},

  // -Habit Routes

  {path : 'habits',component : HabitList}


  {path : 'habits/create', component : CreateHabit},

  {path: 'habits/:id',         component: HabitDetail },

  {path: 'habits/:id/edit',    component: EditHabit   },

  // -Task Routes

  { path: 'tasks',              component: TaskList    },
  { path: 'tasks/create',       component: CreateTask  },
  { path: 'tasks/:id',          component: TaskDetail  },
  { path: 'tasks/:id/edit',     component: EditTask    },


  //
  // { path: '**', redirectTo: '' }


];
