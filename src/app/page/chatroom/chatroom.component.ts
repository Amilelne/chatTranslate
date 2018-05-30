import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ChatService } from '../../chat.service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['../../../scss/bootstrap.scss','./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {

  @ViewChild('InputMessage') InputMessage: ElementRef;

  public messages = [];
  public connection;
  public message;
  public lang;
  public sendto;
  

  constructor(private chatService: ChatService) {
    this.lang = '自动';
  }

  ngOnInit() {
    var getChat = this.chatService.getChat().subscribe(sendto => {
      this.sendto = sendto;
      console.log("getChat with" + this.sendto);
    });
    this.connection = this.chatService.getMessage().subscribe(message => {
      this.messages.push(message['msg']);
    });
    var getErr = this.chatService.getErr().subscribe(err => {
      console.log(err);
    })
  }

  ngOnDestroy(): void {
    this.connection.unsubscribe();
  }

  sendMessage(message: string) {
    console.log("message: "+message);
    var mes = {content: message, username: this.chatService.nickName}
    this.messages.push(mes);
    //this.chatService.sendMessage(message).subscribe(data => console.log(data));
    this.chatService.sendMessage(message, this.sendto);
    this.message = '';
  }
  changeLanguage(language: string) {
    if(!language){
      language = "zh";
      this.lang = "简体中文";
    }
    if(language == 'en'){
      this.lang = '英语';
    } else if(language == 'zh'){
      this.lang = '简体中文';
    } else if(language == 'jp'){
      this.lang = '日语';
    } else if(language == 'kor'){
      this.lang = '韩语';
    }
    this.chatService.setLanguage(language);
  }

  @HostListener('click')
  public autofocusInput() {
    this.InputMessage.nativeElement.focus();
  }

}
