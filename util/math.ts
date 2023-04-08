export function findMedian(numbers: number[]): number {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middleIndex = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    // Array has even length, return average of middle elements
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
  } else {
    // Array has odd length, return middle element
    return sorted[middleIndex];
  }
}