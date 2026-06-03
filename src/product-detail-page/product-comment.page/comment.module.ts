// comment.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommentComponent } from './comment.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    CommentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule    
  ],
  exports: [
    CommentComponent
  
  ]
})
export class CommentModule { }