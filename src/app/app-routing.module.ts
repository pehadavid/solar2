import { RouterModule, Routes, Router } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { HomeResolver } from './resolvers/home-resolver';
const routes: Routes = [
  { path: '', component: HomeComponent, resolve: {item: HomeResolver}, runGuardsAndResolvers: 'always' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    paramsInheritanceStrategy: 'always'
})],
  exports: [RouterModule],
  providers: [HomeResolver]
})
export class AppRoutingModule { }