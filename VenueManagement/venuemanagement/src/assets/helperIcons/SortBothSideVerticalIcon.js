export default function SortBothSideVerticalIcon({
  width = 12,
  height = 13,
  color = "#8E8C8F",
  fontSize = "intial",
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      fontSize={fontSize}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.62569 5.06691L6.22818 2.66942C6.15926 2.6005 6.04753 2.6005 5.97861 2.66942L3.58116 5.06691C3.46999 5.17808 3.54869 5.36816 3.70596 5.36816H8.50091C8.65813 5.36816 8.73686 5.17808 8.62569 5.06691Z"
        fill={color}
      />
      <path
        d="M3.58146 7.78661L5.97897 10.1841C6.04789 10.253 6.15962 10.253 6.22854 10.1841L8.62599 7.78661C8.73717 7.67543 8.65846 7.48535 8.50119 7.48535H3.70625C3.54902 7.48535 3.47029 7.67544 3.58146 7.78661Z"
        fill={color}
      />
    </svg>
  );
}
