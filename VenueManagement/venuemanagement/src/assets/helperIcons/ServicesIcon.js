export default function ServicesIcon({
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
        d="M12.6667 6.53334H10.6667C9.93337 6.53334 9.33337 5.93334 9.33337 5.2V3.2C9.33337 2.46667 9.93337 1.86667 10.6667 1.86667H12.6667C13.4 1.86667 14 2.46667 14 3.2V5.2C14 5.93334 13.4 6.53334 12.6667 6.53334Z"
        fill={color}
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.33333 13.8666H3.33333C2.6 13.8666 2 13.2666 2 12.5333V10.5333C2 9.79998 2.6 9.19998 3.33333 9.19998H5.33333C6.06667 9.19998 6.66667 9.79998 6.66667 10.5333V12.5333C6.66667 13.2666 6.06667 13.8666 5.33333 13.8666Z"
        fill={color}
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14 11.4667C12.7334 11.4667 11.6667 12.5333 11.6667 13.8C11.6667 12.5333 10.6 11.4667 9.33337 11.4667C10.6 11.4667 11.6667 10.4 11.6667 9.13333C11.6667 10.4667 12.7334 11.4667 14 11.4667Z"
        fill={color}
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.3334 4.13333L4.3334 6.13333L2.3334 4.13333C1.86673 3.66666 1.86673 2.93333 2.3334 2.46666C2.5334 2.26666 2.86673 2.13333 3.1334 2.13333C3.40007 2.13333 3.7334 2.26666 3.9334 2.46666L4.26673 2.8L4.66673 2.53333C5.1334 2.06666 5.86673 2.06666 6.3334 2.53333C6.80007 3 6.80007 3.73333 6.3334 4.13333Z"
        fill={color}
        stroke={color}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
