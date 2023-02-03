import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-dashboard-dialog',
  templateUrl: './add-dashboard-dialog.component.html',
  styleUrls: ['./add-dashboard-dialog.component.css'],
})
export class AddDashboardDialogComponent {
  constructor(public dialogRef: MatDialogRef<AddDashboardDialogComponent>) {}
  newDashboard = '';

  closeModal(): void {
    this.dialogRef.close();
  }

  createDashboard = () => {
    if (this.newDashboard.length > 0) {
      this.dialogRef.close(this.newDashboard);
    }
  };
}
