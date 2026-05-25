const rawHindiMock = "1 आदि में... 10 परमेश्वर ने सूखी भूमि को... 31 तब परमेश्वर ने...";
const parts = rawHindiMock.split(/(\d+)\s+/);

const parsedRows = [];
if (parts.length > 1) {
    let currentVerse = 0;
    let currentText = "";
    for (let i = 0; i < parts.length; i++) {
        if (parts[i].match(/^\d+$/) && parseInt(parts[i], 10) < 200) {
            if (currentText.trim().length > 0) {
                parsedRows.push({ v: currentVerse, t: currentText.trim() });
                currentText = "";
            }
            currentVerse = parseInt(parts[i], 10);
        } else {
            currentText += parts[i] + " ";
        }
    }
    if (currentText.trim().length > 0) {
        parsedRows.push({ v: currentVerse, t: currentText.trim() });
    }
}

console.log("Tokens Parsed:", parsedRows);
