export function isConstructor(f : any) {

  if(typeof f !== 'function') return false;

  const descriptor = Object.getOwnPropertyDescriptor(f, 'prototype');

  if (!descriptor) return false;

  return !descriptor.writable;
}