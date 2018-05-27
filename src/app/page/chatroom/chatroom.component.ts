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
  

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.connection = this.chatService.getMessage().subscribe(message => {
      this.messages.push(message);
    })
  }

  ngOnDestroy(): void {
    this.connection.unsubscribe();
  }

  sendMessage(message: string) {
    console.log("message: "+message);
    //this.chatService.sendMessage(message).subscribe(data => console.log(data));
    this.chatService.sendMessage(message);
    this.message = '';
  }
  translate(messageObject) {
    //this.chatService.translateMessage(messageObject.content);
  }

  @HostListener('click')
  public autofocusInput() {
    this.InputMessage.nativeElement.focus();
  }

}
