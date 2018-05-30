import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class ChatService {

  public nickName;
  public socket;
  public language;
  private id;
  public toward;
  public chatName;
  private url = 'http://localhost:3000';

  constructor(private http: HttpClient) { 
    this.connectServer();
  }


  setNickname (nickName: string) {
    this.nickName = nickName;
  }

  setLanguage (language: string) {
    this.language = language;
  }

  addUser (nickName: string){
    this.id = new Date().getTime()+""+Math.floor(Math.random()*899+100);
    this.socket.emit('login',{userid: this.id, username: nickName});
    console.log("userid:"+this.id);
  }

  sendMessage (message: string){
    if(!this.nickName)
      this.nickName = "Anonymous";
    if(!this.language)
      this.language = "zh";
    this.socket.emit('message',{username: this.nickName, userid: this.id, content: message, translate: null, to: this.language, toward: this.toward});
    // var msg = {username: this.nickName, content: message, translate: null};
    // return this.http.post(this.url+'/chat',msg);
  }

  getChat() {
    this.socket.emit('quickMatch',{username: this.nickName, userid: this.id});
    var userid = this.id;
    let observable = new Observable(observer => {
      //this.socket = io(this.url);
      var match = false;
      this.socket.on('onlineCount', function(matchList){
        console.log("get onlineCount msg");
        var len = matchList.length;
        if(len > 1){
          console.log("匹配中");
          match = true;
          console.log("match="+match);
        }else{
          console.log("当前服务器只有您一位空闲空户...");
        }
      });
      this.socket.on('getChat', function(data, nameList){
        console.log("get data:"+JSON.stringify(data)+",get nameList:"+JSON.stringify(nameList));
        console.log("this.toward="+this.id+",userid="+userid);
        if(data.p1 == userid){
          this.toward = data.p2;
          console.log("equal p1");
        }else if(data.p2 == userid){
          this.toward = data.p1;
          console.log("equal p2");
        }
        this.chatName = nameList[this.toward];
        if(this.toward){
          console.log("与"+this.chatName+"聊天中...");
          observer.next(this.chatName);
        }
      });
    })
    return observable;
  }

  getMessage (){
    let observable = new Observable(observer => {
      //this.socket = io(this.url);
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

  getErr() {
    let observable = new Observable(observer => {
      //this.socket = io(this.url);
      this.socket.on('err', (err) => {
        observer.next(err);
        console.log(err);
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
