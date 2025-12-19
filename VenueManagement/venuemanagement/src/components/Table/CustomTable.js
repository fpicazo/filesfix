"use client";
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import CustTablePagination from "./CustTablePagination";
import SortBothSideVerticalIcon from "../../assets/helperIcons/SortBothSideVerticalIcon";
import { Search } from "lucide-react";
// import TableSkeleton from "./TableSkeleton";

export function CustomTable({
  columns = [],
  data = [],
  isLoading,
  getRowCanExpand,
  dataNotFoundQuery,
  filename,
  additionalActions, // Add this prop
}) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [filteredData, setFilteredData] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const globalFilterFn = (row, columnId, value) => {
    return row
      .getValue(columnId)
      ?.toString()
      .toLowerCase()
      .includes(value.toLowerCase());
  };

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,

    filterFns: {
      dateFilter: (row, columnId, value) => {
        if (!value) return true;
        const rowDate = new Date(row.getValue(columnId)).toDateString();
        const filterDate = new Date(value).toDateString();
        return rowDate === filterDate;
      },
    },
  });

  React.useEffect(() => {
    const rowData = table
      .getFilteredRowModel()
      ?.rows?.map((info) => info.original);
    setFilteredData(rowData);
  }, [table.getFilteredRowModel()?.rows]);

  const TBody = () => {
    if (isLoading) {
      return "Loading...";
    }

    if (table.getFilteredRowModel()?.rows.length === 0 || data?.length === 0) {
      return (
        <tbody>
          <tr className="odd:bg-white even:bg-gray-50 ">
            <td colSpan={columns.length} className="text-center py-20 text-2xl">
              {dataNotFoundQuery ? dataNotFoundQuery : "No data found"}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="hover:bg-gray-50 odd:bg-white even:bg-[#f7f7f7] "
          >
            {row.getVisibleCells().map((cell) => {
              if (cell.column.columnDef.isHide) return null;
              return (
                <td
                  key={cell.id}
                  className="px-4 py-2 text-sm font-medium text-[#030712] border-t border-r last:border-r-0 first:border-l-0"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  };

  const handleResetFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  return (
    <div className="p-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div className="flex gap-2">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search"
          />
          {table.getAllLeafColumns().map((column) => {
            const filterVariant = column.columnDef.meta?.filterVariant;
            const defaultLabel = column.columnDef.meta?.defaultLabel;

            // DATE filter
            if (filterVariant === "date") {
              return (
                <input
                  key={column.id}
                  type="date"
                  className="px-2 py-1 border rounded text-sm"
                  value={
                    columnFilters.find((f) => f.id === column.id)?.value ?? ""
                  }
                  onChange={(e) =>
                    setColumnFilters((old) =>
                      [
                        ...old.filter((f) => f.id !== column.id),
                        e.target.value
                          ? { id: column.id, value: e.target.value }
                          : null,
                      ].filter(Boolean)
                    )
                  }
                />
              );
            }

            // SELECT filter
            if (filterVariant === "select") {
              return (
                <select
                  key={column.id}
                  className="px-2 py-1 border rounded text-sm"
                  value={
                    columnFilters.find((f) => f.id === column.id)?.value ?? ""
                  }
                  onChange={(e) =>
                    setColumnFilters((old) =>
                      [
                        ...old.filter((f) => f.id !== column.id),
                        e.target.value
                          ? { id: column.id, value: e.target.value }
                          : null,
                      ].filter(Boolean)
                    )
                  }
                >
                  <option value="">{defaultLabel || "All"}</option>
                  {[...new Set(data.map((d) => d[column.id]))].map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              );
            }

            return null; // all other columns use global search
          })}
        </div>

        <div className="flex gap-2 items-center">
          {/* Render additional actions if provided */}
          {additionalActions}
          
          {/* Reset */}
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 border rounded text-sm hover:bg-gray-100 shadow"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F7F8]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.column.columnDef.isHide) return null;

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-2 text-left font-medium text-gray-700 border-r last:border-0"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          onClick={
                            header.column.columnDef.isHideSort
                              ? undefined
                              : header.column.getToggleSortingHandler()
                          }
                          className="flex items-center gap-1 cursor-pointer select-none"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {{
                            asc: <span>↑</span>,
                            desc: <span>↓</span>,
                          }[header.column.getIsSorted()] ??
                            (header.column.columnDef.isHideSort ? null : (
                              <SortBothSideVerticalIcon />
                            ))}
                        </div>
                      )}
                      {/* {header.column.getCanFilter() && (
                        <div className="mt-1">
                          <Filter column={header.column} />
                        </div>
                      )} */}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          {TBody()}
        </table>
      </div>

      {/* Pagination */}
      {table.getFilteredRowModel()?.rows.length >= 10 ? (
        <div className="pt-5">
          <CustTablePagination table={table} />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------- FILTERS -------------------- */
// function Filter({ column }) {
//   const columnFilterValue = column.getFilterValue();
//   const { filterVariant } = column.columnDef.meta ?? {};

//   if (filterVariant === "range") {
//     return (
//       <div className="flex gap-2">
//         <DebouncedInput
//           type="number"
//           value={columnFilterValue?.[0] ?? ""}
//           onChange={(value) => column.setFilterValue((old) => [value, old?.[1]])}
//           placeholder="Min"
//           className="w-20 border rounded px-2 py-1"
//         />
//         <DebouncedInput
//           type="number"
//           value={columnFilterValue?.[1] ?? ""}
//           onChange={(value) => column.setFilterValue((old) => [old?.[0], value])}
//           placeholder="Max"
//           className="w-20 border rounded px-2 py-1"
//         />
//       </div>
//     );
//   }

//   if (filterVariant === "select") {
//     return (
//       <select
//         className="border rounded px-2 py-1 text-sm"
//         onChange={(e) => column.setFilterValue(e.target.value === "All" ? undefined : e.target.value)}
//         value={columnFilterValue ?? "All"}
//       >
//         <option value="All">All</option>
//         {[...column.getFacetedUniqueValues().keys()].map((value) => (
//           <option key={value} value={value}>
//             {value?.toString()}
//           </option>
//         ))}
//       </select>
//     );
//   }

//   if (filterVariant === "boolean") {
//     return (
//       <select
//         className="border rounded px-2 py-1 text-sm"
//         onChange={(e) => {
//           const val = e.target.value;
//           column.setFilterValue(val === "All" ? undefined : val === "true");
//         }}
//         value={
//           columnFilterValue === undefined
//             ? "All"
//             : columnFilterValue === true
//             ? "true"
//             : "false"
//         }
//       >
//         <option value="All">All</option>
//         <option value="true">{column.columnDef.meta?.filterLabels?.trueLabel ?? "Yes"}</option>
//         <option value="false">{column.columnDef.meta?.filterLabels?.falseLabel ?? "No"}</option>
//       </select>
//     );
//   }

//   return (
//     <DebouncedInput
//       value={columnFilterValue ?? ""}
//       onChange={(value) => column.setFilterValue(value)}
//       placeholder="Search..."
//       className="w-32 border rounded px-2 py-1"
//     />
//   );
// }

/* -------------------- INPUT -------------------- */
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="relative w-[300px]">
      {/* Search Icon */}
      <Search
        color="#84818A"
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
      />

      {/* Input */}
      <input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`border rounded p-3 pl-10 text-sm bg-[#F7F7F8] w-full ${
          props.className || ""
        }`}
      />
    </div>
  );
};