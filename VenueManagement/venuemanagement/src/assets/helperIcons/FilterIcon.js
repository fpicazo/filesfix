export default function FinancialIcon({
  width = 14,
  height = 15,
  color = "#8E8C8F",
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.54167 8.66667C6.66925 8.66667 7.58333 9.58075 7.58333 10.7083C7.58333 11.8359 6.66925 12.75 5.54167 12.75C4.41409 12.75 3.5 11.8359 3.5 10.7083C3.5 9.58075 4.41409 8.66667 5.54167 8.66667Z"
        stroke={color}
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.45829 2.24999C9.58587 2.24999 10.5 3.16408 10.5 4.29166C10.5 5.41924 9.58587 6.33333 8.45829 6.33333C7.33071 6.33333 6.41663 5.41924 6.41663 4.29166C6.41663 3.16408 7.33071 2.24999 8.45829 2.24999Z"
        stroke={color}
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.25 4.29166H10.5"
        stroke={color}
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.41667 4.29166L1.75 4.29166"
        stroke={color}
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.25 10.7083H7.58337"
        stroke={color}
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3.5 10.7083H1.75"
        stroke={color}
        stroke-width="1.16667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
