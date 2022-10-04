window.MathJax = {
    loader: {load: ['[tex]/mhchem']},
    tex: {
      inlineMath: [["\\(", "\\)"]],
      displayMath: [["\\[", "\\]"]],
      processEscapes: true,
      processEnvironments: true,
      packages: {'[+]': ['mhchem']}
    },
    options: {
      ignoreHtmlClass: ".*|",
      processHtmlClass: "arithmatex"
    },
  };
  
  document$.subscribe(() => { 
    MathJax.typesetPromise()
  })
  