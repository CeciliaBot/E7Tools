export default function(filename, json) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", filename + '.json');
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href)
    document.body.removeChild(a);
}