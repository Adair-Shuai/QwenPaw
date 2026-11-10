// Original artwork from UGSci 专家头像工坊, version 2.
// Source commit bbb37ce0cef0f5841b225d7ae8ad6166a35eab64.
// https://ugsci-expert-avatar-studio.ssszforgpt.chatgpt.site/
const avatarScope = {};

/* UGSci field-specific silhouettes for health, learning and professional services. */
(function (scope) {
  "use strict";
  const solid = (d) => '<path fill-rule="evenodd" d="' + d + '"/>';
  const stroke = (d, w = 5) =>
    '<path d="' +
    d +
    '" fill="none" stroke="currentColor" stroke-width="' +
    w +
    '" stroke-linecap="round" stroke-linejoin="round"/>';
  const rect = (x, y, w, h, r = 0) =>
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    w +
    '" height="' +
    h +
    '" rx="' +
    r +
    '"/>';
  const dot = (x, y, r) =>
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  const ring = (x, y, r, w = 5) =>
    '<circle cx="' +
    x +
    '" cy="' +
    y +
    '" r="' +
    r +
    '" fill="none" stroke="currentColor" stroke-width="' +
    w +
    '"/>';

  // Every role contributes its own entire top silhouette. Dimensions share the original 128-unit grid.
  const role = (id, label, detail, art) => ({ id, label, detail, art });
  function field(id, label, code, cradle, motif, entries) {
    const art = new Map(entries.map((r) => [r.id, r.art]));
    return {
      id,
      label,
      code,
      cradle,
      motif,
      roles: entries.map(({ id, label, detail }) => ({ id, label, detail })),
      crown: (roleId) => art.get(roleId) || entries[0].art,
    };
  }

  const health = field(
    "health",
    "医疗健康",
    "MED",
    "storage",
    "听诊器、心电波形与关节结构",
    [
      role(
        "clinical",
        "临床诊疗专家",
        "两根耳管汇入听诊软管，另一端连接圆形听诊头。",
        stroke(
          "M35 16v7q1 12 15 12t15-12v-7 M50 35v3q0 9 15 9h4q15 0 15-11v-3",
          5.5,
        ) +
          dot(36, 16, 3.8) +
          dot(64, 16, 3.8) +
          ring(86, 25, 7.2, 5),
      ),
      role(
        "monitoring",
        "健康监测专家",
        "中央心电波形与两端电极连成一条监测线。",
        stroke("M21 36h20l8-12 9 21 11-30 10 21h27", 5.4) +
          dot(23, 36, 4.1) +
          dot(104, 36, 4.1),
      ),
      role(
        "rehab",
        "运动康复专家",
        "两段支具围合膝关节，枢轴外侧标出活动弧度。",
        solid("M41 15h11l16 13-6 7-17-11z M64 38l7-5 25 10-3 6-26-9z") +
          ring(65, 33, 7, 5) +
          stroke("M37 28q3 12 14 18 M33 22l1 3", 4.5),
      ),
    ],
  );

  const life = field(
    "life",
    "生命科学",
    "BIO",
    "geology",
    "双螺旋、显微镜与培养器皿",
    [
      role(
        "genomics",
        "基因组学专家",
        "两条螺旋链周期性交叉，粗连桥提示成对碱基。",
        stroke(
          "M21 18c14 0 18 26 34 26s21-26 37-26h12 M21 44c14 0 18-26 34-26s21 26 37 26h12",
          5.8,
        ) + stroke("M51 25v12 M92 25v12", 4.5),
      ),
      role(
        "microscopy",
        "显微成像专家",
        "倾斜的物镜、弧形镜架和载物台组成显微镜。",
        solid(
          "M46 19l11-8 5 5-3 3 10 12-9 8-11-13 2-2z M39 36h20v5H39z M35 44h52v5H35z",
        ) +
          stroke("M69 24c17-2 20 17 5 21", 5.8) +
          dot(70, 24, 4.8),
      ),
      role(
        "biochemistry",
        "生化实验专家",
        "锥形瓶中的液面和一支倾斜滴管区分实验岗位。",
        solid(
          "M43 14h20v5h-4v8l13 17q2 4-3 4H36q-4 0-2-4l14-17v-8h-5z M53 21v8l-6 8h14l-7-8v-8z",
        ) +
          solid("M76 29l12-15 7 5-12 15-6 2-5 7-3-2 5-8z") +
          dot(71, 45, 2.8),
      ),
    ],
  );

  const education = field(
    "education",
    "教育培训",
    "EDU",
    "storage",
    "展开书页、讲板与答题卡",
    [
      role(
        "curriculum",
        "课程设计专家",
        "对称的书页向两侧展开，中缝保留书脊。",
        solid(
          "M22 21q22-5 40 7v21Q46 39 22 41z M67 28q19-12 40-7v20q-24-2-40 8z M29 28v6q14-1 26 5v-6q-11-6-26-5z M75 33v6q11-6 25-5v-6q-15 0-25 5z",
        ),
      ),
      role(
        "teaching",
        "课堂教学专家",
        "讲板横框立在两只支脚上，板上留出粉笔书写线。",
        solid("M27 17h73v24H27z M33 23v12h61V23z") +
          stroke("M36 47l5-6 M90 47l-5-6 M39 29h15m7 0h10", 4.4) +
          rect(79, 32, 12, 4),
      ),
      role(
        "assessment",
        "学习评价专家",
        "两道作答横线对应一列批改勾，顶端的夹扣固定试卷。",
        solid("M31 19h22v-4h22v4h22v29h-6V25H37v23h-6z") +
          stroke("M43 31l3 3 5-6 M43 42l3 3 5-6 M59 31h24 M59 42h18", 3.9),
      ),
    ],
  );

  const finance = field(
    "finance",
    "金融财务",
    "FIN",
    "office",
    "算盘、行情烛线与核算凭证",
    [
      role(
        "accounting",
        "财务核算专家",
        "两根横杆穿过错落的算盘珠，矩形边框围住上下两排。",
        solid("M22 16h84v32H22z M28 21v22h72V21z") +
          stroke("M28 27h72 M28 37h72", 3.5) +
          rect(34, 22, 9, 10, 3) +
          rect(48, 22, 9, 10, 3) +
          rect(77, 32, 9, 10, 3) +
          rect(63, 32, 9, 10, 3),
      ),
      role(
        "investment",
        "投资研究专家",
        "高低不同的三根实体烛线与上下影线绘出行情走势。",
        stroke("M37 30v18 M64 18v26 M91 12v26", 4.2) +
          rect(30, 34, 14, 9, 1) +
          rect(57, 23, 14, 15, 1) +
          rect(84, 18, 14, 12, 1),
      ),
      role(
        "audit",
        "财务审计专家",
        "放大镜覆盖凭证的一角，留出两行待核的数据。",
        solid("M26 17h49l10 10v3h-7v-2H69v-5H32v20h32v5H26z") +
          stroke("M39 30h18 M39 37h12", 3.8) +
          ring(80, 35, 9, 5) +
          stroke("M87 42l9 6", 5.4),
      ),
    ],
  );

  const law = field(
    "law",
    "法律合规",
    "LAW",
    "integrity",
    "天平、法槌与合规印章",
    [
      role(
        "counsel",
        "法律咨询专家",
        "中心支柱支撑两只秤盘，平衡梁形成宽阔的横向剪影。",
        stroke(
          "M64 15v29 M40 22l24-4 24 4 M39 23l-8 12m8-12 8 12 M89 23l-8 12m8-12 8 12",
          4.4,
        ) +
          solid(
            "M26 34h26q-2 8-13 8t-13-8z M76 34h26q-2 8-13 8t-13-8z M53 43h22l6 5H47z",
          ) +
          dot(64, 16, 3.8),
      ),
      role(
        "disputes",
        "争议解决专家",
        "法槌斜举在底座上方，握柄与槌头形成直角。",
        solid(
          "M42 16l9-5 14 23-9 6z M36 18l6-4 14 23-6 4z M54 12l4-3 14 23-4 3z",
        ) +
          stroke("M60 25l34 18", 6.4) +
          solid("M28 46l4-6h23l5 6v2H28z"),
      ),
      role(
        "compliance",
        "合规审查专家",
        "印章的拱形握柄和水平印面落在文件签核线上。",
        solid("M54 34q6-5 5-10-1-10 8-10t8 10q-1 6 5 10l7 4v5H46v-5z") +
          stroke("M41 47h51 M27 28h18 M27 36h12", 4.4),
      ),
    ],
  );

  const design = field(
    "design",
    "创意设计",
    "DSN",
    "geology",
    "钢笔笔尖、产品棱面与交互指针",
    [
      role(
        "visual",
        "视觉设计专家",
        "钢笔尖位于贝塞尔控制柄之间，中空墨孔沿中缝连到笔锋。",
        stroke("M25 21h78", 3.7) +
          rect(21, 17, 8, 8, 1.1) +
          rect(99, 17, 8, 8, 1.1) +
          solid(
            "M54 16h20l8 16-18 18-18-18z M62 27q-4 3 0 6v10l2 3 2-3V33q4-3 0-6z",
          ),
      ),
      role(
        "product",
        "产品设计专家",
        "两块可装配的等轴棱面错位叠放，外侧留出装配缝。",
        stroke(
          "M31 30l22-12 22 12-22 12z M31 30v7l22 12 22-12v-7 M53 42v6",
          4.8,
        ) + stroke("M73 19l9-5 17 9-10 6 M86 32l13-8v8l-10 6", 4.5),
      ),
      role(
        "interaction",
        "交互设计专家",
        "界面含一行工具栏，操作指针从右下方覆盖内容区。",
        solid(
          "M26 16h69v16h-6v-6H32v17h34v5H26z M32 20v3h7v-3z M43 20v3h7v-3z",
        ) + solid("M72 27l25 11-11 3 4 7-5 2-4-8-6 7z"),
      ),
    ],
  );

  const media = field(
    "media",
    "传媒出版",
    "PUB",
    "office",
    "报刊版面、播音话筒与场记板",
    [
      role(
        "editorial",
        "编辑出版专家",
        "头版大标题、图文两栏和外侧折页形成报刊版面。",
        solid(
          "M25 16h67v9h10v19q0 5-6 5H31q-6 0-6-6z M31 22v6h54v-6z M32 33v10h17V33z M56 33v4h28v-4z M56 40v3h21v-3z M92 30v12q0 3 2 3t2-3V30z",
        ),
      ),
      role(
        "broadcast",
        "音频制作专家",
        "胶囊话筒坐在弧形支架上，两侧为逐级变化的声波。",
        rect(56, 11, 16, 24, 8) +
          stroke("M49 24q0 16 15 16t15-16 M64 40v5 M54 47h20", 4.7) +
          stroke("M29 29v6 M37 23v17 M91 23v17 M99 29v6", 4.8),
      ),
      role(
        "film",
        "影视制作专家",
        "斜举的黑白拍板与矩形场记板之间留出开合空间。",
        solid(
          "M27 26l67-15 2 9-67 15z M36 26l6-1 7 5-6 1z M57 21l6-1 7 5-6 1z M78 17l6-2 7 5-6 2z M29 36h68v13H29z M36 40v5h26v-5z M68 40v5h10v-5z",
        ),
      ),
    ],
  );

  const commerce = field(
    "commerce",
    "商业运营",
    "COM",
    "analysis",
    "店面遮阳篷、增长漏斗与采购纸箱",
    [
      role(
        "retail",
        "零售运营专家",
        "遮阳篷的三块布幅共享起伏的下沿，两侧立柱勾勒店面。",
        solid(
          "M30 17h68l7 18q-1 7-10 7-8 0-10-6-3 6-11 6-7 0-10-6-3 6-10 6-8 0-11-6-2 6-10 6-9 0-10-7z M48 22l-4 10 6 1 3-11z M75 22l3 11 6-1-4-10z",
        ) +
          rect(28, 40, 5, 8) +
          rect(95, 40, 5, 8),
      ),
      role(
        "growth",
        "增长运营专家",
        "宽口漏斗依次收窄，右侧的上行箭头表示转化增长。",
        solid("M25 17h55l-4 7H29z M33 29h39l-5 7H38z M43 41h20l-8 8h-6z") +
          stroke("M78 44l9-9 5 3 11-13", 5) +
          solid("M94 22l12-2-1 12z"),
      ),
      role(
        "procurement",
        "采购管理专家",
        "打开的纸箱露出两片箱盖，正面分区保留封箱接缝。",
        solid("M25 26l15-10 25 9 26-9 13 10-16 11-24-8-23 8z") +
          solid("M39 39l5 2 17-6v14l-22-6z M67 35l19 6 5-3v5l-24 7z"),
      ),
    ],
  );

  scope.UGSciHumanSectors = [
    health,
    life,
    education,
    finance,
    law,
    design,
    media,
    commerce,
  ];
})(avatarScope);

