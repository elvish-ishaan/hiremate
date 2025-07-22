function hashFloat32Array(arr: Float32Array): string {
  let hash = 0;
  for (let i = 0; i < arr.length; i++) {
    hash = ((hash << 5) - hash) + Math.floor(arr[i] * 100000);
    hash |= 0;
  }
  return hash.toString();
}
