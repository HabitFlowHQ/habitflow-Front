
import { Routes } from '@angular/router';
 
import { Layout }     from './shared/components/layout/layout';
import { Dashboard }  from './features/dashboard/pages/dashboard/dashboard';
import { HabitList }  from './features/habits/pages/habit-list/habit-list';
import { HabitDetail } from './features/habits/pages/habit-detail/habit-detail';
import { CreateHabit } from './features/habits/pages/create-habit/create-habit';
import { EditHabit }  from './features/habits/pages/edit-habit/edit-habit';
import { TaskList }   from './features/tasks/pages/task-list/task-list';
import { TaskDetail } from './features/tasks/pages/task-detail/task-detail';
import { CreateTask } from './features/tasks/pages/create-task/create-task';
import { EditTask }   from './features/tasks/pages/edit-task/edit-task';
import { NoteList }   from './features/notes/pages/note-list/note-list';
import { CreateNote } from './features/notes/pages/create-note/create-note';
import { NoteDetail } from './features/notes/pages/note-detail/note-detail';
import { EditNote }   from './features/notes/pages/edit-note/edit-note';
 
import { Login }    from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { authGuard } from './core/guards/auth.guard';
 
export const routes: Routes = [
 
  { path: 'login',    component: Login    },
  { path: 'register', component: Register },
 
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',       component: Dashboard    },
      { path: 'habits',          component: HabitList   },
      { path: 'habits/create',   component: CreateHabit },
      { path: 'habits/:id',      component: HabitDetail },
      { path: 'habits/:id/edit', component: EditHabit   },
      { path: 'tasks',           component: TaskList    },
      { path: 'tasks/create',    component: CreateTask  },
      { path: 'tasks/:id',       component: TaskDetail  },
      { path: 'tasks/:id/edit',  component: EditTask    },
      { path: 'notes',             component: NoteList     },
      { path: 'notes/create',      component: CreateNote   },
      { path: 'notes/:id',         component: NoteDetail   },
      { path: 'notes/:id/edit',    component: EditNote     },
    ]
  },
 
  { path: '**', redirectTo: 'login' }
 
];
