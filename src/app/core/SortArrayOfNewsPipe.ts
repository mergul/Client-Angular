// import {Pipe, PipeTransform} from '@angular/core';
// import {News, NewsPayload} from './news.model';
// import {NewsService} from './news.service';

// @Pipe({name: 'sortArrayOfNews'})
// export class SortArrayOfNewsPipe implements PipeTransform {
//     constructor() {
//     }
//     transform(arr: Array<NewsPayload>, field: string): Array<NewsPayload> {
//         if (!arr) { return; }
//         // || arr.every(value => !this.service.newsCounts.has(value.id))
//         return [].slice.call(arr).sort((a, b) => {
//             if (a[field] < b[field]) {
//                 return 1;
//             }
//             if (a[field] > b[field]) {
//                 return -1;
//             }
//             return 0;
//         });
//     }
// }
