const { jsPDF } = window.jspdf;

function getSize(size) {
  if (size === "6x9") return [152.4, 228.6];
  if (size === "7x10") return [177.8, 254];
  if (size === "8.5x11") return [215.9, 279.4];
}

function generatePDF() {

  const size = document.getElementById("size").value;
  const type = document.getElementById("type").value;
  const pages = parseInt(document.getElementById("pages").value);
  const spacing = parseFloat(document.getElementById("spacing").value);

  const [width, height] = getSize(size);

  const doc = new jsPDF({
    unit: "mm",
    format: [width, height]
  });

  const margin = 15;

  for (let p = 0; p < pages; p++) {

    if (type === "ruled") {
      for (let y = margin; y < height - margin; y += spacing) {
        doc.line(margin, y, width - margin, y);
      }
    }

    if (type === "dotted") {
      for (let y = margin; y < height - margin; y += spacing) {
        for (let x = margin; x < width - margin; x += spacing) {
          doc.circle(x, y, 0.3, "F");
        }
      }
    }

    if (type === "graph") {
      for (let y = margin; y < height - margin; y += spacing) {
        doc.line(margin, y, width - margin, y);
      }
      for (let x = margin; x < width - margin; x += spacing) {
        doc.line(x, margin, x, height - margin);
      }
    }

    // blank = no drawing

    if (p < pages - 1) doc.addPage();
  }

  doc.save("kdp-interior.pdf");
}
