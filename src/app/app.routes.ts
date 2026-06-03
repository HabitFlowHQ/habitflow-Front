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
import { Pomodoro }   from './features/pomodoro/pages/pomodoro/pomodoro';
import { Schedule }   from './features/schedule/pages/schedule/schedule';
import { ProjectList }   from './features/projects/pages/project-list/project-list';
import { ProjectDetail } from './features/projects/pages/project-detail/project-detail';
import { CreateProject } from './features/projects/pages/create-project/create-project';
import { EditProject }   from './features/projects/pages/edit-project/edit-project';
import { Reports }       from './features/reports/pages/reports/reports';
 
import { Login }    from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { authGuard } from './core/guards/auth.guard';
 
export const routes: Routes = [
 
  { path: 'login',    component: Login    },
  { path: 'register', component: Register },
 
  {
    path: '',
    component: Layout,
    children: [
      { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',       component: Dashboard    },
      
      // Habits Protected
      { path: 'habits',          component: HabitList, canActivate: [authGuard] },
      { path: 'habits/create',   component: CreateHabit, canActivate: [authGuard] },
      { path: 'habits/:id',      component: HabitDetail, canActivate: [authGuard] },
      { path: 'habits/:id/edit', component: EditHabit, canActivate: [authGuard]   },
      
      // Tasks Protected
      { path: 'tasks',           component: TaskList, canActivate: [authGuard] },
      { path: 'tasks/create',    component: CreateTask, canActivate: [authGuard]  },
      { path: 'tasks/:id',       component: TaskDetail, canActivate: [authGuard]  },
      { path: 'tasks/:id/edit',  component: EditTask, canActivate: [authGuard]    },
      
      // Notes Protected
      { path: 'notes',             component: NoteList, canActivate: [authGuard] },
      { path: 'notes/create',      component: CreateNote, canActivate: [authGuard]   },
      { path: 'notes/:id',         component: NoteDetail, canActivate: [authGuard]   },
      { path: 'notes/:id/edit',    component: EditNote, canActivate: [authGuard]     },
      
      { path: 'pomodoro',          component: Pomodoro, canActivate: [authGuard] },
      { path: 'schedule',          component: Schedule, canActivate: [authGuard] },
      
      // Projects Protected
      { path: 'projects',          component: ProjectList, canActivate: [authGuard] },
      { path: 'projects/create',   component: CreateProject, canActivate: [authGuard]  },
      { path: 'projects/:id',      component: ProjectDetail, canActivate: [authGuard]  },
      { path: 'projects/:id/edit', component: EditProject, canActivate: [authGuard]    },
      
      // Reports Protected
      { path: 'reports',           component: Reports, canActivate: [authGuard] },
    ]
  },
 
  { path: '**', redirectTo: 'dashboard' }
 
];
