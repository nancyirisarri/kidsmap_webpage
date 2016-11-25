// Handler for mouse double clicks and click on addButton img.
function addToFile() {

  document.getElementById('resultAdd').innerHTML = '';
  document.getElementById('resultSave').innerHTML = '';

  if (fileList.indexOf(obName) == -1) {
    fileList[fileList.length] = obName;
    document.getElementById('resultAdd').style.color = 'black';
    document.getElementById('resultAdd').innerHTML = obName + ' added to list' + '<br>';
    document.getElementById('showButton').innerHTML = '<span style="cursor:pointer"><img src="expandButton.jpg" width="20" height="20" border="0" alt="show" title="Show list"></span> Show list contents'
    document.getElementById('resultShow').innerHTML = '';
    document.getElementById('resultShow').style.height = resultHeight;
  } else {
    document.getElementById('resultAdd').style.color = 'red';
    document.getElementById('resultAdd').innerHTML = obName + ' already in list' + '<br>';
  }
}

// Handler for mouse right click and click on expandButton img.
function showFile() {

  document.getElementById('resultShow').innerHTML = '';
  document.getElementById('resultSave').innerHTML = '';
  document.getElementById('showButton').innerHTML = '<img src="expandButton.jpg" width="20" height="20" border="0" alt="show" > List contents'

  if (fileList.length > 0) {
    document.getElementById('resultShow').style.color = 'black';
    document.getElementById('resultAdd').innerHTML = '';

    for (i = 0; i < fileList.length; i++) {
      document.getElementById('resultShow').innerHTML += fileList[i];
      document.getElementById('resultShow').innerHTML += '<br>';
    }

    document.getElementById('resultShow').style.height = '75px';
    document.getElementById('resultShow').style.overflowY = 'auto';

  } else {
    document.getElementById('resultShow').style.color = 'red';
    document.getElementById('resultShow').innerHTML = 'No contents' + '<br>';
    document.getElementById('resultShow').style.height = '20px';
  }
}

// Handler for mouse click on saveButton img.
function saveFile() {

  if (fileList.length > 0) {

    var isChromium = window.chrome, vendorName = window.navigator.vendor;

    if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.") {
    // Is Google chrome. Does not work on FireFox.
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileList));
      pom.setAttribute('download', 'kidsMap.txt');
      pom.click();

    } else {
    // Not Google chrome.
      var blob = new Blob([fileList], {type: 'text/plain;charset=utf-8'}); // pass a useful mime type here
      var url = URL.createObjectURL(blob);
      newWindow = window.open(url, 'KiDS Map Tile List');
    }

  } else {
    document.getElementById('resultSave').style.color = 'red';
    document.getElementById('resultShow').innerHTML = '';
    document.getElementById('resultSave').innerHTML = 'No contents to save';
    document.getElementById('showButton').innerHTML = '<span style="cursor:pointer"><img src="expandButton.jpg" width="20" height="20" border="0" alt="show" title="Show list"></span> Show list contents'
    document.getElementById('resultShow').style.height = resultHeight;
  }
}
