import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PackagesService } from 'src/app/services/packages.service';
import * as Notiflix from 'notiflix';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FichaTecnica } from 'src/app/models/ficha-tecnica';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FichaTecnicaDialogComponent } from '../ficha-tecnica-dialog/ficha-tecnica-dialog.component';
import { UserFirebaseService } from 'src/app/services/user-firebase.service';
import { FichaTecnicaService } from 'src/app/services/tab-identifiation-tutored.service';
import { interviewTutoredI } from 'src/app/models/interview-tutored';
import { InterviewDialogComponent } from '../interview-dialog/interview-dialog.component';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-package-tutor',
  templateUrl: './package-tutor.component.html',
  styleUrls: ['./package-tutor.component.css']
})
export class PackageTutorComponent implements OnInit {
  
  paquetesAsignados: any[] = [];
  panelOpenState = false;
  last: any;
  subjectsAndSchedules: any[] = [];
  editandoClave = false;
  publicados: { [packageId: string]: boolean } = {};
  tutoradospkg = [];
  fichatecnicauserId!:string;
  interviewuserId!:string;
  selectedUserUid!: string;
  selectedFichaTecnica: FichaTecnica | null = null;
  temporaryKeys: { [packageId: string]: string } = {};
  loadingPackages: boolean = true; 
  infotutor:any
  infoficha:any
  infointerview:any

   subscription4!: Subscription;
   subscription3!: Subscription;
  


  saveKeyAuthorizationedit(paquete: any) {
    this.temporaryKeys[paquete.id] = paquete.keyAuthorization; 
    this.editandoClave = true; 
  }
  

  constructor(private firestore: AngularFirestore,
              private packagesService: PackagesService,
              private afAuth: AngularFireAuth,
              private dialog: MatDialog,
              private userfirebaseservice: UserFirebaseService,
              private fichatecnicaservice:FichaTecnicaService
              ) { }

  ngOnInit(): void {

    Notiflix.Loading.standard('Cargando paquetes...');

 // Inicializa Notiflix
 Notiflix.Notify.init({
  width: '50%',
  position: 'center-center',
  fontSize: '1em',
  borderRadius: '5px',
});

this.packagesService.getPackages().subscribe(
  () => {
      Notiflix.Loading.remove();
      this.loadingPackages = false;
  }
);


this.afAuth.authState.subscribe(user => {
  if (user) {
    const uid = user.uid;
    this.obtenerPaqueteAsignado(uid);
  } else {
    // console.error('No hay un usuario en sesión.');
  }
});
  }

  obtenerPaqueteAsignado(uid: string): void {
    // console.log('UID:', uid);
    this.firestore.collection('packages', ref => ref.where('TutorAsignado', '==', uid)).valueChanges().subscribe(data => {
      // console.log('Data:', data);
      if (data.length > 0) {
        this.paquetesAsignados = data;
        // console.log('pkg asignados',this.paquetesAsignados);
        this.paquetesAsignados.forEach(paquete => {
          // console.log(paquete.TutorAsignado)
          this.userfirebaseservice.getTutorById(paquete.TutorAsignado).subscribe(tutorInfo =>{
            this.infotutor = tutorInfo
          })
          this.publicados[paquete.id] = paquete.post;
        });
      } else {
        // console.log('No se encontró paquete asignado.');
      }
    });
  }


  togglePublicarPaquete(packageId: string): void {
    const paquete = this.paquetesAsignados.find(p => p.id === packageId);
    const postActual = paquete.post;

    if (postActual) {
      Notiflix.Confirm.show(
        'Advertencia',
        'El paquete se despublicara y los que esten suscriptos no podran verlo y perderan los datos. ¿Desea continuar?',
        'Sí',
        'No',
        () => {
          this.publicarPaqueteConfirmado(packageId, !postActual);
        },
        () => {}
      );
    } else {
      if (!paquete.keyAuthorization) {
        Notiflix.Confirm.show(
          'Confirmación',
          'El paquete no tiene clave de autorización, lo que significa que cualquier persona puede ingresar. ¿continuar?',
          'Sí',
          'No',
          () => {
            this.publicarPaqueteConfirmado(packageId, !postActual);
          },
          () => {}
        );
      } else {
        this.publicarPaqueteConfirmado(packageId, !postActual);
      }
    }
  }
  
  

