const packager = require("electron-packager");
const path = require("path");
const fs = require("fs/promises");

async function build(config) {
	const appPaths = await packager({
		dir: ".",
		out: "dist",
		overwrite: true,
		name: "无名杀",
		appVersion: "1.9.0",
		electronVersion: "33.2.0",
		ignore: ["build.js", "noname"],
		...config,
	});

	try {
		await fs.access("noname");
		for (const appPath of appPaths) {
			await fs.cp("noname", path.join(appPath, "resources", "app"), {
				filter: (src) => !(src === path.join("noname", "package.json")),
				recursive: true,
			});
		}
	} catch (e) {
		console.log("noname目录下未放置完整包，请打包完后手动覆盖。")
	}
	console.log("打包完成:", appPaths);

}

switch (process.argv[2]) {
	case "win64":
		build({
			platform: "win32",
			arch: "x64",
			icon: "noname.ico",
		});
		break;
	case "win32":
		build({
			platform: "win32",
			arch: "ia32",
			icon: "noname.ico",
		});
		break;
	case "linux":
		build({
			platform: "linux",
			arch: "x64",
			icon: "noname.ico",
		});
		break;
	case "darwin":
		build({
			platform: "darwin",
			arch: "arm64",
			icon: "noname.icns",
		});
		break;
	case "darwin_intel":
		build({
			platform: "darwin",
			arch: "x64",
			icon: "noname.icns",
		});
		break;
	default:
		console.log("未知平台:", process.argv[2]);
}
