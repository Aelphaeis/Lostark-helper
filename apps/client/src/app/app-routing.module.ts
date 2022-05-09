import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "/checklist" },
  { path: "checklist", loadChildren: () => import("./pages/checklist/checklist.module").then(m => m.ChecklistModule) },
  { path: "roster", loadChildren: () => import("./pages/roster/roster.module").then(m => m.RosterModule) },
  { path: "tasks-manager", loadChildren: () => import("./pages/tasks/tasks.module").then(m => m.TasksModule) },
  {
    path: "gold-planner",
    loadChildren: () => import("./pages/gold-planner/gold-planner.module").then(m => m.GoldPlannerModule)
  },
  { path: "friends", loadChildren: () => import("./pages/friends/friends.module").then(m => m.FriendsModule) },
  {
    path: "party-planner",
    loadChildren: () => import("./pages/party-planner/party-planner.module").then(m => m.PartyPlannerModule)
  },
  {
    path: "mari-optimizer",
    loadChildren: () => import("./pages/mari-optimizer/mari-optimizer.module").then(m => m.MariOptimizerModule)
  },
  {
    path: "honing-cost-optimizer",
    loadChildren: () => import("./pages/honing-cost-optimizer/honing-cost-optimizer.module").then(m => m.HoningCostOptimizerModule)
  },
  { path: "settings", loadChildren: () => import("./pages/settings/settings.module").then(m => m.SettingsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
