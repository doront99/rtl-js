rtl-js
======

Right To Left Text Convert.

Usage
======
  // Create Instance
  var pBidi = new bidi();
  
  // Use LtrToRtl function to convert the text.
  // Use pBidi.CL_ME to make RTL as the default paragraph direction.
  pBidi.LtrToRtl(str, str.length, pBidi.CL_ME)