  publicarPaqueteConfirmado(packageId: string, post: boolean): void {
    const updatedData: any = {
      post: post
    };
    this.packagesService.updatePackage(packageId, updatedData).subscribe(
      () => {
        // console.log('Paquete actualizado correctamente');
        this.publicados[packageId] = post;
        if (post) {
          Notiflix.Notify.success(`El paquete se publicó exitosamente`, {
            timeout: 2000
          });
        } else {
          Notiflix.Notify.warning('El paquete ya no está publicado', {
            timeout: 2000
          });
        }
      },
      (error) => {
        // console.error('Error actualizando el paquete:', error);
      }
    );
  }

  saveKeyAuthorization(paquete: any): void {
    const updatedData: any = {
      ...paquete,
      keyAuthorization: this.temporaryKeys[paquete.id]
    };
    this.packagesService.updatePackage(paquete.id, updatedData).subscribe(() => {
      // console.log('KeyAuthorization actualizada con éxito');
      this.editandoClave = false;
      Notiflix.Notify.success('Clave guardada con exito');
    }, error => {
      // console.error('Error al actualizar KeyAuthorization', error);
    });
  }

  async generateReport(tutorado: any): Promise<void> {
    const doc = new jsPDF('p', 'pt', 'letter');
    let finalY: number = 90 + 20; 
    const logo = new Image();

    logo.src = 'assets/img/itcj-img-report.png'; 
    doc.addImage(logo, 'PNG', 400, 10, 170, 33);
  

    doc.setFontSize(24);
    doc.text('Reporte de Calificaciones', 40, 60);
    doc.setLineWidth(1.5);
    doc.line(40, 70, 555, 70); 

    const studentInfo = [
      { title: 'Alumno', data: tutorado.name },
      { title: 'Número de control', data: tutorado.Ncontrol },
    ];
  
    // console.log('Alumno',tutorado.name,  'Número de control',tutorado.Ncontrol)
    // console.log('studentinfo',studentInfo)
  
    doc.autoTable({
      startY: 90,
      headStyles: { fillColor: [0, 0, 0] },
      bodyStyles: { fillColor: [255, 255, 255] },
      head: [['', 'Información Alumno']],
      body: studentInfo.map((info) => [info.title, info.data]),
      columnStyles: { 0: { cellWidth: '40%', halign: 'center' } },
      willDrawCell: (data: any) => {
        if (data.section === 'body' && data.row.index === studentInfo.length - 1) {
          finalY = data.cell.y + data.cell.height;
        }
      },
    });
    
  

    const gradesData = tutorado.grades && tutorado.grades.length > 0 ? tutorado.grades : [{ subject: 'Sin calificaciones', grade: '' }];
    // console.log(gradesData)
  
    doc.autoTable({
      startY: finalY + 20, 
      headStyles: { fillColor: [0, 0, 0] },
      bodyStyles: { fillColor: [255, 255, 255] },
      head: [['Materias', 'Calificaciones']],
      body: gradesData.map((grade: any) => [grade.subject,grade.grade]),
      columnStyles: { 0: { cellWidth: '60%', halign: 'center' } },
    });
  
    doc.save(`${tutorado.Ncontrol}-${tutorado.name}_reporte-calificaciones.pdf`);
  }

