import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email!:string;
  password!:string;
  registerUser!: FormGroup;
  loading:boolean=false;


  constructor(private afAuth:AngularFireAuth, private fb:FormBuilder,private snackBar:MatSnackBar,private router:Router) {
      this.registerUser = this.fb.group({
      email :['',Validators.required],
      password :['',Validators.required],
      repeatPassword :['',Validators.required],
      })
   }
   register() {
    const email = this.registerUser.value.email;
    const password = this.registerUser.value.password;
    const repeatPassword = this.registerUser.value.repeatPassword;
    if(password!=repeatPassword){
      this.snackBar.open('Contrasena deben coincidir','',{duration:1000})
    }
    else{
      this.snackBar.open('Usuario registrado con exito!!','',{duration:1000})
    }
    this.loading = true;
     this.afAuth.createUserWithEmailAndPassword(email,password).then((user)=>{
      this.loading = false;
      this.router.navigate(['/login'])
      console.log(user)
      this.router
    }).catch((err)=>{
      this.loading = false;
      console.log(err)
    })

    console.log(email,password,repeatPassword);
  }
  login() {
    if(this.email=="admin" && this.password=="admin"){
        this.snackBar.open('Login Successful','',{duration:1000})
    }else{
      this.snackBar.open('Login error','',{duration:1000})
    }



}}
