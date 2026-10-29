import type { DatasetInfo } from "../contracts/types";

export type ScalarAssociation = "cell" | "point";

/** Explicit converter metadata wins; legacy sources remain readable. */
export function geometryPrimitive(dataset: DatasetInfo): "lines" | "triangles" {
  const primitive = dataset.metadata?.geometry_primitive;
  if (primitive === "lines" || primitive === "triangles") return primitive;
  // Tube converters emit triangles. Treating them as line pairs destroys the
  // surface and breaks segment selection and property coloring.
  return dataset.source === "network" ? "lines" : "triangles";
}

export function scalarAssociation(
  dataset: DatasetInfo,
  property: string,
  count: number,
  vertexCount: number,
): ScalarAssociation {
  const association =
    dataset.properties?.[property]?.association ??
    dataset.metadata?.scalar_association;
  if (association === "cell" || association === "point") return association;
  return ["las", "dlis", "wellbore", "network"].includes(
    dataset.source || "",
  ) && count === vertexCount
    ? "point"
    : "cell";
}

/** Validate before creating GPU resources; malformed binaries must not reach WebGL. */
export function decodeGeometry(
  dataset: DatasetInfo,
  positionBuffer: ArrayBuffer,
  indexBuffer: ArrayBuffer,
  cellIdBuffer?: ArrayBuffer,
) {
  const pointOnly =
    ["las", "dlis"].includes(dataset.source || "") &&
    dataset.n_indices === 0 &&
    dataset.n_cells === 0;
  if (
    !positionBuffer.byteLength ||
    positionBuffer.byteLength % 12 !== 0 ||
    (!pointOnly && !indexBuffer.byteLength) ||
    indexBuffer.byteLength % 4 !== 0
  ) {
    throw new Error("几何缓冲区为空或字节长度无效");
  }
  const positions = new Float32Array(positionBuffer);
  const indices = new Uint32Array(indexBuffer);
  const vertexCount = positions.length / 3;
  if (
    vertexCount !== dataset.n_vertices ||
    indices.length !== dataset.n_indices
  ) {
    throw new Error("几何缓冲区长度与数据目录声明不一致");
  }
  for (const value of positions) {
    if (!Number.isFinite(value)) throw new Error("坐标数据包含非有限值");
  }
  for (const index of indices) {
    if (index >= vertexCount) throw new Error("几何索引超出顶点范围");
  }
  // Old line converters used triangle-compatible degenerate indices. Enforce
  // the primitive arity only for the explicit modern contract.
  if (
    dataset.metadata?.geometry_primitive &&
    indices.length % (geometryPrimitive(dataset) === "lines" ? 2 : 3) !== 0
  ) {
    throw new Error("几何索引数量与图元类型不一致");
  }
  let cellIds: Uint32Array | undefined;
  if (cellIdBuffer) {
    if (
      (!pointOnly && !cellIdBuffer.byteLength) ||
      cellIdBuffer.byteLength % 4 !== 0
    )
      throw new Error("单元编号缓冲区无效");
    cellIds = new Uint32Array(cellIdBuffer);
    if (cellIds.length !== dataset.n_cells)
      throw new Error("单元编号数量与数据目录声明不一致");
  }
  return { positions, indices, cellIds };
}
