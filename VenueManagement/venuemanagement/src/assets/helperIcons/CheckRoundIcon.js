export default function CheckRoundIcon({
  width = 16,
  height = 15,
  color = "#51009E",
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
        d="M2 7.5C2 4.18629 4.68629 1.5 8 1.5C11.3137 1.5 14 4.18629 14 7.5C14 10.8137 11.3137 13.5 8 13.5C4.68629 13.5 2 10.8137 2 7.5ZM8 0C3.85786 0 0.5 3.35786 0.5 7.5C0.5 11.6421 3.85786 15 8 15C12.1421 15 15.5 11.6421 15.5 7.5C15.5 3.35786 12.1421 0 8 0ZM12.0928 5.59283L11.0322 4.53217L7.25 8.31435L5.15533 6.21968L4.09467 7.28032L7.25 10.4356L12.0928 5.59283Z"
        fill={color}
      />
    </svg>
  );
}
