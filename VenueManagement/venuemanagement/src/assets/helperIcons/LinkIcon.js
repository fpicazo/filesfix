export default function LinkIcon({
  width = 14,
  height = 15,
  color = "#AEADAF",
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
        d="M5.5 3V4.5H1.75V12.75H10V9H11.5V13.5C11.5 13.9142 11.1642 14.25 10.75 14.25H1C0.58579 14.25 0.25 13.9142 0.25 13.5V3.75C0.25 3.33579 0.58579 3 1 3H5.5ZM13.75 0.75V6.75H12.25L12.2499 3.30975L6.40532 9.15532L5.34467 8.09468L11.1887 2.25H7.75V0.75H13.75Z"
        fill={color}
      />
    </svg>
  );
}
