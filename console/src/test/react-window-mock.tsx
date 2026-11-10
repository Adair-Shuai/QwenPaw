import React from "react";

export const FixedSizeList = <T,>({
  children,
  itemData,
  itemCount,
}: {
  children: React.ComponentType<{
    index: number;
    style: React.CSSProperties;
    data: T;
  }>;
  itemData: T;
  itemCount: number;
}) => {
  const Row = children;
  return (
    <>
      {Array.from({ length: itemCount }, (_, i) => (
        <Row key={i} index={i} style={{}} data={itemData} />
      ))}
    </>
  );
};

export default { FixedSizeList };
