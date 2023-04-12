import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PackagesService } from 'src/app/services/packages.service';
import * as Notiflix from 'notiflix';
import { PackageI } from 'src/app/models/packages';


@Component({
  selector: 'app-view-packages',
  templateUrl: './view-packages.component.html',
  styleUrls: ['./view-packages.component.css']
})
export class ViewPackagesComponent implements OnInit {
  packages!: PackageI[]; // Utiliza el tipo Package[] en lugar de any
  searchTerm: string = '';
  panelOpenState = false;
  last:any;
  pkg!:any;
  deleteModeActive: boolean = false;


  toggleDeleteMode(): void {
    this.deleteModeActive = !this.deleteModeActive;
  }

  togglePackageToDelete(pkg: PackageI, event: MouseEvent): void {
    if (this.deleteModeActive) {
      pkg.toDelete = !pkg.toDelete;
      this.deletePackage(pkg);
    }
  }
  

  constructor(private packagesService: PackagesService, private router: Router) { }

  ngOnInit(): void {
    // Mostrar el loader rojo
    Notiflix.Loading.init({ svgColor: '#FF0000' });
    Notiflix.Loading.standard('Cargando paquetes...');
  
    this.packagesService.getPackages().subscribe(resp => {
      this.packages = resp.map(pkg => {
        return { ...pkg, toDelete: false }; // Inicializa la propiedad toDelete a false para cada objeto en el array
      });
      console.log('Respuesta', this.packages);
    
      // Ocultar el loader una vez que se hayan cargado los datos
      Notiflix.Loading.remove();
    });
  }
  

    deletePackage(pkg: PackageI): void {
    if (pkg.toDelete) {
      this.packagesService.deletePackage(pkg.id).subscribe(() => {
        const index = this.packages.indexOf(pkg);
        this.packages.splice(index, 1);
        Notiflix.Notify.success('Paquete eliminado exitosamente.');
      }, error => {
        console.log(error)
        Notiflix.Notify.failure('Error al eliminar el paquete.');
      });
    }
  }


  
}