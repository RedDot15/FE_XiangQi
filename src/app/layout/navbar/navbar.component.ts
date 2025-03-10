import { Component } from '@angular/core';
import { MENU } from '../../models/navbar.constant';
import { NgClass, NgFor } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgFor,
    NgClass
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menu=MENU;
  constructor(public router:Router){
  }
  onNavigate(path:any){
    this.router.navigate([path])
  }
}
