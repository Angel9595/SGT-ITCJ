import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css']
})
export class DeleteUserComponent implements OnInit {


public mostrarResultados: boolean = false;
public nombre: any;
public correo: any;
public numeroControl: any;
public carrera: any;
public rol: any;

buscarUsuario() {
 //lógica para buscar el usuario,
  this.nombre = "Luis Angel Mendez Hernandez";
  this.correo = "l18110529@itcj.edu.mx";
  this.numeroControl = "181110529";
  this.carrera = "Ingeniería en Sistemas";
  this.rol = "Tutorado";
  this.mostrarResultados = true;
}

  constructor() { }

  ngOnInit(): void {
  }

}
