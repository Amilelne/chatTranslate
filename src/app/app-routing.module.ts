import { MatchComponent } from './page/match/match.component';
import { ChatroomComponent } from './page/chatroom/chatroom.component';
import { HomeComponent } from './page/home/home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'chatroom', component: ChatroomComponent},
  {path: 'match', component: MatchComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
