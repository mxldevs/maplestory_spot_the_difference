var overlay;
var overlayIndices;
var type = 0;
var intervalId = 0;

function pasteFromClipboard(e) {
  // copied from https://stackoverflow.com/a/6338207/536607 like a real programmer  
  var progress = document.getElementById("progress");
  progress.innerHTML = "Loading"
  var items = e.clipboardData.items;
  for (var index in items) {
    var item = items[index];        
    if (item.kind === 'file') {
      var blob = item.getAsFile();
      var reader = new FileReader();
      reader.onload = function (ev) {
        loadImage(ev.target.result)        
      }; 
      reader.readAsDataURL(blob);
    }
  }
}

function loadImage(data) {  
  var src_canvas = document.getElementById("image_src")    
  var dest_canvas1 = document.getElementById("image_target1")  
  var dest_canvas2 = document.getElementById("image_target2")  
  
  var img = new Image();    
  img.src = data
  
  img.onload = function() {        
    var src_ctx = src_canvas.getContext("2d");    
    var dest_ctx1 = dest_canvas1.getContext("2d");
    var dest_ctx2 = dest_canvas2.getContext("2d");
    
    src_canvas.width = img.width;
    src_canvas.height = img.height;
    src_ctx.drawImage(img, 0, 0);    
    
    // on 4K monitors, windows scales everything up by 50% automatically.
    // users can also scale things up manually in their display settings,
    // so this tries to account for it. 100% is normal scale, and users
    // can choose 125%, 150%, 175%, or 200% scale. All coordinates and dimensions
    // must be adjusted to scale
    var scale;
    
    // All windows have an optional title bar, and then the client area underneath.
    // For windowed mode, the title bar is 32 pixels. For full-screen, the title bar is removed
    // It's possible that the title bar may be removed in other circumstances, so we must
    // apply a Y-offset to account for this.
    var y_ofs;
    
    // The game automatically sets to 1366x768 resolution. At 100% scale, this is OK.
    // At 150% scale, assuming windowed mode, we will have (768px + 32px) * 1.5 = 1200px
    
    // TO-DO: calculate scale based on provided height to support 125%, 175%, 200%
    // problem is, I don't know how to determine whether there is a title bar or not
    
    // 150% scale
    if (img.height == 1200) {
      scale = 1.5
      y_ofs = (img.height / scale) - 768
    }   
    // 100% scale
    else {
      scale = 1.0
      y_ofs = img.height - 768;    
    }
    
    // top left corner of the left pic and right pic frame
    var x1 = 226 * scale
    var x2 = 684 * scale
    var y1 = (94 + y_ofs) * scale
    var y2 = (94 + y_ofs) * scale
    var width = 450 * scale
    var height = 450 * scale

    var crop1 = src_ctx.getImageData(x1, y1, width, height)
    var crop2 = src_ctx.getImageData(x2, y2, width, height)
    
    // this overlay is just a copy of the left image, with the differing pixels modified
    // so pretty lazy
    overlay = src_ctx.getImageData(x1, y2, width, height);    
    
    var data1 = crop1.data
    var data2 = crop2.data
    var overlayData = overlay.data    
    
    overlayIndices = []
    for (var i = 0; i < data1.length; i+=4) {
      if (data1[i] == data2[i] && data1[i+1] == data2[i+1] && data1[i+2] == data2[i+2] && data1[i+3] == data2[i+3]) {
        data2[i] = 0
        data2[i+1] = 0
        data2[i+2] = 0
      }
      else {
        overlayIndices.push(i)        
      }
    }
            
    dest_canvas1.width = width
    dest_canvas1.height = height
    dest_ctx1.putImageData(crop1, 0, 0);        
        
    dest_canvas2.width = width
    dest_canvas2.height = height
    dest_ctx2.putImageData(crop2, 0, 0);
    
    var progress = document.getElementById("progress");
    progress.innerHTML = ""
    
    clearInterval(intervalId)
    intervalId = setInterval(applyOverlay, 250);
  }
}

// provides a visual indicator over the left image which should
// help with locating where the difference is.
function applyOverlay() {
  if (overlay == undefined) {
    return
  }
  
  // alternate colours 
  var r, g, b  
  if (type == 0) {
    r = 255
    g = 0
    b = 0
    type = 1
  }
  else if (type == 1) {
    r = 0
    g = 255
    b = 0
    type = 2
  }
  else if (type == 2) {
    r = 0
    g = 0
    b = 255
    type = 0
  }
  
  // TO-DO maybe it's possible to group pixels together into a box and then
  // draw a circle over it instead of just highlighting the differences
  // but I'm not sure how to do that efficiently
  var overlayData = overlay.data
  for (var j = 0; j < overlayIndices.length; j++) {
    var i = overlayIndices[j]
    overlayData[i] = r
    overlayData[i+1] = g
    overlayData[i+2] = b
    overlayData[i+3] = 255
  }
  
  var dest_canvas1 = document.getElementById("image_target1")  
  var dest_ctx1 = dest_canvas1.getContext("2d");
  dest_ctx1.putImageData(overlay, 0, 0)
}


(function() {
  
  document.addEventListener('paste', e=>pasteFromClipboard(e));
})();