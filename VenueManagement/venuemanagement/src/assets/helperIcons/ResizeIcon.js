export default function ResizeIcon({
  width = 10,
  height = 10,
  color = "#A4A4A4",
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.11111 1L1 8.11111M9 5.44444L5.44444 9" stroke={color} />
    </svg>
  );
}
