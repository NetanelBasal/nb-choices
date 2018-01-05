import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChoicesComponent, CustomChoiceComponent, CustomChoiceSelectedComponent} from "./components";

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ChoicesComponent,
    CustomChoiceComponent,
    CustomChoiceSelectedComponent
  ],
  entryComponents: [CustomChoiceComponent, CustomChoiceSelectedComponent],
  exports: [ChoicesComponent]
})
export class NbChoicesModule {
}
