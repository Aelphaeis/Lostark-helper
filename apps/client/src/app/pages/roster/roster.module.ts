import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RosterComponent} from './roster/roster.component';
import {RouterModule} from "@angular/router";
import {NzListModule} from "ng-zorro-antd/list";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzPopconfirmModule} from "ng-zorro-antd/popconfirm";
import {IconsProviderModule} from "../../icons-provider.module";
import {NzInputNumberModule} from "ng-zorro-antd/input-number";

const routes = [{
  path: '',
  component: RosterComponent
}]

@NgModule({
  declarations: [RosterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzListModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzPopconfirmModule,
    IconsProviderModule,
    NzInputNumberModule,
    FormsModule
  ],
})
export class RosterModule {
}
