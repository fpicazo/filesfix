export default function BookingDateIcon({
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
        d="M10.8591 8.3906L11.9424 10.6638L14.5 10.8729L12.6545 12.6592L13.1727 15.1671L10.8591 13.9231L8.54566 15.1671L9.06386 12.6592L7.21826 10.8729L9.77586 10.6638L10.8591 8.3906Z"
        fill={color}
      />
      <path
        d="M5.725 0.833336V2.13637H10.275V0.833336H11.575V2.13637H14.5V9.33333H13.2V6.5H2.79997V13.8637H7.33333V15.1667H1.5V2.13637H4.425V0.833336H5.725Z"
        fill={color}
      />
    </svg>
  );
}
