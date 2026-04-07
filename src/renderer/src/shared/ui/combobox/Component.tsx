import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react'
import { Root, Content, Anchor } from '@radix-ui/react-popover'
import { Input } from '@renderer/shared/ui/input'
import { cn } from '@renderer/shared/lib/cn'

export interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  maxLength?: number
  className?: string
}

export function Combobox({
  value,
  onChange,
  suggestions,
  placeholder,
  maxLength,
  className
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = suggestions.filter(
    (s) => s !== value && s.toLowerCase().includes(value.toLowerCase())
  )

  const showPopover = open && filtered.length > 0

  useEffect(() => {
    setHighlightIndex(-1)
  }, [value])

  const select = useCallback(
    (item: string) => {
      onChange(item)
      setOpen(false)
      setHighlightIndex(-1)
      inputRef.current?.focus()
    },
    [onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showPopover) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((prev) => (prev + 1) % filtered.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((prev) => (prev <= 0 ? filtered.length - 1 : prev - 1))
        break
      case 'Enter':
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          e.preventDefault()
          select(filtered[highlightIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setHighlightIndex(-1)
        break
    }
  }

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  return (
    <Root open={showPopover} onOpenChange={setOpen}>
      <Anchor asChild>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setOpen(false), 150)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className={className}
          autoComplete="off"
        />
      </Anchor>
      {showPopover && (
        <Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 w-[--radix-popover-trigger-width] max-h-48 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <div ref={listRef}>
            {filtered.map((item, i) => (
              <div
                key={item}
                role="option"
                aria-selected={i === highlightIndex}
                className={cn(
                  'cursor-pointer rounded-sm px-4 py-2 text-sm text-popover-foreground hover:bg-popover-hover',
                  i === highlightIndex && 'bg-popover-hover'
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(item)
                }}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                {item}
              </div>
            ))}
          </div>
        </Content>
      )}
    </Root>
  )
}
