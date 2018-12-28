const h = require('hyperscript')
function createTestElement() {
  return (
    h("div", ["div1 ", h("span", ["span1"], {"style":"background-color: green;"}), h("span", ["span2"], {"style":"background-color: blue;"})], {"style":"background-color: red;"})
  );
}

document.body.appendChild(createTestElement());