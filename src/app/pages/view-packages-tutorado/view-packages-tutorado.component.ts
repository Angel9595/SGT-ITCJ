import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PackageI } from 'src/app/models/packages';
import { PackagesService } from 'src/app/services/packages.service';
import { UserFirebaseService } from 'src/app/services/user-firebase.service';
import { User } from 'src/app/models/user';
import * as Notiflix from 'notiflix';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view-packages-tutorado',
  templateUrl: './view-packages-tutorado.component.html',
  styleUrls: ['./view-packages-tutorado.component.css']
})
export class ViewPackagesTutoradoComponent implements OnInit {
  packages!: PackageI[];
  searchTerm: string = '';
  panelOpenState = false;
  last: any;
  showKeyInput: { [key: string]: boolean } = {};
  keyAuthorization!: any;
  currentUser!: any;

  constructor(
    private packagesService: PackagesService,
    private router: Router,
    private userFirebaseService: UserFirebaseService
  ) {}

  toggleKeyInput(packageId: string): void {
    const packageItem = this.packages.find((pkg) => pkg.id === packageId);
    if (!this.showKeyInput[packageId] && packageItem && !packageItem.keyAuthorization) {
      Notiflix.Confirm.show(
        'Clave de acceso',
        'Este grupo no contiene ninguna clave de acceso. ¿Deseas continuar?',
        'Sí',
        'No',
        () => {
          if (packageItem) {
            this.saveKey(packageItem);
          }
        },
        () => {}
      );
    } else {
      this.showKeyInput[packageId] = !this.showKeyInput[packageId];
    }
  }

  async saveKey(packageItem: PackageI): Promise<void> {
    if (!packageItem.keyAuthorization || this.keyAuthorization === packageItem.keyAuthorization) {
      Notiflix.Notify.success('Inscrito al grupo');
      // console.log('Inscrito al grupo');

      const tutorado: User = { ...this.currentUser, subscribed: true };

      const updatedPackage = {
        ...packageItem,
        tutoradospkg: packageItem.tutoradospkg
          ? [...packageItem.tutoradospkg, tutorado]
          : [tutorado],
      };

      this.packagesService
        .updatePackage(packageItem.id, updatedPackage as PackageI)
        .subscribe(
          () => {
            // console.log('Paquete actualizado correctamente');
          },
          (error) => {
            // console.error('Error al actualizar el paquete', error);
          }
        );
    } else {
      // console.log('Clave incorrecta');
      Notiflix.Notify.failure('Clave incorrecta. Intente de nuevo.');
    }
  }

  ngOnInit(): void {
    Notiflix.Loading.init({ svgColor: '#FF0000' });
    Notiflix.Loading.standard('Cargando paquetes...');

    this.packagesService.getPackages().subscribe((resp) => {
      this.packages = resp
        .filter((pkg) => pkg.post === true) // Filtra los paquetes con 'post' en true
        .map((pkg) => {
          return { ...pkg, toDelete: false };
        });
        
        this.packages.forEach(pkg => {
          console.log('tutor asignado', pkg.TutorAsignado)
          if (pkg.TutorAsignado) {
            this.userFirebaseService.getTutorById(pkg.TutorAsignado).subscribe(tutorInfo => {
              pkg.infoTutor = tutorInfo;
              console.log(pkg.infoTutor)
            });
          }
        });

      Notiflix.Loading.remove(); // Moved this inside the subscribe callback
    });

    // Obtén la información del usuario actual
    this.userFirebaseService.stateUser().subscribe((user) => {
      if (user) {
        this.userFirebaseService.getDoc<User>('users', user.uid)
          .subscribe(
            (userData) => {
              this.currentUser = userData 
            },
            (error) => {
              // console.error('Error al obtener datos del usuario', error);
            }
          );
      } else {
        // console.error('Usuario no autenticado');
      }
    });
}


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue;
  }

  goToPackage(packageItem: PackageI): void {
    if (this.isSubscribed(packageItem)) {
      this.router.navigate(['/dashboard', packageItem.id]);
    } else {
    Notiflix.Notify.warning('Aún no estás inscrito en este paquete.');
    }
    }
    
    isSubscribed(packageItem: PackageI): boolean {
    if (!packageItem.tutoradospkg || !this.currentUser) {
    return false;
    }
    return packageItem.tutoradospkg.some(
    (tutorado) => tutorado.uid === this.currentUser.uid && tutorado.subscribed
    );
    }
    }