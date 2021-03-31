var depth;
var treeArray;
var table;
var activeTab;

// called when "Enter depth" clicked
// clears and generates table if depth is valid
function depthEntered() {
  depth = document.getElementById("depth_form").value;
  if (depth != "" && !isNaN(depth) && depth >= 0) {
    if (depth > 6) {
      document.getElementById("depth_error_text").innerHTML =
        "Depth <=6 pls :(";
    } else {
      clearTable();
      document.getElementById("depth_error_text").innerHTML = "";
      document.getElementById("negative_warning_text").innerHTML = "";
      generateInputTable();
    }
  } else {
    document.getElementById("depth_error_text").innerHTML =
      "Depth must be a non-negative integer.";
  }
}

function clearTable() {
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
}

function resetTable() {
  switch (activeTab) {
    case "sml":
      table = document.getElementById("output_table");
      break;
    default:
      table = document.getElementById("input_table");
  }
  clearTable();
  let row = table.insertRow();
  let cell = row.insertCell();
  var text = document.createTextNode("Node table will appear here");
  cell.appendChild(text);
}

function resetPage() {
  resetTable();
  if (activeTab.localeCompare("sml") != 0) {
    document.getElementById("table_warning_text").innerHTML = "";
    document.getElementById("negative_warning_text").innerHTML = "";
    document.getElementById("sml_output_text").innerHTML =
      "~SML Text will appear here~";
  }
}

function createUIBFunction(i, j) {
  return function () {
    uncolorInputBorder(i, j);
  };
}

function createDLIFunction(i, j) {
  return function () {
    disableLeafInput(i, j);
  };
}

function createELIFunction(i, j) {
  return function () {
    enableLeafInput(i, j);
  };
}

function uncolorInputBorder(i, j) {
  var cellij = document.getElementById("cell" + i + j);
  colorCell(cellij, "base");
}

function disableLeafInput(i, j) {
  document.getElementById("leaf_value" + i + j).disabled = true;
}

function enableLeafInput(i, j) {
  document.getElementById("leaf_value" + i + j).disabled = false;
}

function colorCell(cell, color) {
  cell.classList.remove("base-cell");
  cell.classList.remove("valid-cell");
  switch (color) {
    case "base":
      cell.classList.add("base-cell");
      break;
    case "valid":
      cell.classList.add("valid-cell");
      break;
  }
}

function newTreeCell(i, j) {
  var input = document.createElement("input");
  input.type = "text";
  input.size = "5";
  input.id = "cell" + i + j;
  input.placeholder = "value";
  colorCell(input, "base");
  input.onchange = createUIBFunction(i, j);
  return input;
}

function newShrubCell(i, j) {
  // create div container
  var div = document.createElement("div");
  div.id = "cell" + i + j;
  div.classList.add("left-inner");
  div.classList.add("shrub-div");
  div.align = "left";
  colorCell(div, "base");

  // if not last level, cell has Node or Leaf option
  if (i < depth - 1) {
    // create Node radio button
    var nodeBtn = document.createElement("input");
    nodeBtn.type = "radio";
    nodeBtn.id = "node_btn" + i + j;
    nodeBtn.name = "radio" + i + j;
    div.appendChild(nodeBtn);

    div.innerHTML += "Branch<br/>";

    // create Leaf radio button
    var leafBtn = document.createElement("input");
    leafBtn.type = "radio";
    leafBtn.id = "leaf_btn" + i + j;
    leafBtn.name = "radio" + i + j;
    div.appendChild(leafBtn);
  }

  div.innerHTML += "Leaf: ";
  var leafValue = document.createElement("input");
  leafValue.type = "text";
  leafValue.size = "5";
  leafValue.id = "leaf_value" + i + j;
  leafValue.placeholder = "value";

  div.appendChild(leafValue);

  return div;
}

