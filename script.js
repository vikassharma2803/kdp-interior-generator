const { jsPDF } = window.jspdf;

function getSize(size) {
  if (size === "6x9") return [152.4, 228.6];
  if (size === "7x10") return [177.8, 254];
  if (size === "8.5x11") return [215.9, 279.4];
}

function getMargins() {
  const marginType = document.getElementById("marginType").value;
  const pages = parseInt(document.getElementById("pages").value);

  if (marginType === "standard") {
    return {
      top: 12.7,
      bottom: 12.7,
      outside: 12.7,
      inside: pages <= 150 ? 15.9 : 19
    };
  } else {
    return {
      top: parseFloat(document.getElementById("marginTop").value),
      bottom: parseFloat(document.getElementById("marginBottom").value),
      outside: parseFloat(document.getElementById("marginOutside").value),
      inside: parseFloat(document.getElementById("marginInside").value)
    };
  }
}

document.getElementById("marginType").addEventListener("change", () => {
  const isCustom = document.getElementById("marginType").value === "custom";
  document.getElementById("customMargins").style.display = isCustom ? "block" : "none";
});

function generatePDF() {

  const size = document.getElementById("size").value;
  const type = document.getElementById("type").value;
  const pages = parseInt(document.getElementById("pages").value);
  const spacing = parseFloat(document.getElementById("spacing").value);
  const bleed = document.getElementById("bleed").value;

  let [width, height] = getSize(size);

  // Bleed adds extra space
  if (bleed === "yes") {
    width += 6.35;
    height += 6.35;
  }

  const doc = new jsPDF({
    unit: "mm",
    format: [width, height]
  });

  const margins = getMargins();

  for (let p = 0; p < pages; p++) {

    const isEven = p % 2 === 1;

    const leftMargin = bleed === "yes" ? 0 : (isEven ? margins.outside : margins.inside);
    const rightMargin = bleed === "yes" ? 0 : (isEven ? margins.inside : margins.outside);
    const topMargin = bleed === "yes" ? 0 : margins.top;
    const bottomMargin = bleed === "yes" ? 0 : margins.bottom;

    const usableWidth = width - leftMargin - rightMargin;
    const usableHeight = height - topMargin - bottomMargin;

    const cols = Math.floor(usableWidth / spacing);
    const rows = Math.floor(usableHeight / spacing);

    const offsetX = (usableWidth - cols * spacing) / 2;
    const offsetY = (usableHeight - rows * spacing) / 2;

    const startX = leftMargin + offsetX;
    const startY = topMargin + offsetY;

    if (type === "ruled") {
      for (let i = 0; i <= rows; i++) {
        let y = startY + i * spacing;
        doc.line(startX, y, startX + cols * spacing, y);
      }
    }

    if (type === "dotted") {
      for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= cols; j++) {
          let x = startX + j * spacing;
          let y = startY + i * spacing;
          doc.circle(x, y, 0.3, "F");
        }
      }
    }

    if (type === "graph") {
      for (let i = 0; i <= rows; i++) {
        let y = startY + i * spacing;
        doc.line(startX, y, startX + cols * spacing, y);
      }
      for (let j = 0; j <= cols; j++) {
        let x = startX + j * spacing;
        doc.line(x, startY, x, startY + rows * spacing);
      }
    }

    if (p < pages - 1) doc.addPage();
  }

  doc.save("kdp-interior.pdf");
}

/* ================= PREVIEW ================= */

const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

document.querySelectorAll("select, input").forEach(el => {
  el.addEventListener("change", drawPreview);
});

function drawPreview() {

  const size = document.getElementById("size").value;
  const type = document.getElementById("type").value;
  const spacing = parseFloat(document.getElementById("spacing").value);
  const bleed = document.getElementById("bleed").value;

  let [wMM, hMM] = getSize(size);

  if (bleed === "yes") {
    wMM += 6.35;
    hMM += 6.35;
  }

  const scale = 2;

  const width = wMM * scale;
  const height = hMM * scale;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  const margins = getMargins();

  const leftMargin = bleed === "yes" ? 0 : margins.inside * scale;
  const rightMargin = bleed === "yes" ? 0 : margins.outside * scale;
  const topMargin = bleed === "yes" ? 0 : margins.top * scale;
  const bottomMargin = bleed === "yes" ? 0 : margins.bottom * scale;

  const usableWidth = width - leftMargin - rightMargin;
  const usableHeight = height - topMargin - bottomMargin;

  const cols = Math.floor(usableWidth / (spacing * scale));
  const rows = Math.floor(usableHeight / (spacing * scale));

  const offsetX = (usableWidth - cols * spacing * scale) / 2;
  const offsetY = (usableHeight - rows * spacing * scale) / 2;

  const startX = leftMargin + offsetX;
  const startY = topMargin + offsetY;

  if (type === "ruled") {
    for (let i = 0; i <= rows; i++) {
      let y = startY + i * spacing * scale;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + cols * spacing * scale, y);
      ctx.stroke();
    }
  }

  if (type === "graph") {
    for (let i = 0; i <= rows; i++) {
      let y = startY + i * spacing * scale;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + cols * spacing * scale, y);
      ctx.stroke();
    }

    for (let j = 0; j <= cols; j++) {
      let x = startX + j * spacing * scale;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + rows * spacing * scale);
      ctx.stroke();
    }
  }

  if (type === "dotted") {
    for (let i = 0; i <= rows; i++) {
      for (let j = 0; j <= cols; j++) {
        let x = startX + j * spacing * scale;
        let y = startY + i * spacing * scale;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

drawPreview();
