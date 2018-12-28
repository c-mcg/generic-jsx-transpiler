function createTestElement() {
  return (
    <div style="background-color: red;">
      div1
      <span style="background-color: green;">span1</span>
      <span style="background-color: blue;">span2</span>
    </div>
  );
}

document.body.appendChild(createTestElement());