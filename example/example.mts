/**
 * Quick maths
 * Returns 3 after doing some quick maths
 *
 * Academic Reference: https://youtu.be/3M_5oYU-IsU?t=60
 *
 * @returns {number} 3
 * @example
 * quickmaths(); // 3
 */
export function quickmaths(): number {
  let r = 0;
  // 2 + 2 that's 4
  r += 2 + 2;
  // minus 1 that's 3
  r -= 1;
  // quick maths
  return r;
}

console.log(`2 plus 2 that's 4 minus 1 that's ${quickmaths()} quick maths!`);
