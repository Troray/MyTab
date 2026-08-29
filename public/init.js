try {
  var mode = localStorage.getItem('mytab_theme_mode');
  if (mode === 'dark') document.documentElement.classList.add('dark');
  
  var bg = localStorage.getItem('mytab_bg_cache');
  if (bg) {
    var style = document.createElement('style');
    style.innerHTML = 'body { ' + bg + ' background-size: cover; background-position: center; background-repeat: no-repeat; margin: 0; }';
    document.head.appendChild(style);
  }
} catch(e) {}
