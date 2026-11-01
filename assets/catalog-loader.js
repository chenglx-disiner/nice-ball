/* HTTP previews use ordinary same-origin images; file previews retain the offline catalogue. */
if(location.protocol==='file:'){
 document.write('<script src="assets/catalog.js"><\/script>');
}else{
 window.nbAssetData=Object.create(null);
}
