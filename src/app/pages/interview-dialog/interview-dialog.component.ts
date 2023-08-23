import { Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { interviewTutoredI } from 'src/app/models/interview-tutored';

@Component({
  selector: 'app-interview-dialog',
  templateUrl: './interview-dialog.component.html',
  styleUrls: ['./interview-dialog.component.css']
})
export class InterviewDialogComponent {
  

  
  constructor(
    public dialogRef: MatDialogRef<InterviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public interview: interviewTutoredI,

  ) { }
 

  timestampToMilliseconds(timestamp: any): number {
    return timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
}

printPDF() {
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  // Agrega el título
  pdf.setFontSize(22);
  pdf.text('Entrevista Tutor a Tutorado', 10, 20);

  var yPosition = 30;
  
  yPosition =  this.addSection(pdf, '', yPosition, [
   
   //informacion complementaria
   ['Con quien se siente mas mas ligado afectiva-mente', this.interview.ligadoafectivamente],
   ['Menciona por que te sientes mas ligado afectiva- mente a la persona que mencionaste', this.interview.Descripciondeligadoafectivamente],
   ['Quién se ocupa más directamente de su educación', this.interview.masocupadoeducacion],
   ['Quién ha influido más directamente en su decisión para estudiar esta carrera', this.interview.infuidoencarrera],
   ['Cómo es su relación con los compañeros', this.interview.Relacionconcompañeros],
   ['Menciona por que es tu relación de la forma en relación con los compañeros', this.interview.Descripcionrelacioncompañeros],
   ['Tiene pareja?', this.interview.Tenerpareja],
   ['Tiene pareja?', this.interview.Descripcionrelacion],
   ['Cómo es su relación con sus profesores', this.interview.Relacionconprofesores],
   ['Cómo es tu relación con las autoridades académicas', this.interview.Relacionconautoridadesacademicas],
   ['Qué hace en su tiempo libre', this.interview.tiempolibre],
   ['Cuál es tu actividad recreativa', this.interview.actividadrecreativa],
//CARACTERÍSTICAS PERSONALES (MADUREZ Y EQUILIBRIO)
  ['Auto percepcion', this.interview.comportamientoUsuario],
  //ÁREA PSICO - PEDAGÓGICA
  ['Cómo le gustaría ser', this.interview.Cómotegustaríaser],
  ['Recibes ayuda en tu casa para la realización de tareas escolares?', this.interview.Ayudacontarea],
  ['Qué problemas personales intervienen en tus estudios?', this.interview.intervencionConestudios],
  ['Cuál es tu rendimiento escolar?', this.interview.rendimientoEscolar],
  ['Menciona las asignaturas que cursas en el semestre actual.', this.interview.materiasActuales],
  ['Cuál es tu asignatura preferida?  Por qué?', this.interview.asignaturaPreferida],
  ['Cuál es la asignatura en la que sobresales?  Por qué?', this.interview.asignaturaSobresaliente],
  ['Qué asignatura te desagrada?   Por qué?', this.interview.asignaturaDesagradable],
  ['Cuál es tu asignatura con más bajo promedio del semestre anterior?  Por qué?', this.interview.asignaturaBajoPromedio],
  ['Por qué vienes al tecnológico?', this.interview.porquevienesalTEC],
  ['Qué te motiva a venir al Tecnológico?', this.interview.motivacionAsistiralTec],
 // PLAN DE VIDA Y CARRERA
  ['Cuáles son tus planes inmediatos', this.interview.planesinmediatos],
  ['Cuáles son tus metas en la vida', this.interview.metasenlavida],

  //CARACTERÍSTICAS PERSONALES
['Yo soy…', this.interview.YoSoy],
['Mi carácter es…', this.interview.Micaracteres],
['A mí me gusta que…', this.interview.Megustaque],
['Yo aspiro en la vida…', this.interview.yoAspiroenlavida],
['Yo tengo miedo que….', this.interview.Yotengomiedoque],
['comentario adicional?', this.interview.comentarioadicional],

  ]);

  pdf.save(`interview_.pdf`);
}



addSection(pdf: jsPDF, title: string, yPosition: number, data: string[][]) {
  pdf.setFontSize(14);
  pdf.text(title, 10, yPosition);

  const columns = ['Etiqueta', 'Valor'];
  const rows = data.map(row => ({ Etiqueta: row[0], Valor: row[1] }));

  const result = autoTable(pdf, {
    columns: columns.map(col => ({
      header: col,
      dataKey: col,
      cellWidth: 'wrap', // Ajusta automáticamente el ancho de la celda según el contenido
    })),
    body: rows,
    startY: yPosition + 5,
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
    styles: { cellPadding: 2 }, // Añade un pequeño relleno para que el texto no se toque con los bordes de las celdas
  });
  return yPosition; // Retorna la posición Y final después de agregar la tabla
}

}
