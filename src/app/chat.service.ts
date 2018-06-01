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
  private sendto;
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

  sendMessage (message: string, sendto){
    if(!this.nickName)
      this.nickName = "Anonymous";
    if(!this.language)
      this.language = "zh";
    this.socket.emit('message',{sendto: sendto, username: this.nickName, userid: this.id, content: message, translate: null, to: this.language, from: false});
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
        var len = matchList.length;
        if(len > 1){
          var msgInfo = {content: '匹配中...', info: true, from: false};
          observer.next(msgInfo);
          match = true;
        }else{
          var msgInfo = {content: '当前服务器只有您一位空闲用户,请等待...', info: true, from: false};
          observer.next(msgInfo);
          console.log("当前服务器只有您一位空闲空户...");
        }
      });
      this.socket.on('getChat', function(data, nameList){
        console.log("get data:"+JSON.stringify(data)+",get nameList:"+JSON.stringify(nameList));
        if(data.p1 == userid){
          this.sendto = data.p2;
        }else if(data.p2 == userid){
          this.sendto = data.p1;
        }
        console.log("this.sendto="+this.sendto+",userid="+userid);
        this.chatName = nameList[this.sendto];
        if(this.sendto){
          var infoMes = '匹配到用户'+this.chatName;
          var msgInfo = {content: '匹配到用户'+this.chatName, info: true, from: false};
          observer.next(msgInfo);
          var msgFrom = {chatName: nameList[this.sendto], sendto: this.sendto, info: false, from: true};
          observer.next(msgFrom);
        }
      });
    })
    return observable;
  }

  getMessage (){
    let observable = new Observable(observer => {
      //this.socket = io(this.url);
      this.socket.on('getMsg', (message) => {
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

  leave(){
    this.socket.disconnect();
  }

  connectServer() {
    this.socket = io(this.url);
  }
}
