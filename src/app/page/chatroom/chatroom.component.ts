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
  public chatName;
  private restart;
  private status;
  

  constructor(private chatService: ChatService) {
    this.lang = '无';
    this.restart = false;
    this.status = '离开';
  }

  ngOnInit() {
    var getChat = this.chatService.getChat().subscribe(msgFrom => {
      if(msgFrom['info']){
        this.messages.push(msgFrom);
      }else{
        this.sendto = msgFrom['sendto'];
        this.chatName = '正在与'+msgFrom['chatName']+'聊天...'
        console.log("getChat with" + this.sendto);
      } 
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
    var mes = {content: message, username: this.chatService.nickName, from: true,info:false}
    this.messages.push(mes);
    //this.chatService.sendMessage(message).subscribe(data => console.log(data));
    this.chatService.sendMessage(message, this.sendto);
    this.message = '';
  }
  leave(){
    var mes = {content:'您已经断开了连线', from:false, info:true};
    this.messages.push(mes);
    this.chatService.sendMessage('对方已经断开了连线', this.sendto);
    this.restart = true;
    this.status = '重新开始';
    this.messages.push()
    this.chatService.leave();
  }
  renew(){
    this.restart = false;
    this.status = '离开';
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
    } else if(language == 'no'){
      this.lang = '无';
    }
    this.chatService.setLanguage(language);
  }

  @HostListener('click')
  public autofocusInput() {
    this.InputMessage.nativeElement.focus();
  }

}