function generateInputTable() {
  if (depth == 0) {
    let row = table.insertRow();
    let cell = row.insertCell();
    cell.innerHTML = "Zero depth";
  } else {
    for (var i = 0; i < depth; i++) {
      let row = table.insertRow();
      for (var j = 0; j < Math.pow(2, i); j++) {
        var cell = row.insertCell();
        cell.colSpan = Math.pow(2, depth - 1 - i);
        cell.align = "center";
        switch (activeTab) {
          case "tree":
            cell.appendChild(newTreeCell(i, j));
            break;
          case "shrub":
            cell.appendChild(newShrubCell(i, j));
            if (i < depth - 1) {
              document.getElementById(
                "node_btn" + i + j
              ).onchange = createUIBFunction(i, j);
              document.getElementById(
                "node_btn" + i + j
              ).onclick = createDLIFunction(i, j);
              document.getElementById(
                "leaf_btn" + i + j
              ).onchange = createUIBFunction(i, j);
              document.getElementById(
                "leaf_btn" + i + j
              ).onclick = createELIFunction(i, j);
            }
            break;
        }
      }
    }
  }
}

function treeTextHelper(i, j) {
  if (depth == null || depth == "") {
    return "Enter depth first, please!";
  }
  if (i == depth) {
    // shouldn't be possible for shrubs
    return "Empty";
  }
  var cellij = document.getElementById("cell" + i + j);
  switch (activeTab) {
    case "tree":
      if (cellij.value == "") return "Empty";
      colorCell(cellij, "valid");
      if (cellij.value.includes("-")) {
        document.getElementById("negative_warning_text").innerHTML =
          "Warning: Negative sign used instead of ~";
      }
      return (
        "Node(" +
        treeTextHelper(i + 1, j * 2) +
        "," +
        cellij.value +
        "," +
        treeTextHelper(i + 1, j * 2 + 1) +
        ")"
      );
      break;
    case "shrub":
      // leaf cell
      if (
        i == depth - 1 ||
        document.getElementById("leaf_btn" + i + j).checked
      ) {
        var leafValueij = document.getElementById("leaf_value" + i + j);
        colorCell(cellij, "valid");
        if (leafValueij.value == "")
          document.getElementById("table_warning_text").innerHTML =
            "Warning: Empty leaf value";
        if (leafValueij.value.includes("-")) {
          document.getElementById("negative_warning_text").innerHTML =
            "Warning: Negative sign used instead of ~";
        }
        return "Leaf(" + leafValueij.value + ")";
      }
      // node cell
      if (document.getElementById("node_btn" + i + j).checked) {
        colorCell(cellij, "valid");
        return (
          "Branch(" +
          treeTextHelper(i + 1, j * 2) +
          "," +
          treeTextHelper(i + 1, j * 2 + 1) +
          ")"
        );
      }

      if (i == 0) {
        return "Empty";
      } else {
        throw "Node without valid children";
      }
  }
}

function generateText() {
  document.getElementById("table_warning_text").innerHTML = "";
  document.getElementById("negative_warning_text").innerHTML = "";
  for (var i = 0; i < depth; i++) {
    for (var j = 0; j < Math.pow(2, i); j++) {
      uncolorInputBorder(i, j);
    }
  }
  var text;
  try {
    text = treeTextHelper(0, 0);
  } catch (e) {
    console.log(e);
    text = "Node must have 2 valid children.";
  }
  document.getElementById("sml_output_text").innerHTML = text;
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabContent, tabLinks, toSMLContent, fromSMLContent;
  activeTab = tabName;
  depth = null;

  // Get all elements with class="tab-content" and hide them
  tabContent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Get all elements with class="tab-links" and remove the class "active"
  tabLinks = document.getElementsByClassName("tab-links");
  for (i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active", "");
  }
  evt.currentTarget.className += " active";

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";

  toSMLContent = document.getElementById("to_sml_content");
  fromSMLContent = document.getElementById("from_sml_content");

  if (tabName.localeCompare("sml")) {
    toSMLContent.style.display = "block";
    fromSMLContent.style.display = "none";
  } else {
    toSMLContent.style.display = "none";
    fromSMLContent.style.display = "block";
  }
  resetPage();
}

const depthForm = document.getElementById("depth_form");
depthForm.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    document.getElementById("enter_depth_btn").onclick();
  }
});
const smlForm = document.getElementById("sml_form");
smlForm.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    document.getElementById("generate_tree_btn").onclick();
  }
});

document.getElementById("default_open").click();
