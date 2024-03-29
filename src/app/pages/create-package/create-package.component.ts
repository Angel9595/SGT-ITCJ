import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserTutorI } from 'src/app/models/user-tutor-i';
import { UserFirebaseService } from 'src/app/services/user-firebase.service';
import { PackagesService } from 'src/app/services/packages.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Notiflix from 'notiflix';


@Component({
  selector: 'app-create-package',
  templateUrl: './create-package.component.html',
  styleUrls: ['./create-package.component.css']
})
export class CreatePackageComponent implements OnInit {

  newPackage!: FormGroup;
  tutorControl!: any;
  packageName!: any;
  dataTutor!: string;
  nameTutor!: string;
  users: UserTutorI[] = [];
  existingPackages: string[] = [];
  tutorAsignado: string | null = null;
  subject!: string;
  schedule!: string;
  subjectsAndSchedules!: FormGroup;
  hours: string[] = [];
  career!: string; 
  selectedHours: string[] = [];


  constructor(private packagesservice: PackagesService,
    private userfirebaseservice: UserFirebaseService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder) {
      this.subjectsAndSchedules = this.fb.group({
        inputs: this.fb.array([])
      });

      for (let i = 7; i <= 22; i++) {
        this.hours.push(`${i < 10 ? '0' + i : i}:00`);}
  }

  dataSource = new MatTableDataSource<UserTutorI>([]);
  displayedColumns: string[] = ['name', 'email', 'acciones'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.newPackage = new FormGroup({
      namePackage: new FormControl('', Validators.required),
      career: new FormControl('', Validators.required),
      tutor: new FormControl('', Validators.required),
    });

    this.userfirebaseservice.getTutorUsers().subscribe(users => {
      // console.log('Usuarios en la BD', users)
      this.dataSource = new MatTableDataSource<any>(users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    this.packagesservice.getPackages().subscribe(packages => {
      this.existingPackages = packages.map((p: { nombrePaquete: any; }) => p.nombrePaquete);
    });
    

    this.aaddInputs(5); // Agrega esta línea para inicializar el FormArray con 3 grupos
  }

  onHourSelected(hour: string) {
    this.selectedHours.push(hour);
  }
  

  get inputControls(): FormArray {
    return this.subjectsAndSchedules.get('inputs') as FormArray;
  }

  get totalSubjects() {
    return this.inputControls.length;
  }

  addMore() {
    // Agregamos 3 inputs más cada vez que se presione el botón
    this.aaddInputs(1);
  }

  ngAfterViewInit() { }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: UserTutorI, filter: string) =>
      data.name.toLowerCase().includes(filter) ||
      data.email.toLowerCase().includes(filter);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  aaddInputs(count: number) {
    const inputsArray = this.subjectsAndSchedules.get('inputs') as FormArray;

    for (let i = 0; i < count; i++) {
      inputsArray.push(
        this.fb.group({
          subject: '',
          schedule: '',
          teacher: ''
        })
      );
    }
  }

  seleccionarTutor(user: UserTutorI) {
    this.tutorControl = this.newPackage.get('tutor');
    if (this.tutorControl) {
      this.tutorControl.setValue(user.uid); // solo guardamos el ID
  
      this.dataTutor = this.tutorControl.value;
      this.nameTutor = user.name; // obtenemos directamente el nombre del usuario
  
      this.snackBar.open(`Tutor Seleccionado: ${this.nameTutor}`, 'Cerrar', { duration: 3000 });
    }
  }

  savePackageName() {
  this.packageName = this.newPackage.get('namePackage')?.value;
  }

  savePackageCareer() {
    this.career = this.newPackage.get('career')?.value;
  }
    
  
  savePackage() {
  const packageName = this.newPackage.get('namePackage')?.value.toUpperCase();
  const career = this.newPackage.get('career')?.value;

  if (this.existingPackages.map(pkg => pkg.toUpperCase()).includes(packageName)) {
    this.snackBar.open(`Ya existe un paquete con el nombre ${packageName}`, 'Cerrar', { duration: 3000 });
    return; // Detener la ejecución si el paquete ya existe
  }
  
  Notiflix.Loading.init({ svgColor: 'red' });
  Notiflix.Loading.pulse('Creando paquete...');
  
  const inputs = this.subjectsAndSchedules.get('inputs')?.value;


  const data = {
    nombrePaquete: packageName,
    TutorAsignado: this.dataTutor, 
    NombreCarrera: career,
    subjectsAndSchedules: inputs
  };

  this.packagesservice.createPackage(data)
  .then((packageId) => { // asumo que el método createPackage devuelve el ID del paquete creado
    if (packageId) {
      // Ahora actualizamos el tutor con el ID del paquete
      this.packagesservice.updateTutorWithPackageId(this.dataTutor, packageId).subscribe(() => {
        Notiflix.Loading.remove();
        this.snackBar.open(`El Paquete : ${packageName} se creó exitosamente`, 'Cerrar', { duration: 2000 });
        setTimeout(() => {
          location.reload(); 
        }, 2000);
      }, error => {
        Notiflix.Loading.remove();
        this.snackBar.open('Error al actualizar el tutor', 'Cerrar', { duration: 3000 });
      });
    }
  })
  .catch(() => {
    Notiflix.Loading.remove();
    this.snackBar.open('Error al crear el paquete', 'Cerrar', { duration: 3000 });
  });
}



}