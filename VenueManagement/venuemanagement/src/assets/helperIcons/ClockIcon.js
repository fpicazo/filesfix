export default function ClockIcon({
  width = 16,
  height = 16,
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
        d="M8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 7.99999C14.6667 4.3181 11.6819 1.33333 8.00004 1.33333C4.31814 1.33333 1.33337 4.3181 1.33337 7.99999C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667Z"
        stroke={color}
        stroke-width="1.2"
      />
      <path
        d="M8 4.66667V8.00001L9.66667 9.66667"
        stroke={color}
        stroke-width="1.2"
      />
    </svg>
  );
}
