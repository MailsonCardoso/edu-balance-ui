import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { maskCurrency, parseCurrency } from "@/lib/format";

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0,00",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(() =>
    value && value > 0 ? maskCurrency(String(Math.round(value * 100))) : "",
  );

  useEffect(() => {
    setText(value && value > 0 ? maskCurrency(String(Math.round(value * 100))) : "");
    // sincroniza quando o valor externo muda (ex: carregar aluno do banco)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const masked = maskCurrency(e.target.value);
        setText(masked);
        onChange(parseCurrency(masked));
      }}
    />
  );
}
