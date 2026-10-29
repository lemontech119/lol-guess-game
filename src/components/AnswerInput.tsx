"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CHAMPIONS } from "@/lib/champions";
import { searchChampions } from "@/lib/match";

type Props = {
  disabled: boolean;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
};

export function AnswerInput({ disabled, onSubmit, onSkip }: Props) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => searchChampions(value, CHAMPIONS), [value]);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function submit(answer: string) {
    if (!answer.trim() || disabled) return;
    onSubmit(answer.trim());
    setValue("");
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = open ? suggestions[active] : undefined;
      submit(picked ? picked.name : value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <label htmlFor="answer" className="mb-2 block text-sm font-medium text-gold-200">
        정답 입력
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="answer"
          type="text"
          autoComplete="off"
          disabled={disabled}
          value={value}
          placeholder="챔피언 이름 (예: 아리, ㅇㄹ)"
          onChange={(e) => {
            setValue(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded-md border border-gold-700/60 bg-navy-950 px-4 py-3 text-base text-gold-50 placeholder:text-gold-700 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30 disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={() => submit(open && suggestions[active] ? suggestions[active].name : value)}
          className="rounded-md bg-gold-400 px-5 py-3 font-bold text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          제출
        </button>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onSkip}
        className="mt-2 text-sm text-gold-500 underline-offset-4 hover:text-gold-300 hover:underline disabled:opacity-40"
      >
        모르겠어요 (패스)
      </button>

      {open && !disabled && suggestions.length > 0 && (
        <ul className="absolute bottom-full left-0 z-20 mb-1 max-h-72 w-full overflow-auto rounded-md border border-gold-700/60 bg-navy-900 shadow-xl">
          {suggestions.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => submit(c.name)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  i === active ? "bg-gold-400/15 text-gold-100" : "text-gold-200"
                }`}
              >
                <Image src={c.image} alt="" width={28} height={28} className="rounded" />
                <span>{c.name}</span>
                <span className="text-xs text-gold-600">{c.nameEn}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
