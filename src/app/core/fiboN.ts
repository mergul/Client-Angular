// import bigInt from "big-integer";

// const fibon = (n) => {
//     const list = expon(n);
//     const last = list.pop();
//     const prev = list.pop();
//     let ante = 0;
//     let obj = { 'result': bigInt(0), 'multi': bigInt(0), 'index': 0};
//     if (last === 0) {
//         if (prev === 0) {
//             obj.result = bigInt(3); obj.multi = bigInt(7); obj.index=4;
//         } else {
//             obj.result = bigInt(5); obj.multi = bigInt(11); obj.index=5;
//             ante=1;
//         }
//     } else {
//         if (prev === 0) {
//             obj.result = bigInt(2).multiply(4); obj.multi = bigInt(4); obj.index=3*2;
//             ante=2;
//         } else {
//             obj.result = bigInt(13); obj.multi = bigInt(29); obj.index=7;
//             ante=1;
//         }
//     }
//     if (n < 11) { } else {
//        // console.log('arr length --> ' + list.length+ ' :--> : last ' + last + ' :: prev --> ' + prev+' :: result ' + obj.result + ' :: multi --> ' + obj.multi);
//         list.reverse().map(val => {
//         //    console.log('value of arr --> ' + val+' -- index :: '+obj.index);
//             if (val === 0) {
//                 if (obj.result<obj.multi||ante===1) {
//                     obj.result=bigInt(getResult(bigInt(obj.result),bigInt(obj.multi))); ante=obj.index%2===1?2:0; obj.index*=2;
//                    // console.log('straight result ' + obj.result.toString() + ' :: multi --> ' + obj.multi.toString()+' -- index :: '+obj.index);
//                 } else {
//                     obj = fiboXN(obj, ante === 0 ? sqrtFactorMinusTwo : sqrtFactorPlusTwo);
//                  //   console.log('result ' + obj.result.toString() + ' :: multi --> ' + obj.multi.toString()+' -- index :: '+obj.index);
//                     ante = 0;
//                 }
//             } else {
//                 let mult=obj.multi;
//                 if (obj.result>obj.multi) {
//                     mult=ante>0?bigInt(sqrtFactorPlusTwo(mult)):bigInt(sqrtFactorMinusTwo(mult));
//                 }
//       //          console.log('mult result ' + obj.result.toString() + ' :: multi --> ' + mult.toString() + ' :: multi --> ' + obj.multi.toString()+' -- index :: '+obj.index);
//                 obj.result=bigInt(obj.result).multiply(mult);obj.multi=mult;
//                 obj = get2NPlusOne(obj, ante);
//                 ante = 1;
//       //          console.log('2NPlusOne result ' + obj.result.toString() + ' :: multi --> ' + obj.multi.toString()+' -- index :: '+obj.index);
//             }
//         });
//     }
//   //  console.log('last result --> ' + obj.result.toString() + ' :: multi --> ' + obj.multi.toString());
//     return obj.result.toString();
// }
// const fiboXN = (obj, callable) => {
//     const nextMulti = bigInt(callable(obj.multi));
//     const result = bigInt(getResult(bigInt(obj.result), bigInt(nextMulti)));
//   //  console.log('nextMulti ::: ' + nextMulti.toString() + ' -- nextRes ::: ' + result.toString()+' -- index :: '+obj.index);
//     return { 'result': result, 'multi': nextMulti, 'index': obj.index*2}
// }
// const get2NPlusOne = (obj, ind) => {
//     const el=(ind===1?4:0);
//     const twoNminus1 = bigInt(fibo2NMinusOne(obj.result, obj.multi)).plus(el);
//     const multi2Nminus1=bigInt(obj.result).minus(bigInt(twoNminus1).multiply(2));
//     const multi2N=bigInt(bigInt(obj.multi).pow(2)).minus(2).plus(el);
//     const newMultioftwoNplus1 = bigInt(bigInt(multi2Nminus1).plus(bigInt(multi2N).multiply(3))).divide(2);
//     const twoNplus1=bigInt(bigInt(obj.result).multiply(3).plus(bigInt(twoNminus1))).divide(2);
//     const res = bigInt(twoNplus1).multiply(bigInt(newMultioftwoNplus1));
//    // console.log('res ----> '+res.toString());
//    // console.log(ind+'th number :: newMultioftwoNplus1 ::: ' + newMultioftwoNplus1.toString() + ' -- newRes ::: ' + res.toString()+ ' -- twoNminus1 ::: ' +
//    // twoNminus1.toString()+ ' -- result f2n::: ' + obj.result.toString()+ ' -- multi fn::: ' + obj.multi.toString()+ ' -- twoNplus1::: ' + twoNplus1.toString()+ ' -- multi2Nminus1::: ' + multi2Nminus1.toString()+' -- multi2N :: '+multi2N.toString()+' -- index :: '+obj.index);
//     return { 'result': twoNplus1, 'multi': newMultioftwoNplus1, 'index': obj.index*2+1 }
// }
// const expon = (n) => {
//     let div = n;
//     let index = 0;
//     let arr = [];
//     while (div > 1) {
//         if (Number.isInteger(div / 2)) {
//             div = div / 2;
//             arr[index] = 0;
//         } else {
//             div = (div - 1) / 2;
//             arr[index] = 1;
//         }
//         index += 1;
//     }
//   //  console.log('number :: ' + n + ' -- exp:: ' + index + ' -- div :: ' + div);
//     return arr;
// }
// const getResult = (first, multi) => bigInt(bigInt(first).multiply(bigInt(multi))).toString();
// const sqrtFactorMinusTwo = (muFactor) => bigInt(bigInt(muFactor).pow(2).minus(2)).toString();
// const sqrtFactorPlusTwo = (muFactor) => bigInt(bigInt(muFactor).pow(2).plus(2)).toString();
// const fibo2NMinusOne = (F2n, muFactor) => bigInt(bigInt(muFactor).pow(2).minus(bigInt(2).multiply(bigInt(F2n).plus(1)))).toString();
// console.log('end result is here--> '+fibon(1000));
