import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { SelectivePreloadingStrategy } from './core/selective-preloading-strategy';

const rootRouterConfig: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', loadChildren: () =>
        import('./home/home.module').then(m => m.HomeModule),
        data: { preload: true }},
    {path: 'user', loadChildren: () =>
      import('./user/user.module').then(m => m.UserModule)},
    {path: 'search', loadChildren: () =>
      import('./search/search.module').then(m => m.SearchModule)},
    {path: 'admin', loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)},
    {path: 'allusers/:id', loadChildren: () =>
      import('./public-profile/public-profile.module').then(m => m.PublicProfileModule)},
    {path: 'upload', loadChildren: () =>
      import('./multi-files-upload/multi-files-upload.module').then(m => m.MultiFilesUploadModule)},
    {path: 'login', loadChildren: () =>
      import('./login/login.module').then(m => m.LoginModule)},
    {path: 'register', loadChildren: () =>
      import('./register/register.module').then(m => m.RegisterModule)},
    {path: 'loginin', loadChildren: () =>
      import('./req/req.module').then(m => m.ReqModule)},
    {path: 'auth', loadChildren: () =>
      import('./user-management/user-management.module').then(m => m.UserManagementModule)},
    {path: 'talepler', loadChildren: () =>
      import('./user-selections/user-selections.module').then(m => m.UserSelectionsModule)},
    {path: 'money', loadChildren: () =>
      import('./money-manage/money-manage.module').then(m => m.MoneyManageModule)},
    {path: 'camera', loadChildren: () =>
      import('./camera/camera.module').then(m => m.CameraModule)},

];

@NgModule({
    imports: [
        RouterModule.forRoot(
            rootRouterConfig,
            {
                enableTracing: true, // <-- debugging purposes only
                preloadingStrategy: SelectivePreloadingStrategy,
                useHash: false
            }
        )
    ],
    exports: [
        RouterModule
    ],
    providers: [
        SelectivePreloadingStrategy
    ]
})
export class AppRoutingModule {
}
