import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Type, OnDestroy, Component } from '@angular/core';
import { MultiFilesUploadComponent } from '../multi-files-upload/multi-files-upload.component';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { Subject } from 'rxjs';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { WindowRef } from '../core/window.service';
import { ReqComponent } from '../req/req.component';

export const entryComponentsMap = {
    'upload': MultiFilesUploadComponent,
    'login': LoginComponent,
    'register': RegisterComponent,
    'loginin': ReqComponent
};

@Component({
    selector: 'app-modal-container',
    template: ``
})
export class GenericModalComponent implements OnDestroy {
    destroy = new Subject<any>();
    currentDialog: MatDialogRef<any> = null;

    constructor(private dialog: MatDialog, private location: Location, private router: Router, private winRef: WindowRef) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        const wid = this.winRef.nativeWindow.innerWidth;
        const modalWidth = wid >= 908 ? 808 : wid - (100 * wid / 908);
        dialogConfig.width =  modalWidth + 'px';
        dialogConfig.maxWidth = modalWidth + 'px';
        dialogConfig.height = this.winRef.nativeWindow.innerHeight + 'px';
        dialogConfig.data = {color: 'lightgrey', header$: modalWidth - 24};
        this.currentDialog = this.dialog.open(this.getClazz(this.location.path().slice(1)), dialogConfig);
        this.currentDialog.afterClosed().subscribe(result => {
            if (result && result !== '') {
                this.router.navigateByUrl(result);
            } else { this.location.back(); }
          });

    }
    public getClazz(name) {
        const factories = Array.of('upload', 'login', 'register', 'loginin');
        const factoryClass = <Type<any>>entryComponentsMap[factories.find((x: string) => x === name)];
        //  const factory = this.resolver.resolveComponentFactory(entryComponentsMap.comp1);
        //  const compRef = this.vcRef.createComponent(factory);
        return factoryClass;
    }

    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
    }
}
