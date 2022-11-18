import {HmacSHA512} from 'crypto-js';
require('dotenv').config();

export function sanitizeRegexp(regexpresson: string) {
  regexpresson = regexpresson.toString();
  return regexpresson.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function paginator(pageSize: number, pageNo: number) {
  let skip = pageSize * pageNo;
  if (skip < 0) skip = 0;
  return [
    {
      $skip: skip,
    },
    {
      $limit: pageSize,
    },
  ];
}

/**
 * replace placeholders {} with values from array
 *
 * Source: https://jqueryvalidation.org/jQuery.validator.format/
 * Licence: MIT
 * @param source
 * @param params
 */
export const format = function (source: string, params: Array<string | number>) {
  if (params === undefined) {
    return source;
  }

  if (!Array.isArray(params)) {
    params = [params];
  }
  for (let [i, _n] of params.entries()) {
    const n = (_n || '').toString();
    source = source.replace(new RegExp('\\{{' + (i + 1) + '\\}}', 'g'), n);
  }
  return source;
};

/**
 * modify phone number to send sms
 * @param phoneNo entered phone number
 * @returns modified phone number
 */
export function getPhoneNumber(phoneNo: string) {
  let userPhone: string;
  if (phoneNo.charAt(2) == '9' && phoneNo.charAt(3) == '4') {
    //remove +1 from lk numbers
    console.log('LK number detected from ' + phoneNo);
    userPhone = phoneNo.substring(2);
    userPhone = ['+', userPhone].join('');
    console.log('Formatted number ' + userPhone);
  } else {
    userPhone = phoneNo;
  }
  return userPhone;
}

export function hashPassword(rawPassword: string) {
  const hash = HmacSHA512(rawPassword, process.env.SECRET!).toString();
  return hash;
}
