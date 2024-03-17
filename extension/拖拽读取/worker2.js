importScripts('./minizip-asm.min.js');

onmessage = function (e) {
	const [buffer, password] = e.data;
	// @ts-ignore
	const zip = new Minizip(buffer);
	// @ts-ignore
	const newZip = new Minizip();

	zip.list({ encoding: "buffer" }).forEach(function (o, i, arr) {
		newZip.append(o.filepath, zip.extract(o.filepath), { password: password });
		console.log("Processing: " + o.filepath.toString());
		postMessage(`${i}/${arr.length}`);
	});

	postMessage(newZip.zip());
}