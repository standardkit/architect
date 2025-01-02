import { MethodType } from '../types';

export function arrayAndMethodIncluded(method: MethodType, option?: boolean | MethodType[]): boolean {
  return Array.isArray(option) && option.includes(method);
}

export function trueOrMethodIncluded(method: MethodType, option?: boolean | MethodType[]): boolean {
  return option === true || arrayAndMethodIncluded(method, option);
}

export function trueOrMethod(method: MethodType, option?: boolean | MethodType): boolean {
  return option === true || option === method;
}
