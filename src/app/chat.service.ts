import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class ChatService {

  private nickName;
  private socket;
  private url = 'http://localhost:3000';

  constructor(private http: HttpClient) { }


  setNickname (nickName: string) {
    this.nickName = nickName;
  }

  addUser (nickName: string){
    this.socket.emit('login',{userid:1, username: nickName});
  }

  sendMessage (message: string){
    if(!this.nickName)
      this.nickName = "Anonymous"
    this.socket.emit('message',{username: this.nickName, content: message, translate: null});
    // var msg = {username: this.nickName, content: message, translate: null};
    // return this.http.post(this.url+'/chat',msg);
  }

  getMessage (){
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('message', (message) => {
        observer.next(message);
        console.log(message);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  connectServer() {
    this.socket = io(this.url);
  }
}
