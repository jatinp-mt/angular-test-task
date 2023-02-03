import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddDashboardDialogComponent } from '../../components/add-dashboard-dialog/add-dashboard-dialog.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private httpClient: HttpClient;
  constructor(private dialog: MatDialog, http: HttpClient) {
    this.httpClient = http;
  }
  graphs = new FormControl(['Line-Chart', 'Bar-Chart', 'Pie-Chart']);
  dashboards = new FormControl('');
  assignee = new FormControl('');
  graphsList: string[] = ['Line-Chart', 'Bar-Chart', 'Pie-Chart'];
  dashboardList: string[] = ['Reports'];
  dashboardselected = 'Reports';
  assigneeSelected = '';
  chartData: any;
  filteredChartData: any;
  isLoading: boolean = false;
  assigneList: any;

  ngOnInit() {
    this.isLoading = true;
    this.httpClient
      .get('assets/OPRD_TSK_FINAL.xlsx', { responseType: 'blob' })
      .subscribe((data: any) => {
        const reader: FileReader = new FileReader();
        reader.readAsBinaryString(data);
        reader.onload = async (e: any) => {
          /* create workbook */
          const binarystr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(binarystr, {
            type: 'binary',
            cellText: false,
            cellDates: true,
          });

          /* selected the first sheet */
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];

          /* save data */
          const data = await XLSX.utils.sheet_to_json(ws, {
            header: 0,
            raw: false,
            dateNF: 'yyyy-mm-dd',
          }); // to get 2d array pass 2nd parameter as object {header: 1}
          this.extractData(data); // Data will be logged in array format containing objects
        };
      });
  }

  // handle dashboard dropdown changes
  handleOnChangeDashboard = (event: any) => {
    if (event.value && event.value.length) {
      this.dashboardselected = event.value;
      this.graphs?.setValue([]);
    }
  };

  // handle assignee dropdown changes
  handleOnChangeAssignee = (event: any) => {
    if (event.value && event.value.length) {
      this.assigneeSelected = event.value;
    }
    this.filterByAssignee(this.chartData);
  };

  // add more dashbord to dropdown
  addDashboard = () => {
    // Creates your dialog modal
    const dialogRef = this.dialog.open(AddDashboardDialogComponent, {
      height: '220px',
      width: '340px',
    });

    // Handles what happens after the modal dialog is closed
    dialogRef.afterClosed().subscribe((result: string) => {
      if (result) {
        // do something
        this.dashboardList.push(
          result && result[0].toUpperCase() + result.slice(1)
        );
      }
    });
  };

  // conver the view to PDF
  exportAsPDF(divId: string) {
    let DATA: any = document.getElementById(divId);
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('angular-demo.pdf');
    });
  }

  // fetch the data
  extractData = async (data: any) => {
    this.assigneList = data.map((aItem: any) => {
      return aItem['Assignee'];
    });

    this.assigneList = this.assigneList.filter((item: any, index: any) => { return this.assigneList.indexOf(item) === index})
    this.assigneeSelected = this.assigneList[0];
    if (data && data.length) {
      data.forEach((item: any) => {
        if (item['Task ID']) {
          // If the operator is complete the task with in the due date then complicant.
          if (
            item['Task End Date'] &&
            item['Task End Date'] <= item['TskDuedate']
          ) {
            item['isCompliant'] = true;
          } else {
            item['isCompliant'] = false;
          }

          // all the task with the status complete we can direclty compare the due date with the task completion date
          if (
            item['Task Status'] &&
            item['Task Status'] === 'COMPLETED' &&
            item['Date in Format YYYYMMDD'] <= item['TskDuedate']
          ) {
            item['isCompliant'] = true;
          } else {
            if (
              item['Task Status'] &&
              item['Task Status'] !== 'COMPLETED' &&
              new Date().toISOString().slice(0, 10) <= item['TskDuedate']
            ) {
              item['isCompliant'] = false;
            } else {
              item['isCompliant'] = true;
            }
          }
        }
      });
      this.chartData = await data.filter((fitem: any) => {
        return fitem['Task ID'];
      });
      this.filterByAssignee(this.chartData);
      this.isLoading = false;
    }
  };

  filterByAssignee = async (data: any) => {
    this.filteredChartData = await data.filter((fitem: any) => {
      return fitem['Assignee'] === this.assigneeSelected;
    });
  }
}
