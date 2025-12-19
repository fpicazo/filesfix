export default function SaveIcon({
  width = 14,
  height = 14,
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
        d="M3.25 12.25V7.75H10.75V12.25H12.25V3.87132L10.1287 1.75H1.75V12.25H3.25ZM1 0.25H10.75L13.75 3.25V13C13.75 13.4142 13.4142 13.75 13 13.75H1C0.58579 13.75 0.25 13.4142 0.25 13V1C0.25 0.58579 0.58579 0.25 1 0.25ZM4.75 9.25V12.25H9.25V9.25H4.75Z"
        fill={color}
      />
    </svg>
  );
}
