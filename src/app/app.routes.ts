import { Routes } from '@angular/router';
import { MainContents } from './components/main-contents/main-contents';
import { EditComponent } from './components/edit-component/edit-component';
import { AllCasts } from './components/all-casts/all-casts';
import { ShowSeasonsComponent } from './components/show-seasons-component/show-seasons-component';
import { ShowEpisodesComponents } from './components/show-episodes-components/show-episodes-components';
import { AddContentComponent } from './components/add-content-component/add-content-component';


export const routes: Routes = [

    { path: '', component: MainContents },

    { path: 'all-list', component: MainContents },

    { path: 'add-content', component: AddContentComponent },

    { path: 'edit-content/:id', component: EditComponent },

    { path: 'go-seasons/:id', component: ShowSeasonsComponent },

    { path: 'go-episodes/:id', component: ShowEpisodesComponents },

    { path: 'all-casts', component: AllCasts },

];
