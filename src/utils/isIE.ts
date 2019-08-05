function isIE() {
   const ua = navigator.userAgent;
   return /Trident|MSIE/.test(ua);
}

export default isIE;
