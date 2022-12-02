// copied from https://stackoverflow.com/a/6338207/536607 like a real programmer
function pasteFromClipboard(e) {
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
    
    // 4:3 ratio 13xx
    var crop1 = src_ctx.getImageData(226, 126, 450, 450)
    var crop2 = src_ctx.getImageData(684, 126, 450, 450)
    
    // 
    
    var data1 = crop1.data
    var data2 = crop2.data
    for (var i = 0; i < data1.length; i+=4) {
      if (data1[i] == data2[i] && data1[i+1] == data2[i+1] && data1[i+2] == data2[i+2] && data1[i+3] == data2[i+3]) {
        data2[i] = 0
        data2[i+1] = 0
        data2[i+2] = 0
      }
    }
    
    dest_canvas1.width = 450
    dest_canvas1.height = 450
    dest_ctx1.putImageData(crop1, 0, 0);
        
    dest_canvas2.width = 450
    dest_canvas2.height = 450
    dest_ctx2.putImageData(crop2, 0, 0);
    
    var progress = document.getElementById("progress");
    progress.innerHTML = ""
  }
}

(function() {
  
  document.addEventListener('paste', e=>pasteFromClipboard(e));
  
  var button = document.getElementById("upload");
  button.addEventListener("click", loadImage);
})();