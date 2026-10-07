import { useState } from "react";

interface TouchKeyboardProps {
  value: string;
  onChange: (next: string) => void;
}

const LETTERS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"];
const SYMBOLS = ["1234567890", "@#$%&*-+()", "!\"':;/?_=", ".,~`<>[]{}", "\\|^€£¥§°"];

/** Small on-screen keyboard for the touchscreen (the booth has no physical keyboard). */
export function TouchKeyboard({ value, onChange }: TouchKeyboardProps) {
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const rows = symbols ? SYMBOLS : LETTERS;

  function type(key: string): void {
    onChange(value + key);
    if (shift) {
      setShift(false);
    }
  }

  return (
    <div className="touch-keyboard" aria-label="On-screen keyboard">
      {rows.map((row, rowIndex) => (
        <div key={row} className="touch-keyboard-row">
          {!symbols && rowIndex === rows.length - 1 ? (
            <button
              type="button"
              className={shift ? "key key-wide selected" : "key key-wide"}
              onClick={() => setShift(!shift)}
              aria-label="Shift"
            >
              ⇧
            </button>
          ) : null}
          {[...row].map((char) => {
            const key = shift && !symbols ? char.toUpperCase() : char;
            return (
              <button key={char} type="button" className="key" onClick={() => type(key)}>
                {key}
              </button>
            );
          })}
          {rowIndex === rows.length - 1 ? (
            <button type="button" className="key key-wide" onClick={() => onChange(value.slice(0, -1))} aria-label="Backspace">
              ⌫
            </button>
          ) : null}
        </div>
      ))}
      <div className="touch-keyboard-row">
        <button type="button" className="key key-wide" onClick={() => setSymbols(!symbols)}>
          {symbols ? "abc" : "?123"}
        </button>
        <button type="button" className="key key-space" onClick={() => type(" ")} aria-label="Space">
          space
        </button>
        <button type="button" className="key key-wide" onClick={() => onChange("")}>
          clear
        </button>
      </div>
    </div>
  );
}
