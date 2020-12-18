import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HeadbarComponent } from './components/headbar/headbar.component';
import { IndicatorComponent } from './components/indicator/indicator.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MaterialModule } from './library/material.module';
import { PaperComponent } from './components/paper/paper.component';

const components = [IndicatorComponent, LoadingSpinnerComponent, HeadbarComponent, PaperComponent];

@NgModule({
    imports: [CommonModule, MaterialModule],
    exports: [MaterialModule, ...components],
    declarations: [...components]
})
export class UIModule {}
