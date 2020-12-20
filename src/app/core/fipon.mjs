import bigInt from "big-integer";
const fibo2N = (first, multi) => bigInt(bigInt(first).multiply(bigInt(multi)));
const multi2N = (multiN, el) => bigInt(bigInt(multiN).pow(2)).plus(bigInt(el===0?-2:2));
const fipon = (n) => {
    if (n===3) return { 'result': 2, 'multi': 4 }; 
    else if (n===4) return { 'result': 3, 'multi': 7 }; 
    else if (n===5) return { 'result': 5, 'multi': 11 };       
    let obje = fipon(Math.floor(n/2));
    obje.result=fibo2N(bigInt(obje.result),bigInt(obje.multi));
    obje.multi=multi2N(obje.multi, Math.floor(n/2)%2);
    if (n%2===1) {
        const el=bigInt(bigInt(obje.result).plus(bigInt(obje.multi))).divide(bigInt(2));
        obje.multi=bigInt(bigInt(el).plus(bigInt(obje.result).multiply(bigInt(2))));
        obje.result=bigInt(el);
    }
    return obje;
}
console.log('end result is here--> '+bigInt(fipon(27).result).toString());
   // console.log('pre medium result --> ' + obje.result.toString() + ' :: multi --> ' + obje.multi.toString()+' -- n :: '+n);
   // console.log('post medium result --> ' + obje.result.toString() + ' :: multi --> ' + obje.multi.toString()+' -- n :: '+n);
// console.log('mires --> '+obje.result.toString()+' :: mimul -->'+obje.multi.toString());
// console.log('el --> '+el.toString()+' :: res --> '+obje.result.toString()+' :: mul -->'+obje.multi.toString());

   /*
const multi3N = (multiN, a) => bigInt(bigInt(multiN).pow(2).plus(bigInt(a===1?3:-3))).multiply(multiN)
const fibo3N = (fN, multiN, a) => bigInt(bigInt(multiN).pow(2).plus(bigInt(a===1?1:-1)))).multiply(fN);
const fibo2NPlusOne = (obj) => {
    const multi2Nplus1 = bigInt(bigInt(obj.result).multiply(5).plus(bigInt(obj.multi))).divide(2);
    const twoNplus1=bigInt(bigInt(obj.result).plus(bigInt(obj.multi))).divide(2);
    return { 'result': twoNplus1, 'multi': multi2Nplus1}
}
*/
// console.log('test fibo3N even--> '+fibo3N(8, 18, 0) +' :: test fibo3N odd --> '+ fibo3N(5, 11, 1));
// console.log('test multi3N even--> '+multi3N(18, 0) +' :: test multi3N odd --> '+ multi3N(11, 1))