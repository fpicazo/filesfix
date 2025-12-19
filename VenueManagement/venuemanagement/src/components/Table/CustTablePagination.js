import React from "react";

function CustTablePagination({ table }) {
  return (
    <div className="flex flex-col items-end py-2 gap-2">
      <div className="flex flex-row items-center gap-2 text-[#030712] font-medium text-sm">
        {/* First Page */}
        <button
          className="bg-[#240046] text-white px-2 py-1 rounded hover:bg-[#240046] disabled:opacity-40"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          ⏮
        </button>

        {/* Previous Page */}
        <button
          className="bg-[#240046] text-white px-2 py-1 rounded hover:bg-[#240046] disabled:opacity-40"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ◀
        </button>

        {/* Next Page */}
        <button
          className="bg-[#240046] text-white px-2 py-1 rounded hover:bg-[#240046] disabled:opacity-40"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          ▶
        </button>

        {/* Last Page */}
        <button
          className="bg-[#240046] text-white px-2 py-1 rounded hover:bg-[#240046] disabled:opacity-40"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          ⏭
        </button>

        {/* Page info */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-gray-700">Page</span>
          <span className="font-bold">
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>

        {/* Go to Page */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-gray-700">| Go to page:</span>
          <input
            type="number"
            min={1}
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border rounded px-2 py-1 w-20 text-sm focus:ring-2 focus:ring-indigo-500"
            onWheel={(e) => e.target.blur()} // prevent scroll change
          />
        </div>

        {/* Page Size */}
        <div className="relative">
          <select
            className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 25, 50, 75, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default CustTablePagination;
