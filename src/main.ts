import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { MainContents } from './app/components/main-contents/main-contents';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));


