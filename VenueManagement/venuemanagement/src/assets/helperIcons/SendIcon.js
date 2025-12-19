export default function SendIcon({
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
        d="M15.295 1.21768L11.205 15.5324C11.0918 15.9287 10.8484 15.9467 10.6672 15.5844L7.24994 8.74997L0.442116 6.02686C0.0598559 5.87396 0.0645883 5.64514 0.467653 5.51078L14.7823 0.739229C15.1786 0.607109 15.406 0.828966 15.295 1.21768ZM13.2764 2.82232L4.1091 5.87811L8.33654 7.5691L10.6171 12.1301L13.2764 2.82232Z"
        fill={color}
      />
    </svg>
  );
}
