export default function LogoutIcon({
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
        d="M3.33329 14.6667C2.96511 14.6667 2.66663 14.3682 2.66663 14V2.00001C2.66663 1.63182 2.96511 1.33334 3.33329 1.33334H12.6666C13.0348 1.33334 13.3333 1.63182 13.3333 2.00001V4.00001H12V2.66668H3.99996V13.3333H12V12H13.3333V14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667H3.33329ZM12 10.6667V8.66668H7.33329V7.33334H12V5.33334L15.3333 8.00001L12 10.6667Z"
        fill={color}
      />
    </svg>
  );
}
