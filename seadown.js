// ==UserScript==
// @name Download all files (one-click) from Tsinghua seafile sharing link
// @description Files from Tsinghua seafile cloud sharing link may not be downloaded with one click because the file directory exceeds the limit. This script overcomes this shortcoming and realizes one-click download.
// @copyright 2023, lixc21 (https://github.com/lixc21/)
// @license MIT
// @homepageURL https://github.com/lixc21/Seafile-Sharing-Link-Downloader
// @supportURL https://github.com/lixc21/Seafile-Sharing-Link-Downloader
// @contributionURL https://github.com/lixc21/Seafile-Sharing-Link-Downloader
// @version 1
// @namespace https://github.com/lixc21/
// @updateURL https://openuserjs.org/meta/lixc21/My_Script.meta.js
// @author lixc21
// @include https://cloud.tsinghua.edu.cn/d/*
// @require https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// @grant none
// ==/UserScript==
 
(function () {
'use strict';

// global variables
var cloudDomain = "https://cloud.tsinghua.edu.cn";
var sharingLinkID = window.shared.pageOptions.token;
var filePath = [];
var dirMain = window.shared.pageOptions.dirName;
var dirPath = [];
var zip = new JSZip();
var info = document.getElementsByClassName("shared-dir-view-main")[0];

// get file and dir list, then download all and save
function getList(path) {
	var url = cloudDomain + "/api/v2.1/share-links/" + sharingLinkID + "/dirents/?path=" + path;
	console.log('request: ' + url);
	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.open('GET', url);
	xmlHttpRequest.onreadystatechange = function () {
	if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
		var rec = JSON.parse(xmlHttpRequest.responseText)["dirent_list"];
		filePath = filePath.concat(rec);
		console.log('request completed. length: ' + rec.length);
		// next file
		for (var index = filePath.length - 1; index >= 0; index--) {
		if (filePath[index]["is_dir"] == true) {
			var nextPath = filePath[index]["folder_path"];
			dirPath = dirPath.concat(filePath[index]["folder_path"]);
			filePath.splice(index, 1);
			getList(nextPath);
			return;
		}
		}
		// list completed, then start download
		console.log(filePath);
		console.log(dirPath);
		for (var index = dirPath.length - 1; index >= 0; index--) {
		zip.folder(dirMain + dirPath[index])
		infoMsg("CREATE FOLDER: " + dirMain + dirPath[index]);
		}
		if (filePath.length > 0) {
		var fileMeta = filePath.pop();
		saveFileZip(fileMeta);
		}
		else {
		zip.generateAsync({
			type: "blob"
			})
			.then(function (blob) {
			saveAs(blob, dirMain + ".zip");
			});
		}

	}
	};
	xmlHttpRequest.send();
}

// download one file in zip
function saveFileZip(fileMeta) {
	var xmlHttpRequest = new XMLHttpRequest();
	var path = fileMeta["file_path"];
	console.log(fileMeta);
	var url = cloudDomain + "/d/" + sharingLinkID + "/files/?p=" + path + "&dl=1";
	xmlHttpRequest.open('GET', url);
	xmlHttpRequest.responseType = 'blob';
	xmlHttpRequest.onload = function () {
	var data = xmlHttpRequest.response;
	zip.file(dirMain + path, data, {
		binary: true
	});
	infoMsg("CREATE FILE: " + dirMain + path);
	// next file
	if (filePath.length > 0) {
		var fileMeta = filePath.pop();
		saveFileZip(fileMeta);
	}
	else {
		zip.generateAsync({
			type: "blob"
		})
		.then(function (blob) {
			saveAs(blob, dirMain + ".zip");
		});
		infoMsg("DONE! DONELOAD *.ZIP FILE.");
	}
	};
	xmlHttpRequest.send();
}

// info
function infoMsg(msg, color = "#777") {
	var div = document.createElement('div');
	div.style = "color: " + color + "; font-size: 10px";
	div.textContent = "[" + Date().toString() + "] " + msg;
	info.prepend(div)
}

// add button
var button = document.createElement('button');
button.type = 'button';
button.innerHTML = 'Super Download';
button.className = 'ml-2 shared-dir-op-btn btn btn-success';
button.onclick = function () {
	getList(window.shared.pageOptions.relativePath);
};
document.getElementsByClassName("d-flex justify-content-between align-items-center op-bar")[0]
	.appendChild(button);

// init info
var div = document.createElement('div');
div.style = "color: #FFF; font-size: 10px; font-weight:bold;";
div.textContent = "#";
info.prepend(div)

var div = document.createElement('div');
div.style = "color: #00F; font-size: 10px; font-weight:bold;";
div.textContent = "NOTICE: This script temporarily stores files in memory.";
info.prepend(div)

var div = document.createElement('div');
div.style = "color: #00F; font-size: 10px; font-weight:bold;";
div.textContent = "Click \"Super Download\" to download all the files in this path.";
info.prepend(div)

var div = document.createElement('div');
div.style = "color: #FFF; font-size: 10px; font-weight:bold;";
div.textContent = "#";
info.prepend(div)
})();
