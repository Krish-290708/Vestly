import React from 'react';

export interface KeyValueItem {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  numeric?: boolean;
}

export interface KeyValueListProps {
  items: KeyValueItem[];
  className?: string;
  dense?: boolean;
}

export const KeyValueList: React.FC<KeyValueListProps> = ({
  items,
  className = '',
  dense = false,
}) => {
  return (
    <dl
      className={`divide-y divide-rule border-y border-rule text-sm ${className}`}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={`flex items-start justify-between gap-4 ${
            dense ? 'py-1.5' : 'py-2.5'
          }`}
        >
          <dt className="text-muted text-xs font-sans">
            <div>{item.label}</div>
            {item.hint && (
              <span className="text-[11px] text-muted/80 block mt-0.5">
                {item.hint}
              </span>
            )}
          </dt>
          <dd
            className={`text-ink font-medium text-right text-xs sm:text-sm ${
              item.numeric ? 'font-mono tabular-nums' : 'font-sans'
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};
