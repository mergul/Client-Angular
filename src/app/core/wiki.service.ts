// import { HttpClient } from '@angular/common/http';

// export class Originalimage {
//   source?: string;
//   width?: number;
//   height?: number;
// }
// export class WikiSummary {
//   type?: string;
//   title?: string;
//   displaytitle?: string;
//   // namespace?:     Namespace;
//   wikibase_item?: string;
//   // titles?:        Titles;
//   pageid?: number;
//   thumbnail?: Originalimage;
//   originalimage?: Originalimage;
//   lang?: string;
//   dir?: string;
//   revision?: string;
//   tid?: string;
//   timestamp?: Date;
//   description?: string;
//   // content_urls?:  ContentUrls;
//   // api_urls?:      APIUrls;
//   extract?: string;
//   extract_html?: string;
// }
// export class WikiService {
//   constructor(private http: HttpClient) { }
//   getWiki(title: string) {
//     const tempTitle = title.replace(' ', '_') + '?redirect=true&origin=*';
//     const baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
//     return this.http.get<WikiSummary>(baseUrl + tempTitle);
//   }
// }
