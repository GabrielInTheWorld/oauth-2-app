import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IndicatorComponent } from './components/indicator/indicator.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MaterialModule } from './library/material.module';

@NgModule({
  imports: [CommonModule, MaterialModule],
  exports: [MaterialModule, IndicatorComponent, LoadingSpinnerComponent],
  declarations: [IndicatorComponent, LoadingSpinnerComponent]
})
export class UIModule {}
