
export class FirebaseUserModel {
    id: string;
    image: string;
    name: string;
    email: string;
    totalNews: string;
    people: string[];
    tags: string[];
    followers: string[];
    provider: string;
    mediaParts: number[];
    token: string;
    iban: string;

    constructor() {
        this.id = '';
        this.image = '';
        this.name = '';
        this.email = '';
        this.totalNews = '';
        this.people = [];
        this.tags = [];
        this.followers = [];
        this.provider = '';
        this.mediaParts = [];
        this.token = '';
        this.iban = '';
    }
}

export class UserTag {
    id: string;
    email: string;
    tag: string;
    constructor(id: string = '', email: string = '', tag: string = '') {
        this.id = id;
        this.email = email;
        this.tag = tag;
    }
}

export interface User {
    blocked: string[];
    iban: string;
    contentsCount: string;
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    tags: string[];
    users: string[];
    followers: string[];
    image: string;
    mediaParts: number[];
    roles: string[];
    summary: string;
    enabled: boolean;
    //  viewPayed: number;
    // balance: number;
}
export class ThumbModel {

    private _name: string;
    private _content: string;

    constructor(name: string = '', content: string = '') {
        this._name = name;
        this._content = content;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

}
export class ThumbModelV1 {

    private _name: string;
    private _content: Blob;

    constructor(name: string = '', content: Blob) {
        this._name = name;
        this._content = content;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get content(): Blob {
        return this._content;
    }

    set content(value: Blob) {
        this._content = value;
    }
}
export interface BalanceRecord {
    key: string;
    paymentKey: string;
    pageviews: number;
    payment: number;
    totalViews: number;
    payedViews: number;
    totalBalance: number;
    date: number;
}
