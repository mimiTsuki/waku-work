import { describe, expect, it } from 'vitest'
import { range } from './range'

describe('range', () => {
  describe('基本的な動作', () => {
    it.each([
      [0, 10, 2, [0, 2, 4, 6, 8]],
      [0, 10, 1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
      [0, 10, 3, [0, 3, 6, 9]],
      [10, 0, -2, [10, 8, 6, 4, 2]],
      [5, 2, -1, [5, 4, 3]],
      // 境界値: ステップがちょうどendに到達する場合 (endは含まれない)
      [0, 10, 5, [0, 5]]
    ])(
      '%iから%iの範囲かつ%iごとの間隔で配列の要素が生成されること',
      (start, end, step, expected) => {
        const result = range(start, end, step)
        expect(result).toEqual(expected)
      }
    )
  })

  describe('境界値・エッジケース', () => {
    it('startとendが等しい場合、空配列を返すこと', () => {
      expect(range(10, 10)).toEqual([])
    })

    it('stepが正でstart > endの場合、空配列を返すこと', () => {
      expect(range(10, 0, 1)).toEqual([])
    })

    it('stepが負でstart < endの場合、空配列を返すこと', () => {
      expect(range(0, 10, -1)).toEqual([])
    })

    it('stepが省略された場合、デフォルトで1が使用されること', () => {
      expect(range(0, 5)).toEqual([0, 1, 2, 3, 4])
    })

    it('負の数のstart/endを正しく扱うこと', () => {
      expect(range(-5, 0)).toEqual([-5, -4, -3, -2, -1])
      expect(range(-5, -10, -1)).toEqual([-5, -6, -7, -8, -9])
    })

    it('stepが0の場合、エラーをスローすること', () => {
      expect(() => range(0, 10, 0)).toThrow('Step cannot be zero')
    })
  })
})