/* Additional UGSci expert crowns, drawn above the shared 128-unit face. */
(function (scope) {
  "use strict";

  const shape = (d) => '<path fill-rule="evenodd" d="' + d + '"/>';
  const line = (d, w = 5) =>
    '<path fill="none" stroke="currentColor" stroke-width="' +
    w +
    '" stroke-linecap="round" stroke-linejoin="round" d="' +
    d +
    '"/>';
  const rect = (x, y, w, h, r = 0) =>
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    w +
    '" height="' +
    h +
    '" rx="' +
    r +
    '"/>';
  const dot = (x, y, r) =>
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  const ring = (x, y, r, w = 5) =>
    '<circle cx="' +
    x +
    '" cy="' +
    y +
    '" r="' +
    r +
    '" fill="none" stroke="currentColor" stroke-width="' +
    w +
    '"/>';
  const role = (id, label, detail) => ({ id, label, detail });

  function software(id) {
    const brackets = line("M43 20 27 33l16 12M85 20l16 13-16 12", 6.5);
    if (id === "architecture")
      return (
        brackets +
        line("M64 20v11M52 42v-8h24v8", 4.5) +
        rect(59, 14, 10, 9, 1.4) +
        rect(48, 39, 8, 8, 1) +
        rect(72, 39, 8, 8, 1)
      );
    if (id === "testing") return brackets + line("m50 33 9 9 18-21", 6.6);
    return brackets + shape("M68 14h7L60 48h-7Z");
  }

  function security(id) {
    if (id === "monitoring")
      return (
        line("M25 46v-8c13-14 25-19 39-19s28 6 39 19v8", 6) +
        shape(
          "M39 39q24-24 50 0-25 20-50 0Zm16-1a9 9 0 1 0 18 0 9 9 0 1 0-18 0Z",
        ) +
        dot(64, 38, 4)
      );
    if (id === "response")
      return (
        shape(
          "M25 45V29h10l7-11h25v6H46l-7 11h-8v10ZM97 45V32l-9-7v-7l15 12v15Z",
        ) + shape("M66 15h15l-9 13h13L61 49l5-15H55Z")
      );
    return (
      line("M43 34V27c0-19 42-19 42 0v7", 7) +
      shape("M30 30h68v18H30Zm29 9a5 5 0 0 0 3 4v3h4v-3a5 5 0 1 0-7-4Z") +
      rect(22, 35, 5, 10, 1) +
      rect(101, 35, 5, 10, 1)
    );
  }

  function manufacturing(id) {
    if (id === "line")
      return (
        shape(
          "M25 35h78a6 6 0 0 1 0 12H25a6 6 0 0 1 0-12Zm1.5 6a3 3 0 1 0 6 0 3 3 0 1 0-6 0Zm68 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z",
        ) +
        shape("M30 31V21l6-5h15v15ZM58 31V21l6-5h15v15Z") +
        rect(87, 16, 7, 16, 2)
      );
    if (id === "maintenance")
      return (
        shape("M30 38l10-11q-4-13 7-18l3 9 7 2 6-6q7 13-8 20l-14 15h-7Z") +
        line("M66 40a16 16 0 0 1 32 0", 6) +
        line("M82 40l7-10", 4.5) +
        rect(64, 44, 37, 4, 1.5)
      );
    return (
      rect(19, 42, 29, 6, 1.6) +
      shape("M24 41 30 27l8 2 4 12Z") +
      line("M34 30 57 15l24 9", 7) +
      ring(57, 15, 5.8, 4.5) +
      dot(34, 30, 5) +
      line("M81 24l-4 11 7 7m-3-18 12 6-2 10", 5.7)
    );
  }

  function civil(id) {
    if (id === "building")
      return (
        shape("M22 37 57 14l21 12 12-8 18 13-4 5-14-10-11 7-21-11-32 21Z") +
        shape("M31 40 37 36v11h-6ZM61 28l6 3v16h-6ZM91 31l6 4v12h-6Z")
      );
    if (id === "surveying")
      return (
        shape(
          "M37 22 85 13l4 9-49 9Z M54 32l15-3 3 6h-7l-9 13h-7l10-13h-5ZM70 35h7l11 13h-7Z",
        ) +
        line("M36 24l2 8m50-20 2 11", 4) +
        rect(26, 42, 13, 5, 1.4) +
        rect(91, 42, 13, 5, 1.4)
      );
    return shape(
      "M17 41h15Q43 19 59 15q6-2 11 0 17 6 28 26h13v6H17Zm22 0h11V29q-7 6-11 12Zm16-16v16h7V21Zm12-4v20h7V24Zm12 6v14h12q-5-9-12-14Z",
    );
  }

  function ecology(id) {
    if (id === "water")
      return (
        shape(
          "M64 10q-14 14-14 21a14 14 0 0 0 28 0q0-8-14-21Zm7 18q2 8-6 10l1 4q11-3 9-14Z",
        ) + line("M23 43q7-6 15 0t15 0m22 0q8-6 16 0t15 0", 4.9)
      );
    if (id === "air")
      return (
        line(
          "M24 28h46q12 0 12-9c0-8-12-10-16-3m-31 20h52q12 0 12 10M22 44h32",
          5.8,
        ) + dot(28, 18, 3.5)
      );
    return (
      shape(
        "M32 42Q38 17 65 17q15 0 29-7-2 34-25 38-16 2-25-5-4 3-8 6l-6-3q10-12 28-17l17-5q-25 1-43 18Z",
      ) + line("M23 48q10-10 18-14", 4.2)
    );
  }

  function agriculture(id) {
    if (id === "irrigation")
      return (
        line("M64 46V30m0 4Q54 14 38 22m26 12q12-20 27-13", 5.6) +
        shape(
          "M37 28q-9 9-9 12a6 6 0 0 0 12 0q0-4-3-12ZM94 27q-5 7-5 10a5 5 0 1 0 10 0q0-3-5-10Z",
        ) +
        rect(48, 43, 32, 5, 2)
      );
    if (id === "orchard")
      return shape(
        "M27 38q-8-5-3-13 2-4 7-5 2-8 11-8 10 0 14 9 10 2 8 11-1 6-9 7h-8v9h-6v-9Zm50 2q-7-2-6-9 0-6 6-8 2-6 8-6 8-1 11 5 10 1 9 10 0 7-9 8h-6v8h-5v-8Z",
      );
    return shape(
      "M63 48V14h5v34Zm1-22Q50 23 47 15q13-1 17 11Zm1 10Q47 33 42 23q17-1 23 13Zm0 10Q47 43 39 33q19 0 26 13Zm2-22q4-10 16-14 0 11-16 14Zm0 10q7-13 23-16-1 13-23 16Zm0 11q6-13 24-16-3 12-24 16Z",
    );
  }

  function logistics(id) {
    if (id === "warehouse")
      return (
        shape(
          "M20 29 63 12l43 17-3 5-7-3v15h-7V28l-26-9-27 10v17h-7V31l-7 3Z",
        ) + shape("M43 35h15v12H43Zm18-9h15v9H61Zm0 12h22v9H61Z")
      );
    if (id === "routing")
      return (
        line("M31 42h16q7 0 7-7v-4q0-7 8-7h13", 5) +
        shape(
          "M89 13q-13 0-13 13 0 7 13 19 13-12 13-19 0-13-13-13Zm-5 13a5 5 0 1 0 10 0 5 5 0 1 0-10 0Z",
        ) +
        ring(26, 42, 4.5, 4)
      );
    return (
      shape(
        "M23 19h51v21H52q-2-6-9-6t-9 6H22Zm56 7h14l12 13v3h-7q-2-7-9-7t-9 7h-4V26Zm6 5v6h10l-5-6Z",
      ) +
      ring(43, 42, 4.8, 4.2) +
      ring(89, 42, 4.8, 4.2)
    );
  }

  function aerospace(id) {
    if (id === "satellite")
      return (
        shape(
          "M51 24 65 14l15 13-15 14Zm-28 10 21-14 7 10-21 14Zm52 3 21-15 9 10-21 16Z",
        ) + line("m44 32 10-6m18 6 10 4m-19 4-8 7", 4.4)
      );
    if (id === "propulsion")
      return shape(
        "M39 46q5-15 21-24 16-10 38-10-6 20-25 30-7 4-19 6l4-10-10-2Zm35-21a5 5 0 1 0 10 0 5 5 0 1 0-10 0ZM39 38l9-2-5 8-16 5ZM52 26q-6 0-14 5l6-10 18-1Z",
      );
    return shape(
      "M18 35l11-3 9 3 16-3L42 17l9-2 22 14 20-3q11-2 16 4-1 5-14 8l-25 3-5 7-10 1 3-7-23 1Z",
    );
  }

  scope.UGSciEngineeringSectors = [
    {
      id: "software",
      label: "软件工程",
      code: "SWE",
      motif: "代码括号、分支与校验钩",
      cradle: "analysis",
      crown: software,
      roles: [
        role("development", "软件开发专家", "成对的代码括号包住倾斜的分隔线。"),
        role(
          "architecture",
          "软件架构专家",
          "括号中的主节点分出两条架构支路。",
        ),
        role("testing", "软件测试专家", "测试通过的对勾嵌入代码括号。"),
      ],
    },
    {
      id: "security",
      label: "网络安全",
      code: "SEC",
      motif: "门锁、监测眼与响应闪电",
      cradle: "integrity",
      crown: security,
      roles: [
        role("access", "访问控制专家", "拱形锁梁扣入中央带钥匙孔的锁体。"),
        role("monitoring", "威胁监测专家", "防护拱下嵌入一只监测眼。"),
        role(
          "response",
          "应急响应专家",
          "防护框的开口露出表示快速处置的闪电。",
        ),
      ],
    },
    {
      id: "manufacturing",
      label: "智能制造",
      code: "MFG",
      motif: "机械臂、输送带与检修仪表",
      cradle: "drilling",
      crown: manufacturing,
      roles: [
        role("robotics", "工业机器人专家", "双关节机械臂在底座上伸出夹爪。"),
        role("line", "产线规划专家", "两块工件排在带有两端滚轮的输送带上。"),
        role("maintenance", "设备维护专家", "开口扳手与指针仪表并列。"),
      ],
    },
    {
      id: "civil",
      label: "建筑工程",
      code: "CIV",
      motif: "拱桥、屋架与测量仪",
      cradle: "office",
      crown: civil,
      roles: [
        role("bridge", "桥梁结构专家", "拱肋和竖向吊杆共同托起水平桥面。"),
        role("building", "建筑设计专家", "高低错落的两座屋架由立柱支承。"),
        role("surveying", "工程测量专家", "略微倾斜的测量望远镜支在三脚架上。"),
      ],
    },
    {
      id: "ecology",
      label: "生态环境",
      code: "ENV",
      motif: "叶脉、水波与风流线",
      cradle: "storage",
      crown: ecology,
      roles: [
        role(
          "restoration",
          "生态修复专家",
          "叶梢上扬，留白沿叶片弧度形成主脉。",
        ),
        role("water", "水环境专家", "一滴水落在两段连续水波之间。"),
        role("air", "空气监测专家", "水平气流分层延伸并在尾部回卷。"),
      ],
    },
    {
      id: "agriculture",
      label: "现代农业",
      code: "AGR",
      motif: "麦穗、喷灌水流与果树冠",
      cradle: "geology",
      crown: agriculture,
      roles: [
        role("breeding", "作物育种专家", "饱满的麦粒沿着穗轴左右排列。"),
        role(
          "irrigation",
          "智慧灌溉专家",
          "喷头向两侧送水，末端水滴单独可见。",
        ),
        role("orchard", "果园管理专家", "两棵不同高度的果树展开圆润树冠。"),
      ],
    },
    {
      id: "logistics",
      label: "交通物流",
      code: "LOG",
      motif: "货车、仓顶与路线节点",
      cradle: "analysis",
      crown: logistics,
      roles: [
        role(
          "dispatch",
          "运输调度专家",
          "箱式货车的车厢、驾驶室和双轮连成一体。",
        ),
        role("warehouse", "仓储物流专家", "人字形仓顶下分层码放货箱。"),
        role("routing", "路径规划专家", "弯折路径从起点连接到定位标记。"),
      ],
    },
    {
      id: "aerospace",
      label: "航空航天",
      code: "AER",
      motif: "机翼、太阳翼与推进尾焰",
      cradle: "drilling",
      crown: aerospace,
      roles: [
        role("aircraft", "飞行器设计专家", "机翼从流线形机身后掠展开。"),
        role("satellite", "卫星系统专家", "两块平板太阳翼沿星体两侧展开。"),
        role("propulsion", "航天推进专家", "尖锥机体斜向上升，尾部留出喷流。"),
      ],
    },
  ];
})(avatarScope);

