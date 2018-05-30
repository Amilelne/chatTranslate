import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../chat.service';
//import * as firebase from "firebase";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../../scss/bootstrap.scss', './home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private chatService: ChatService) { }

  

  ngOnInit() {
    this.chatService.connectServer();
    // var config = {
    //   apiKey: "AIzaSyBdh-Pata8okGIVfKxy3gCFr5MrHWOFwHo",
    //   authDomain: "calendar-8f2cb.firebaseapp.com",
    //   databaseURL: "https://calendar-8f2cb.firebaseio.com",
    //   projectId: "calendar-8f2cb",
    //   storageBucket: "calendar-8f2cb.appspot.com",
    //   messagingSenderId: "379010554325"
    // };
    // firebase.initializeApp(config);
  }

  // login(email: string, password: string){
  //   firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error){
  //     var errorCode = error.code;
  //     console.log(error.message);
  //   })
  // }

  setNickname(nickname: string) {
    if(!nickname){
      nickname = "Anonymous";
    }
    console.log("nickname: "+ nickname);
    this.chatService.setNickname(nickname);
    this.chatService.addUser(nickname);
  }

  

}
