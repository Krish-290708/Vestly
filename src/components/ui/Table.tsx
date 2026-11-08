import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  stickyHeader?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', stickyHeader = false, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto border border-rule rounded-sm bg-surface">
        <table
          ref={ref}
          className={`w-full text-left border-collapse text-sm text-ink ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className = '', sticky = false, ...props }, ref) => (
  <thead
    ref={ref}
    className={`bg-sunk text-muted text-xs uppercase tracking-wider font-medium border-b border-rule ${
      sticky ? 'sticky top-0 z-10' : ''
    } ${className}`}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', ...props }, ref) => (
  <tbody
    ref={ref}
    className={`divide-y divide-rule ${className}`}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }
>(({ className = '', selected = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={`transition-colors hover:bg-sunk/50 ${
      selected ? 'bg-sunk font-medium' : ''
    } ${className}`}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = '', numeric = false, ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      className={`px-3.5 py-2.5 font-medium ${
        numeric ? 'text-right' : 'text-left'
      } ${className}`}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', numeric = false, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-3.5 py-2.5 text-sm align-middle ${
        numeric ? 'text-right tabular-nums' : 'text-left'
      } ${className}`}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