/* UGSci avatar artwork. Each character is a self-contained, single-ink, 128-unit vector. */
(function (scope) {
  "use strict";

  const role = (id, label, detail) => ({ id, label, detail });
  const domains = [
    {
      id: "storage",
      label: "储气库",
      code: "UGS",
      motif: "背斜盖层、注采井与气藏剖面",
      roles: [
        role(
          "capacity",
          "库容评估专家",
          "双层背斜包裹含气区，偏置井线抵达储层。",
        ),
        role("cycling", "注采运行专家", "盖层两端嵌入方向相反的注采箭头。"),
        role("seal", "动态密封专家", "封闭的双层盖岩在构造顶部加厚。"),
      ],
    },
    {
      id: "oil",
      label: "石油开发",
      code: "OIL",
      motif: "游梁、驴头与曲柄支架",
      roles: [
        role("lifting", "采油工程专家", "长游梁连接弧形驴头和曲柄配重。"),
        role(
          "recovery",
          "提高采收率专家",
          "游梁外伸，储层上方的回流箭头表示再动用。",
        ),
        role(
          "waterflood",
          "注水开发专家",
          "游梁与侧面的注水井组构成双井结构。",
        ),
      ],
    },
    {
      id: "gas",
      label: "天然气",
      code: "GAS",
      motif: "管线弯头、法兰与调压仪表",
      roles: [
        role(
          "transmission",
          "管输调度专家",
          "两级弯头与出口法兰形成连续的输气路径。",
        ),
        role("pressure", "调压计量专家", "管汇中央嵌入圆形指针压力表。"),
        role("gathering", "集输工程专家", "两条支管接入同一根集气干线。"),
      ],
    },
    {
      id: "office",
      label: "协同办公",
      code: "OFC",
      motif: "分层文件夹与折页",
      roles: [
        role("document", "公文写作专家", "前后叠放的文件页共用一个折角。"),
        role("schedule", "计划统筹专家", "两个装订环连接日历页与日期格。"),
        role("review", "合同审查专家", "签批页顶部保留折角和校阅对勾。"),
      ],
    },
    {
      id: "geology",
      label: "地质勘探",
      code: "GEO",
      motif: "倾斜层理、断面与岩心",
      roles: [
        role("strata", "地层解释专家", "倾斜的层理在两翼错落露出。"),
        role("seismic", "地震解释专家", "连续波形叠在一层起伏的反射界面上。"),
        role("core", "岩心分析专家", "岩样圆柱露出椭圆顶面与倾斜层纹。"),
      ],
    },
    {
      id: "drilling",
      label: "钻完井",
      code: "DRL",
      motif: "井架、钻柱与套管",
      roles: [
        role("drilling", "钻井工程专家", "三角井架展开，天车和交叉支撑居中。"),
        role(
          "trajectory",
          "井眼轨迹专家",
          "立架右侧的井眼由垂直段转入水平段。",
        ),
        role("completion", "完井工程专家", "井架下方露出逐级收缩的套管层级。"),
      ],
    },
    {
      id: "analysis",
      label: "数据科学",
      code: "DAT",
      motif: "采样阵列、趋势线与数据机架",
      roles: [
        role("modeling", "建模分析专家", "分级的数据柱组成有节奏的阶梯轮廓。"),
        role("forecast", "时序预测专家", "折线穿过观测节点，指向延伸的趋势。"),
        role("quality", "数据质检专家", "横向机架上的校验格逐行对齐。"),
      ],
    },
    {
      id: "integrity",
      label: "安全完整性",
      code: "INT",
      motif: "防护盾、隔离屏障与收尖护框",
      roles: [
        role(
          "formation",
          "地质体完整性专家",
          "分层屏障位于护盾中央，外框收成盾尖。",
        ),
        role(
          "wellbarrier",
          "井筒完整性专家",
          "护盾内嵌同心套管，表示多级井筒屏障。",
        ),
        role("risk", "风险预警专家", "三角告警标记嵌入防护盾的上缘。"),
      ],
    },
  ];

  const shape = (d) => '<path d="' + d + '" fill-rule="evenodd"/>';
  const line = (d, w) =>
    '<path d="' +
    d +
    '" fill="none" stroke="currentColor" stroke-width="' +
    w +
    '" stroke-linejoin="round" stroke-linecap="round"/>';
  const rect = (x, y, w, h, rx = 0) =>
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    w +
    '" height="' +
    h +
    '" rx="' +
    rx +
    '"/>';
  const dot = (x, y, r) =>
    '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  const ring = (x, y, r, w) =>
    '<circle cx="' +
    x +
    '" cy="' +
    y +
    '" r="' +
    r +
    '" fill="none" stroke="currentColor" stroke-width="' +
    w +
    '"/>';
  const band = (d) => line(d, 4.4);

  // These are the actual head shapes, not accessory badges. All knockouts stay transparent.
  const cradles = {
    storage:
      "M18 57 24 51H31V75C31 85 37 92 48 92H80C91 92 97 85 97 75V51H104L110 57V76C110 95 99 106 81 106H47C29 106 18 95 18 76Z",
    oil: "M16 56 23 49 30 53V75C30 85 38 92 48 92H81Q98 92 98 75V50L106 53 111 63 108 80Q105 106 81 106H47Q24 106 20 86L16 77Z",
    gas: "M17 57H31V74Q31 92 49 92H79Q97 92 97 74V57H111V76Q111 106 81 106H47Q17 106 17 76Z",
    office:
      "M18 57 24 51H31V76Q31 86 39 90L47 93H81L97 79V52H105L110 57V84L88 105H44L28 99 18 86Z",
    geology:
      "M18 58 24 51H31V74L39 85 49 92H80Q97 90 97 75V51H104L111 59 108 82 99 98 83 106H47L30 100 19 86Z",
    drilling:
      "M17 59 24 50H31V75L40 87 48 92H80L88 87 97 75V50H104L111 59 108 81 96 98 81 106H47L32 98 20 81Z",
    analysis:
      "M18 56 23 51H31V77L37 87 47 92H81L91 87 97 77V51H105L110 56V83L99 98 84 106H44L29 98 18 83Z",
    integrity:
      "M19 55 26 50H32V73Q32 83 43 88L64 97 85 88Q96 83 96 73V50H102L109 55V76Q109 92 92 100L64 113 36 100Q19 92 19 76Z",
  };

  function storage(r) {
    if (r === "cycling")
      return (
        shape("M24 46Q62 9 104 46H94Q63 21 35 46Z M40 47Q64 27 89 47Z") +
        shape(
          "M22 24H28V33H34L25 43 16 33H22Z M97 27 106 17 115 27H109V36H103V27Z",
        )
      );
    if (r === "seal")
      return (
        shape(
          "M20 46Q32 34 44 26Q55 19 64 18Q81 19 107 46H96Q75 28 64 27Q52 28 31 46Z M36 47Q63 21 91 47Z",
        ) + shape("M55 18V14L64 10 73 14V18L64 23Z")
      );
    return (
      shape("M20 47Q64 1 108 47H98Q64 14 30 47Z M37 48Q64 21 91 48Z") +
      shape("M79 15H92V19H88V33L83 29V19H79Z")
    );
  }

  function pumphead(beam, head, pivotX, pivotY) {
    return shape(beam) + shape(head) + dot(pivotX, pivotY, 3.7);
  }
  function oil(r) {
    if (r === "recovery")
      return (
        pumphead(
          "M30 23 90 17 94 22 34 29Z",
          "M23 21Q27 17 33 20L38 26Q34 34 29 39L23 37Q27 29 23 21Z",
          57,
          24,
        ) +
        shape("M54 26H60L71 48H63L57 34 49 48H42Z") +
        line("M86 24 90 35", 3.8) +
        shape("M78 36Q90 31 99 40L104 37 104 48H92L96 44Q89 38 80 43Z")
      );
    if (r === "waterflood")
      return (
        pumphead(
          "M29 17 77 25 81 31 34 23Z",
          "M25 15Q32 13 36 19L35 27 28 37 24 35Q28 24 25 15Z",
          53,
          24,
        ) +
        shape("M50 27H56L66 48H59L53 34 47 48H40Z") +
        line("M73 29 73 44", 3.8) +
        shape("M87 33H93V40H98V28H94L101 20 108 28H104V46H87Z")
      );
    return (
      pumphead(
        "M28 18 88 27 96 34 32 25Z",
        "M22 18Q27 13 33 16L38 24Q36 32 29 40L22 39Q28 26 22 18Z",
        56,
        24,
      ) +
      shape("M52 28H60L71 48H63L56 34 49 48H41Z") +
      line("M87 32 85 43", 4.3) +
      shape("M76 45Q77 35 87 36Q96 37 97 46Z")
    );
  }

  function gas(r) {
    if (r === "pressure")
      return (
        line("M25 47V40H49M77 40H101V48", 7) +
        ring(63, 31, 13, 5.2) +
        line("M63 32 69 24", 3.9) +
        dot(63, 32, 2.6) +
        rect(23, 35, 4.6, 10, 1) +
        rect(97, 35, 6, 10, 1)
      );
    if (r === "gathering")
      return (
        line("M28 24H41L63 42H98M32 46H43L54 38M76 24V42", 6.8) +
        rect(25, 18, 5, 13, 1) +
        rect(70, 20, 12, 5, 1) +
        rect(94, 34, 5, 16, 1)
      );
    return (
      line("M23 45H45V34Q45 26 54 26H82V39Q82 43 87 43H104", 7.6) +
      rect(22, 38, 5, 14, 1) +
      rect(59, 19, 5.5, 15, 1) +
      rect(98, 35.5, 5.5, 15, 1)
    );
  }

  function office(r) {
    if (r === "schedule")
      return (
        shape("M27 25H101V48H95V35H33V48H27Z") +
        rect(38, 17, 7, 14, 3) +
        rect(83, 17, 7, 14, 3) +
        rect(40, 38, 10, 8, 1.3) +
        rect(57, 38, 10, 8, 1.3) +
        rect(74, 38, 10, 8, 1.3)
      );
    if (r === "review")
      return (
        shape("M30 47V20H79L95 34V47H89V36H75V26H36V47Z M79 27V32H85Z") +
        line("M43 36 49 42 61 31", 5)
      );
    return (
      shape("M25 47V28H32V21H76V25H38V28H80L94 41V48H88V42H77V34H31V47Z") +
      line("M40 42H63", 3.6) +
      shape("M61 16H81L99 32V43H95V34L79 20H61Z")
    );
  }

  function geology(r) {
    if (r === "seismic")
      return (
        line("M20 35H34L43 27 51 41 61 17 72 41 81 29 89 35H105", 4.8) +
        shape(
          "M22 47Q37 44 50 47Q65 50 76 44Q91 36 105 40L104 46Q94 44 82 49L74 51H49Q38 46 24 51Z",
        )
      );
    if (r === "core")
      return (
        shape(
          "M43 26Q43 17 62 16Q82 16 84 25V43Q81 51 64 51Q46 51 43 43Z M49 25Q50 28 63 28Q75 28 78 25Q75 22 63 22Q52 22 49 25Z M49 42Q60 40 78 32V37Q66 43 52 46Z",
        ) + shape("M24 44 37 39V45L26 49Z M88 38 102 33V40L88 46Z")
      );
    return shape(
      "M19 41 39 35Q48 33 54 28L68 17 76 20Q80 24 87 21L103 15 107 22 90 28Q80 31 72 26L59 35Q51 41 42 43L24 48Z M36 49 53 42Q62 39 72 31Q81 36 92 31L105 27 106 34 91 39Q80 43 74 39L60 48 55 50Z M76 48 104 39 103 46 88 51H76Z",
    );
  }

  const derrick =
    shape("M43 48 56 18H73L86 48H78L68 24H61L51 48Z") +
    rect(54, 15, 21, 5, 1) +
    line("M56 37 72 29M55 35 74 42", 3.7);
  function drilling(r) {
    if (r === "trajectory")
      return (
        shape("M31 47 44 18H58L72 47H64L54 24H49L39 47Z") +
        rect(42, 15, 18, 5, 1) +
        line("M43 37 57 29", 4) +
        line("M81 20V31Q81 42 92 42H103", 5.4) +
        shape("M97 35 107 42 97 49Z")
      );
    if (r === "completion")
      return (
        shape("M38 41 53 19H75L90 41H81L71 26H58L47 41Z") +
        rect(51, 16, 26, 5, 1) +
        rect(51, 36.5, 26, 5.3, 1.2) +
        rect(55, 44, 18, 5.6, 1.2) +
        shape("M41 44H48V49H37Z M80 44H87L91 49H80Z")
      );
    return derrick + rect(38, 44, 15, 5.5, 1) + rect(76, 44, 15, 5.5, 1);
  }

  function analysis(r) {
    if (r === "forecast")
      return (
        line("M24 42 41 31 56 38 77 22 96 26", 5.2) +
        dot(24, 42, 4.3) +
        dot(41, 31, 4.3) +
        dot(56, 38, 4.3) +
        dot(77, 22, 4.3) +
        shape("M92 18 107 27 91 33Z")
      );
    if (r === "quality")
      return (
        shape(
          "M26 20H90L102 30V33H26Z M34 24V29H40V24Z M47 24V29H63V24Z M26 38H102V48H26Z M34 41V45H40V41Z M47 41V45H63V41Z",
        ) + line("M84 40 88 44 96 37", 2.8)
      );
    return (
      rect(24, 36, 12, 12, 1.6) +
      rect(41, 26, 12, 22, 1.6) +
      rect(58, 16, 12, 32, 1.6) +
      rect(75, 22, 12, 26, 1.6) +
      rect(92, 32, 12, 16, 1.6)
    );
  }

  function integrity(r) {
    const wings = shape(
      "M22 40 44 29 46 36 26 47H21Z M83 29 106 40 107 47H102L81 36Z",
    );
    if (r === "risk")
      return (
        wings +
        shape(
          "M63 13Q65 12 67 15L86 43Q87 46 84 47H44Q41 47 42 44L61 15Z M61.1 24H66.8L66 35H62Z M61.8 38H66V42H61.8Z",
        )
      );
    if (r === "wellbarrier")
      return (
        wings +
        shape(
          "M43 21 64 13 85 21V32Q85 44 64 51Q43 44 43 32Z M57 24V35Q57 39 64 42Q71 39 71 35V24H67V34L64 37 61 34V24Z",
        )
      );
    return (
      wings +
      shape(
        "M43 21 64 13 85 21V32Q85 44 64 51Q43 44 43 32Z M49 26 64 20 79 26V31L64 25 49 31Z M52 34 64 29 76 34 73 37 64 34 55 38Z",
      )
    );
  }

  const crowns = {
    storage,
    oil,
    gas,
    office,
    geology,
    drilling,
    analysis,
    integrity,
  };
  for (const sector of [
    ...(scope.UGSciHumanSectors || []),
    ...(scope.UGSciEngineeringSectors || []),
  ]) {
    const { id, label, code, motif, roles, crown, cradle } = sector;
    domains.push({ id, label, code, motif, roles });
    crowns[id] = crown;
    cradles[id] = cradles[cradle] || cradles.storage;
  }
  const byId = new Map(domains.map((domain) => [domain.id, domain]));

  const shells = [
    { id: "auto", label: "跟随领域" },
    { id: "round", label: "圆弧" },
    { id: "faceted", label: "切角" },
    { id: "shield", label: "盾形" },
    { id: "industrial", label: "机甲" },
  ];
  const customFrames = {
    round: shape(
      "M15 59Q15 50 23 50H30V71Q30 93 51 94H77Q98 93 98 71V50H105Q113 50 113 59V73C113 94 99 110 80 110H48C29 110 15 94 15 73Z",
    ),
    faceted: shape(
      "M15 59 24 49H31V74L44 90H84L97 74V49H104L113 59V79L91 106H37L15 79Z",
    ),
    shield: shape(
      "M18 59 23 52 32 49V74Q32 82 43 87L64 96 85 87Q96 82 96 74V49L105 52 110 59V77Q110 91 95 99L64 115 33 99Q18 91 18 77Z",
    ),
    industrial: shape(
      "M15 54 20 49H31V77L36 84 45 91H83L92 84 97 77V49H108L113 54V81L104 96 91 104H82L78 110H50L46 104H37L24 96 15 81Z M19 57H27V61H19Z M19 66H27V70H19Z M101 57H109V61H101Z M101 66H109V70H101Z",
    ),
  };

  const badges = [
    { id: "none", label: "无徽记" },
    { id: "analysis", label: "数据分析" },
    { id: "teaching", label: "教学培训" },
    { id: "research", label: "科研实验" },
    { id: "coding", label: "软件开发" },
    { id: "safety", label: "安全审查" },
    { id: "documents", label: "文档写作" },
    { id: "planning", label: "项目管理" },
    { id: "operations", label: "现场运维" },
    { id: "collaboration", label: "协同沟通" },
    { id: "design", label: "创意设计" },
  ];
  const stamps = {
    analysis:
      rect(8, 18, 4.5, 7, 1) +
      rect(15.5, 12.5, 4.5, 12.5, 1) +
      rect(23, 8, 4.5, 17, 1),
    teaching: shape(
      "M6.5 9Q13 7.8 18 12Q23.5 7.8 29.5 9V23.7Q23.4 22.4 18 26.5Q12.8 22.4 6.5 23.7Z M9.8 12V20.5Q13 20.4 16.4 22.3V14.2Q13.4 12 9.8 12Z M19.6 14.2V22.3Q23 20.4 26.2 20.5V12Q22.6 12 19.6 14.2Z",
    ),
    research: line(
      "M14 7.9H22M15.6 8.5V14.5L8.8 25Q8.1 26.6 10.4 27H25.6Q27.9 26.6 27.2 25L20.4 14.5V8.5M12.4 21.5H23.6",
      2.9,
    ),
    coding: line("M13 11 6.9 18 13 25M23 11 29.1 18 23 25M20.5 9 16 27", 3.1),
    safety:
      line(
        "M18 6.8 27.7 10.7V16.8Q27.7 23.6 18 28.7Q8.3 23.6 8.3 16.8V10.7Z",
        2.8,
      ) + line("M12.7 17.4 16.5 20.9 23 14.3", 3),
    documents: line(
      "M10 7.8H20.8L26 13V27.3H10Z M20 8.3V14H25.3M14 18.5H21.8M14 23H20",
      2.75,
    ),
    planning:
      line("M10 28V8.4", 3.3) +
      shape("M11.7 8.5H26.8L22.7 13.7 26.8 18.7H11.7Z"),
    operations: shape(
      "M25.4 7.3C19.2 5.2 14 10.4 15.1 15.6L7.7 23.1Q5.9 25.4 8.1 27.6Q10.3 29.8 12.6 28L20.1 20.6C25.7 21.8 30.8 16.5 28.2 10.4L23.2 15.3 19.8 12.4Z",
    ),
    collaboration: line(
      "M7.3 8.8H21.5Q23.1 8.8 23.1 10.6V17.9Q23.1 19.8 21.2 19.8H14.4L9.5 24.2V19.8H8.2Q6.8 19.8 6.8 18.1V10.7Q6.8 9.4 7.3 8.8Z M27.7 14V23Q27.7 24.3 26.4 24.3H24V28.2L18.4 24.3H15.9",
      2.8,
    ),
    design: shape(
      "M7.8 27.8 10.2 17.6 22.6 7.2 29 13.8 18 25.6Z M14 18.9 12.9 23.2 17 21.9 24.1 14.1 21.8 11.9Z",
    ),
  };
  let clipNumber = 0;
  function addStamp(body, badge, colorPart, clipId) {
    // A per-instance clipping path removes actual ink behind the stamp in both themes.
    const id = clipId || "ugsci-stamp-" + (++clipNumber).toString(36);
    const cutout = "M0 0H128V128H0Z M77 95a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z";
    return (
      '<defs><clipPath id="' +
      id +
      '"><path clip-rule="evenodd" d="' +
      cutout +
      '"/></clipPath></defs>' +
      '<g clip-path="url(#' +
      id +
      ')">' +
      body +
      '</g><g transform="translate(79 77)">' +
      colorPart("badge_ring", ring(18, 18, 15.9, 3.4)) +
      colorPart("badge", stamps[badge]) +
      "</g>"
    );
  }

  const eyeCuts = {
    focused:
      "M49 65a3.7 3.7 0 0 1 7.4 0v9.1a3.7 3.7 0 0 1-7.4 0Z M71.6 65a3.7 3.7 0 0 1 7.4 0v9.1a3.7 3.7 0 0 1-7.4 0Z",
    friendly:
      "M46.2 71.4q6.2-13 12.5 0l-3.2 2.5q-3-5.8-6.1 0Z M69.3 71.4q6.2-13 12.5 0l-3.2 2.5q-3-5.8-6.1 0Z",
    thinking:
      "M46.3 66.2 57.1 63l1.3 5.1-10.8 3.2Z M71.6 66a3.7 3.7 0 0 1 7.4 0v7.5a3.7 3.7 0 0 1-7.4 0Z",
  };
  const visors = {
    classic: "M46 55H78L92 66V75Q92 86 82 86H46Q36 86 36 76V65Q36 55 46 55Z",
    soft: "M57 55H75L89 64Q94 68 90 75Q83 86 66 88Q47 88 39 80Q32 72 38 63Q44 55 57 55Z",
    angular: "M44 55H77L92 65V77L82 86H46L36 77V63Z",
  };
  function escapeName(value, fallback) {
    if (typeof value !== "string") return fallback;
    const cleaned = Array.from(
      value
        .replace(/[\u0000-\u001f\u007f-\u009f\ud800-\udfff\ufffe\uffff]/gu, " ")
        .trim(),
    )
      .slice(0, 64)
      .join("");
    const escaped = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return cleaned.replace(/[&<>"']/g, (c) => escaped[c]) || fallback;
  }
  function render(options) {
    const o = options && typeof options === "object" ? options : {};
    const domain = byId.get(o.domain) || domains[0];
    const selected =
      domain.roles.find((r) => r.id === o.role) || domain.roles[0];
    const exp = Object.prototype.hasOwnProperty.call(eyeCuts, o.expression)
      ? o.expression
      : "focused";
    const dark = o.polarity === "dark",
      ink =
        o.foreground === "currentColor"
          ? "currentColor"
          : dark
          ? "#ffffff"
          : "#171717",
      paper = dark ? "#171717" : "#ffffff";
    const colors = o.colors && typeof o.colors === "object" ? o.colors : {};
    const partColor = (part, fallback) => {
      const value = colors[part];
      if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value))
        return value;
      if ((part === "eyes" || part === "background") && value === "transparent")
        return "transparent";
      return fallback;
    };
    const colorPart = (part, artwork, fallback = ink) => {
      const color = partColor(part, fallback);
      return (
        '<g data-avatar-part="' +
        part +
        '" fill="' +
        color +
        '" color="' +
        color +
        '">' +
        artwork +
        "</g>"
      );
    };
    const size =
      Number.isFinite(Number(o.size)) && Number(o.size) > 0
        ? Math.max(16, Math.min(4096, Math.round(Number(o.size))))
        : 512;
    const face = Object.prototype.hasOwnProperty.call(visors, o.visor)
      ? visors[o.visor]
      : visors.classic;
    const title = escapeName(o.name, selected.label);
    const crownDomain = byId.get(o.crownDomain) || domain;
    const crownRole =
      crownDomain.roles.find((r) => r.id === o.crownRole) ||
      (crownDomain === domain ? selected : crownDomain.roles[0]);
    const hasFrame = Object.prototype.hasOwnProperty.call(
      customFrames,
      o.shell,
    );
    const frame = hasFrame ? customFrames[o.shell] : shape(cradles[domain.id]);
    const sleeves =
      !hasFrame && domain.id === "gas"
        ? rect(15, 52, 18, 4.8, 1) + rect(95, 52, 18, 4.8, 1)
        : "";
    const background = partColor(
      "background",
      o.background === "transparent" ? "transparent" : paper,
    );
    const bg =
      background === "transparent"
        ? ""
        : '<rect data-avatar-part="background" width="128" height="128" fill="' +
          background +
          '"/>';
    let body =
      colorPart("crown", crowns[crownDomain.id](crownRole.id)) +
      colorPart("shell", frame + sleeves) +
      colorPart("visor", shape(face + eyeCuts[exp])) +
      colorPart("eyes", shape(eyeCuts[exp]), "transparent");
    if (Object.prototype.hasOwnProperty.call(stamps, o.badge))
      body = addStamp(body, o.badge, colorPart, o.clipId);
    const customCategory = escapeName(o.categoryLabel, "");
    const description = customCategory
      ? "<desc>所属领域 · " + customCategory + "</desc>"
      : "";
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 128 128" role="img" aria-label="' +
      title +
      '"><title>UGSci · ' +
      title +
      "</title>" +
      description +
      bg +
      '<g fill="' +
      ink +
      '" color="' +
      ink +
      '">' +
      body +
      "</g></svg>"
    );
  }

  const api = { domains, shells, badges, render };
  scope.AvatarKit = api;
})(avatarScope);

export const avatarKit = avatarScope.AvatarKit;
