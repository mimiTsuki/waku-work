/**
 * 指定された範囲(startからendまで)の連続する整数をstep間隔で生成する
 * @param start 始点
 * @param end 終点
 * @param step ステップ数
 * @returns
 */
export function range(start: number, end: number, step: number | undefined = 1): number[] {
  return [...generateRange(start, end, step)]
}

/**
 * 指定された範囲(startからendまで)の連続する整数をstep間隔で生成するジェネレータ
 * @param start 始点
 * @param end 終点
 * @param step ステップ数
 */
export function* generateRange(
  start: number,
  end: number,
  step: number | undefined = 1
): Generator<number> {
  if (step === 0) {
    throw new Error('Step cannot be zero')
  }

  if (step > 0) {
    for (let i = start; i < end; i += step) {
      yield i
    }
  } else {
    for (let i = start; i > end; i += step) {
      yield i
    }
  }
}
