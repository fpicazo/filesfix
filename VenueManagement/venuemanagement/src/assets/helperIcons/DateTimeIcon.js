<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
></svg>;

export default function DateTimeIcon({
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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.3333 8.83331C9.58436 8.83331 8.16663 10.251 8.16663 12C8.16663 13.7489 9.58436 15.1666 11.3333 15.1666C13.0822 15.1666 14.5 13.7489 14.5 12C14.5 10.251 13.0822 8.83331 11.3333 8.83331ZM11.8333 11.7044V10.3437H10.8333V12.294L12.3734 13.1462L12.8576 12.2712L11.8333 11.7044Z"
        fill={color}
      />
      <path
        d="M5.725 0.833313V2.13635H10.275V0.833313H11.575V2.13635H14.5V7.99998H13.2V6.49998H2.79997V13.8636H7.33333V15.1666H1.5V2.13635H4.425V0.833313H5.725Z"
        fill={color}
      />
    </svg>
  );
}
