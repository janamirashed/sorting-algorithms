import { Routes } from '@angular/router';
import { Comparison } from './components/comparison/comparison';
import { Visualization } from './components/visualization/visualization';

export const routes: Routes = [
    { path: '', redirectTo: 'comparison', pathMatch: 'full' },
    { path: 'comparison', component: Comparison },
    { path: 'visualization', component: Visualization },
];