  async generateGeneralReport(paquete: any): Promise<void> {
    const doc = new jsPDF('p', 'pt', 'letter');
    let finalY: number = 90 + 20;

    const logo = new Image();

    logo.src = 'assets/img/itcj-img-report.png'; 
    doc.addImage(logo, 'PNG', 400, 10, 170, 33);
  
    doc.setFontSize(24);
    doc.text('Reporte Grupal de Calificaciones', 40, 60);
    doc.setLineWidth(1.5);
    doc.line(40, 70, 555, 70); 
  
    for (const tutorado of paquete.tutoradospkg) {
      const studentInfo = [
        { title: 'Alumno', data: tutorado.name },
        { title: 'Número de control', data: tutorado.Ncontrol },
      ];
  
      doc.autoTable({
        startY: finalY,
        headStyles: { fillColor: [0, 0, 0] },
        bodyStyles: { fillColor: [255, 255, 255] },
        head: [['', 'Información Alumno']],
        body: studentInfo.map((info) => [info.title, info.data]),
        columnStyles: { 0: { cellWidth: '40%', halign: 'center' } },
        willDrawCell: (data: any) => {
          if (data.section === 'body' && data.row.index === studentInfo.length - 1) {
            finalY = data.cell.y + data.cell.height;
          }
        },
      });
  
      const gradesData = tutorado.grades && tutorado.grades.length > 0 ? tutorado.grades : [{ subject: 'Sin calificaciones', grade: '' }];
  
      doc.autoTable({
        startY: finalY + 20,
        headStyles: { fillColor: [0, 0, 0] },
        bodyStyles: { fillColor: [255, 255, 255] },
        head: [['Materias', 'Calificaciones']],
        body: gradesData.map((grade: any) => [grade.subject, grade.grade]),
        columnStyles: { 0: { cellWidth: '60%', halign: 'center' } },
        willDrawCell: (data: any) => {
          if (data.section === 'body' && data.row.index === gradesData.length - 1) {
            finalY = data.cell.y + data.cell.height;
          }
        },
      });
      finalY += 40;
    }
    doc.save(`Reporte_Grupal_${paquete.nombrePaquete}.pdf`);
  }
  
  private subscription1!: Subscription;
  private subscription2!: Subscription;
   
  
  

  getFichaTecnica(uid: string): void {
    this.subscription1 = this.firestore.collection('users').doc(uid).get().subscribe((doc) => {
      if (doc.exists) {
        const data = doc.data() as any;
        if (data.fichaTecnica) {
          this.fichatecnicauserId = data.fichaTecnica;
  
          this.subscription2 = this.fichatecnicaservice.getFichaTecnica(this.fichatecnicauserId).subscribe(fichaTecnicaInfo => {
            this.infoficha = fichaTecnicaInfo;
            const dialogRef = this.openFichaTecnicaDialog(this.infoficha);
            this.selectedFichaTecnica = this.infoficha;
  
            dialogRef.afterClosed().subscribe(() => {
              if (this.subscription2) {
                this.subscription2.unsubscribe();
              }
            });
          });
        } else {
          Notiflix.Notify.failure('Esta ventana no se puede mostrar porque el alumno no ha registrado sus datos socioeconómicos.');
        }
      } else {
        console.log('No se encontró la ficha técnica del usuario.');
      }
    });
  }
  

  openFichaTecnicaDialog(fichaTecnica: FichaTecnica): MatDialogRef<FichaTecnicaDialogComponent, any> {
    const dialogRef = this.dialog.open(FichaTecnicaDialogComponent, {
      width: '80%',
      data: fichaTecnica
    });
    return dialogRef;
  }
  


  getinterviews(uid: string): void {
    
    this.subscription4 = this.firestore.collection('users').doc(uid).get().subscribe((doc) => {
      if (doc.exists) {
        const data = doc.data() as any;
        if (data.interview) {
          this.interviewuserId = data.interview;
  
          this.subscription3 = this.fichatecnicaservice.getInterviews(this.interviewuserId).subscribe(interviewInfo => {
            this.infointerview = interviewInfo;
            const dialogRef = this.openinterviewdialog(this.infointerview);
            this.selectedFichaTecnica = this.infointerview;
  
            dialogRef.afterClosed().subscribe(() => {
              if (this.subscription3) {
                this.subscription3.unsubscribe();
              }
            });
          });
        } else {
          Notiflix.Notify.failure('Esta ventana no se puede mostrar porque el alumno no ha registrado sus datos socioeconómicos.');
        }
      } else {
        console.log('No se encontró la entrevista técnica del usuario.');
      }
    });
  }
  
  openinterviewdialog(interview: interviewTutoredI): MatDialogRef<InterviewDialogComponent, any> {
    const dialogRef = this.dialog.open(InterviewDialogComponent, {
      width: '80%',
      data: interview
    });
    return dialogRef;
  }
  

}