import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {
  transform(value: any, showSymbol: boolean = true): string {
    if (value === null || value === undefined || value === '') return '';

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Convert number to Indian-style format (e.g. 1234567.89 -> 12,34,567.89)
    const parts = num.toFixed(2).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;

    const formattedNumber =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

    return `${showSymbol ? '₹' : ''}${formattedNumber}.${decimalPart}`;
  }
}
