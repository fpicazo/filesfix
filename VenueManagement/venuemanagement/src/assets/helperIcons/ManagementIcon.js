export default function ManagementIcon({
  width = 20,
  height = 21,
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
        d="M15.8333 3H3.33329C2.41282 3 1.66663 3.74619 1.66663 4.66667V17.1667C1.66663 18.0872 2.41282 18.8333 3.33329 18.8333H15.8333C16.7538 18.8333 17.5 18.0872 17.5 17.1667V4.66667C17.5 3.74619 16.7538 3 15.8333 3Z"
        stroke={color}
        stroke-width="1.4"
        stroke-linejoin="round"
      />
      <path
        d="M8.75 6.75H13.75"
        stroke={color}
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M5.41663 6.75H6.24996"
        stroke={color}
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M5.41663 10.9167H6.24996"
        stroke={color}
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M5.41663 15.0833H6.24996"
        stroke={color}
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M8.75 10.9167H13.75"
        stroke={color}
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <path
        d="M8.75 15.0833H13.75"
        stroke={color}
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
  );
}
