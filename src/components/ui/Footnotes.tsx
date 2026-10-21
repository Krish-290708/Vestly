import React from 'react';

export interface FootnoteItem {
  id?: string | number;
  marker: string | number;
  text: React.ReactNode;
}

export interface FootnotesProps {
  notes: (FootnoteItem | string)[];
  title?: string;
  className?: string;
}

export const Footnotes: React.FC<FootnotesProps> = ({
  notes,
  title = 'Assumptions and calculation notes',
  className = '',
}) => {
  if (!notes || notes.length === 0) return null;

  return (
    <footer
      aria-label="Footnotes"
      className={`border-t border-rule pt-4 mt-8 space-y-2 text-xs text-muted ${className}`}
    >
      <div className="font-mono uppercase text-[10px] tracking-wider font-semibold text-muted/80">
        {title}
      </div>
      <ol className="space-y-1 pl-0 list-none">
        {notes.map((note, idx) => {
          if (typeof note === 'string') {
            return (
              <li key={idx} className="flex items-start gap-1.5 leading-normal">
                <span className="font-mono text-muted select-none">
                  [{idx + 1}]
                </span>
                <span>{note}</span>
              </li>
            );
          }
          return (
            <li
              key={note.id || idx}
              id={`footnote-${note.marker}`}
              className="flex items-start gap-1.5 leading-normal"
            >
              <sup className="font-mono text-muted select-none mt-0.5">
                {note.marker}
              </sup>
              <span>{note.text}</span>
            </li>
          );
        })}
      </ol>
    </footer>
  );
};
